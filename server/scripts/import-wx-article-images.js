/**
 * 抓取公众号文章 → 提取正文 HTML → 图片转存到 server/uploads → 写回 content_html
 *
 * Usage:
 *   node scripts/import-wx-article-images.js [articleId] [wechatUrl]
 * Default: articleId=4, url=C0SuRbF6dNl_ZGlbKiwH7w
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const DEFAULT_URL = 'https://mp.weixin.qq.com/s/C0SuRbF6dNl_ZGlbKiwH7w';
const articleId = Number(process.argv[2] || 4);
const WX_URL = process.argv[3] || DEFAULT_URL;
const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.40 NetType/WIFI Language/zh_CN';

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

async function fetchWxHtml() {
  const res = await fetch(WX_URL, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Referer: 'https://mp.weixin.qq.com/',
    },
  });
  if (!res.ok) throw new Error(`fetch html failed: ${res.status}`);
  return res.text();
}

function extractJsContent(html) {
  const start = html.indexOf('id="js_content"');
  if (start < 0) throw new Error('js_content not found');
  const openEnd = html.indexOf('>', start);
  if (openEnd < 0) throw new Error('js_content open tag broken');
  // Find matching close of the content div: first </div> that balances... WeChat content is large;
  // Prefer cutting at known sibling markers.
  const markers = [
    'id="js_tags_preview_toast"',
    'id="content_bottom_area"',
    'id="js_bottom_bar"',
    'class="rich_media_tool"',
    'id="js_cmt_container"',
  ];
  let end = -1;
  for (const m of markers) {
    const i = html.indexOf(m, openEnd);
    if (i > 0) {
      // walk back to previous </div>
      const close = html.lastIndexOf('</div>', i);
      if (close > openEnd) {
        end = close;
        break;
      }
    }
  }
  if (end < 0) {
    // fallback: take a large chunk until next major script after content
    const scriptAfter = html.indexOf('<script', openEnd + 50000);
    end = scriptAfter > 0 ? html.lastIndexOf('</div>', scriptAfter) : openEnd + 200000;
  }
  let raw = html.slice(openEnd + 1, end);
  // Trim trailing closing divs belonging to wrappers
  raw = raw.replace(/(<\/div>\s*)+$/i, '');
  return raw;
}

function extractMeta(html) {
  const title =
    pick(html, /var msg_title = "([^"]*)"/) ||
    pick(html, /<meta property="og:title" content="([^"]*)"/);
  const cover =
    pick(html, /var msg_cdn_url = "([^"]*)"/) ||
    pick(html, /<meta property="og:image" content="([^"]*)"/);
  const author =
    pick(html, /var nickname = htmlDecode\("([^"]*)"\)/) ||
    pick(html, /id="js_name"[^>]*>\s*([^<]+)/);
  const ct = pick(html, /var ct = "(\d+)"/);
  let publishedAt = new Date();
  if (ct) publishedAt = new Date(Number(ct) * 1000);
  return {
    title: decodeEntities(title),
    coverUrl: cover,
    author: decodeEntities((author || '').trim()) || '微信公众号',
    publishedAt,
  };
}

function collectImageUrls(contentHtml, coverUrl) {
  const urls = new Set();
  if (coverUrl) urls.add(coverUrl.split('?')[0] + (coverUrl.includes('?') ? coverUrl.slice(coverUrl.indexOf('?')) : ''));

  const re = /(?:data-src|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(contentHtml))) {
    let u = m[1].trim();
    if (!u || u.startsWith('data:')) continue;
    if (u.startsWith('//')) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) continue;
    if (!/qpic\.cn|mmbiz|wx\.qlogo|sinaimg|qlogo/i.test(u) && !/http/i.test(u)) continue;
    // Prefer wechat / common CDN images
    if (/mmbiz|qpic\.cn|qlogo|sinaimg|cdn/i.test(u) || true) {
      urls.add(u);
    }
  }
  return [...urls];
}

function extFromUrlOrType(url, contentType) {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return '.png';
  if (clean.endsWith('.gif')) return '.gif';
  if (clean.endsWith('.webp')) return '.webp';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return '.jpg';
  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('gif')) return '.gif';
  if (contentType?.includes('webp')) return '.webp';
  return '.jpg';
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: 'https://mp.weixin.qq.com/',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`download fail ${res.status} ${url.slice(0, 80)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrlOrType(url, res.headers.get('content-type') || '');
  const finalPath = destPath.endsWith(ext) ? destPath : destPath + ext;
  fs.writeFileSync(finalPath, buf);
  return { path: finalPath, bytes: buf.length, contentType: res.headers.get('content-type') };
}

function sanitizeContentHtml(html) {
  let out = html;
  // data-src → src (will rewrite URLs later)
  out = out.replace(/\sdata-src=/gi, ' src=');
  // remove scripts/styles/svg noise
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  // visibility hidden on root styles — strip style visibility
  out = out.replace(/\sstyle="visibility:\s*hidden;[^"]*"/gi, '');
  // mp-common-videos etc leave as-is; rich-text may drop unknown tags
  // unwrap section/span leaf noise lightly — keep structure for images/paragraphs
  return out.trim();
}

/** Flatten WeChat nested HTML into p + img for mini-program <rich-text>. */
function simplifyForRichText(html) {
  const decode = (s) =>
    s
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|section|h[1-6]|li|tr|blockquote)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  const parts = [];
  const re = /<img\b[^>]*>/gi;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    const before = decode(html.slice(last, m.index));
    if (before) {
      before.split(/\n\n+/).forEach((block) => {
        const t = block.replace(/\n+/g, '<br/>').trim();
        if (t) parts.push(`<p>${t}</p>`);
      });
    }
    const tag = m[0];
    const src =
      (tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1] ||
      (tag.match(/\bdata-src\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (src && !src.startsWith('data:')) {
      parts.push(
        `<p style="margin:16px 0;text-align:center;"><img src="${src}" style="max-width:100%;height:auto;display:block;margin:0 auto;"/></p>`,
      );
    }
    last = m.index + m[0].length;
  }
  const tail = decode(html.slice(last));
  if (tail) {
    tail.split(/\n\n+/).forEach((block) => {
      const t = block.replace(/\n+/g, '<br/>').trim();
      if (t) parts.push(`<p>${t}</p>`);
    });
  }
  return parts.join('\n');
}

function rewriteImageUrls(html, urlMap) {
  let out = html;
  for (const [remote, local] of urlMap.entries()) {
    // replace all occurrences of exact URL and without query variants
    out = out.split(remote).join(local);
    const noQuery = remote.split('?')[0];
    if (noQuery !== remote) {
      // replace src="noQuery..." patterns carefully via regex
      const esc = noQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(esc + '[^"\'\\s>]*', 'g'), local);
    }
  }
  return out;
}

async function main() {
  console.log('Article id=', articleId, 'url=', WX_URL);
  console.log('PUBLIC_BASE=', PUBLIC_BASE);

  const html = await fetchWxHtml();
  const meta = extractMeta(html);
  console.log('Meta:', {
    title: meta.title,
    author: meta.author,
    publishedAt: meta.publishedAt,
    cover: !!meta.coverUrl,
  });

  let content = extractJsContent(html);
  content = sanitizeContentHtml(content);
  console.log('Raw content length:', content.length);

  const uploadDir = path.join(process.cwd(), 'uploads', 'articles', String(articleId));
  fs.mkdirSync(uploadDir, { recursive: true });

  const imageUrls = collectImageUrls(content, meta.coverUrl);
  console.log('Images found:', imageUrls.length);

  const urlMap = new Map();
  let i = 0;
  for (const url of imageUrls) {
    i += 1;
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
    const base = path.join(uploadDir, `img_${String(i).padStart(2, '0')}_${hash}`);
    try {
      const { path: saved, bytes } = await downloadImage(url, base);
      const fileName = path.basename(saved);
      const publicUrl = `${PUBLIC_BASE}/uploads/articles/${articleId}/${fileName}`;
      urlMap.set(url, publicUrl);
      console.log(`  [${i}/${imageUrls.length}] ${bytes}B → ${fileName}`);
    } catch (e) {
      console.warn(`  [${i}/${imageUrls.length}] FAIL`, e.message);
    }
  }

  let contentHtml = rewriteImageUrls(content, urlMap);
  contentHtml = simplifyForRichText(contentHtml);
  console.log(
    'Simplified for rich-text:',
    contentHtml.length,
    'chars,',
    (contentHtml.match(/<img\b/gi) || []).length,
    'imgs',
  );

  let coverUrl = meta.coverUrl;
  if (coverUrl && urlMap.has(coverUrl)) coverUrl = urlMap.get(coverUrl);
  else if (coverUrl) {
    // try match by no-query
    for (const [remote, local] of urlMap.entries()) {
      if (remote.split('?')[0] === coverUrl.split('?')[0]) {
        coverUrl = local;
        break;
      }
    }
  }

  const prisma = new PrismaClient();
  try {
    const article = await prisma.article.update({
      where: { id: BigInt(articleId) },
      data: {
        title: meta.title || undefined,
        author: meta.author,
        coverUrl,
        contentHtml,
        wechatUrl: WX_URL,
        publishedAt: meta.publishedAt,
        contentType: 'guide',
        status: 1,
        tagsJson: ['甘肃', '景点', '攻略', '图片转存'],
      },
    });
    console.log('Updated article', String(article.id));
    console.log('contentHtml length', contentHtml.length);
    console.log('rehosted images', urlMap.size);
    console.log('Open mini-program: /pages/home/article-detail/article-detail?id=' + articleId);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
