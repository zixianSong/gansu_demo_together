import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.40 NetType/WIFI Language/zh_CN';

export interface WechatImportResult {
  id: number;
  title: string;
  coverUrl: string | null;
  imageCount: number;
  contentHtmlLength: number;
  wechatUrl: string;
}

@Injectable()
export class WechatImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get publicBase(): string {
    const port = this.config.get<string>('PORT') || '3000';
    return (
      this.config.get<string>('PUBLIC_BASE_URL') ||
      `http://localhost:${port}`
    );
  }

  async importFromUrl(
    url: string,
    options?: { articleId?: number; overwrite?: boolean },
  ): Promise<WechatImportResult> {
    const wxUrl = url.trim();
    if (!/^https?:\/\/mp\.weixin\.qq\.com\//i.test(wxUrl)) {
      throw new ConflictException('请输入有效的微信公众号文章链接');
    }

    const existing = await this.prisma.article.findFirst({
      where: { wechatUrl: wxUrl, deletedAt: null },
    });
    if (existing && !options?.articleId && !options?.overwrite) {
      throw new ConflictException(
        `该文章已导入（ID: ${existing.id}），如需覆盖请指定 articleId 或开启 overwrite`,
      );
    }

    const html = await this.fetchWxHtml(wxUrl);
    const meta = this.extractMeta(html);
    let content = this.sanitizeContentHtml(this.extractJsContent(html));

    let articleId = options?.articleId;
    if (!articleId) {
      const created = await this.prisma.article.create({
        data: {
          title: meta.title || '未命名文章',
          contentType: 'guide',
          status: 1,
          author: meta.author,
          publishedAt: meta.publishedAt,
          wechatUrl: wxUrl,
        },
      });
      articleId = Number(created.id);
    } else {
      const found = await this.prisma.article.findFirst({
        where: { id: BigInt(articleId), deletedAt: null },
      });
      if (!found) {
        throw new ConflictException('指定文章不存在');
      }
    }

    const uploadDir = join(process.cwd(), 'uploads', 'articles', String(articleId));
    mkdirSync(uploadDir, { recursive: true });

    const imageUrls = this.collectImageUrls(content, meta.coverUrl);
    const urlMap = new Map<string, string>();
    let i = 0;
    for (const imageUrl of imageUrls) {
      i += 1;
      const hash = createHash('md5').update(imageUrl).digest('hex').slice(0, 10);
      const base = join(uploadDir, `img_${String(i).padStart(2, '0')}_${hash}`);
      try {
        const saved = await this.downloadImage(imageUrl, base);
        const fileName = saved.split(/[/\\]/).pop()!;
        const publicUrl = `${this.publicBase}/uploads/articles/${articleId}/${fileName}`;
        urlMap.set(imageUrl, publicUrl);
      } catch {
        // skip failed images
      }
    }

    let contentHtml = this.rewriteImageUrls(content, urlMap);
    contentHtml = this.simplifyForRichText(contentHtml);

    let coverUrl = meta.coverUrl;
    if (coverUrl && urlMap.has(coverUrl)) {
      coverUrl = urlMap.get(coverUrl)!;
    } else if (coverUrl) {
      for (const [remote, local] of urlMap.entries()) {
        if (remote.split('?')[0] === coverUrl.split('?')[0]) {
          coverUrl = local;
          break;
        }
      }
    }

    const article = await this.prisma.article.update({
      where: { id: BigInt(articleId) },
      data: {
        title: meta.title || undefined,
        author: meta.author,
        coverUrl,
        contentHtml,
        wechatUrl: wxUrl,
        publishedAt: meta.publishedAt,
        contentType: 'guide',
        status: 1,
        tagsJson: ['甘肃', '景点', '攻略'],
      },
    });

    return {
      id: Number(article.id),
      title: article.title,
      coverUrl: article.coverUrl,
      imageCount: (contentHtml.match(/<img\b/gi) || []).length,
      contentHtmlLength: contentHtml.length,
      wechatUrl: wxUrl,
    };
  }

  private async fetchWxHtml(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Referer: 'https://mp.weixin.qq.com/',
      },
    });
    if (!res.ok) {
      throw new InternalServerErrorException(`抓取文章失败: HTTP ${res.status}`);
    }
    return res.text();
  }

  private pick(html: string, re: RegExp): string | null {
    const m = html.match(re);
    return m ? m[1] : null;
  }

  private decodeEntities(s: string | null): string | null {
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

  private extractJsContent(html: string): string {
    const start = html.indexOf('id="js_content"');
    if (start < 0) throw new InternalServerErrorException('未找到文章正文');
    const openEnd = html.indexOf('>', start);
    if (openEnd < 0) throw new InternalServerErrorException('文章正文解析失败');

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
        const close = html.lastIndexOf('</div>', i);
        if (close > openEnd) {
          end = close;
          break;
        }
      }
    }
    if (end < 0) {
      const scriptAfter = html.indexOf('<script', openEnd + 50000);
      end =
        scriptAfter > 0
          ? html.lastIndexOf('</div>', scriptAfter)
          : openEnd + 200000;
    }
    let raw = html.slice(openEnd + 1, end);
    raw = raw.replace(/(<\/div>\s*)+$/i, '');
    return raw;
  }

  private extractMeta(html: string) {
    const title =
      this.pick(html, /var msg_title = "([^"]*)"/) ||
      this.pick(html, /<meta property="og:title" content="([^"]*)"/);
    const cover =
      this.pick(html, /var msg_cdn_url = "([^"]*)"/) ||
      this.pick(html, /<meta property="og:image" content="([^"]*)"/);
    const author =
      this.pick(html, /var nickname = htmlDecode\("([^"]*)"\)/) ||
      this.pick(html, /id="js_name"[^>]*>\s*([^<]+)/);
    const ct = this.pick(html, /var ct = "(\d+)"/);
    let publishedAt = new Date();
    if (ct) publishedAt = new Date(Number(ct) * 1000);
    return {
      title: this.decodeEntities(title),
      coverUrl: cover,
      author: this.decodeEntities((author || '').trim()) || '微信公众号',
      publishedAt,
    };
  }

  private collectImageUrls(contentHtml: string, coverUrl: string | null): string[] {
    const urls = new Set<string>();
    if (coverUrl) urls.add(coverUrl);

    const re = /(?:data-src|src)=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(contentHtml))) {
      let u = m[1].trim();
      if (!u || u.startsWith('data:')) continue;
      if (u.startsWith('//')) u = 'https:' + u;
      if (!/^https?:\/\//i.test(u)) continue;
      urls.add(u);
    }
    return [...urls];
  }

  private extFromUrlOrType(url: string, contentType: string): string {
    const clean = url.split('?')[0].toLowerCase();
    if (clean.endsWith('.png')) return '.png';
    if (clean.endsWith('.gif')) return '.gif';
    if (clean.endsWith('.webp')) return '.webp';
    if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return '.jpg';
    if (contentType.includes('png')) return '.png';
    if (contentType.includes('gif')) return '.gif';
    if (contentType.includes('webp')) return '.webp';
    return '.jpg';
  }

  private async downloadImage(url: string, destPath: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Referer: 'https://mp.weixin.qq.com/',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });
    if (!res.ok) {
      throw new Error(`download fail ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = this.extFromUrlOrType(url, res.headers.get('content-type') || '');
    const finalPath = destPath.endsWith(ext) ? destPath : destPath + ext;
    writeFileSync(finalPath, buf);
    return finalPath;
  }

  private sanitizeContentHtml(html: string): string {
    let out = html;
    out = out.replace(/\sdata-src=/gi, ' src=');
    out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
    out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
    out = out.replace(/\sstyle="visibility:\s*hidden;[^"]*"/gi, '');
    return out.trim();
  }

  private simplifyForRichText(html: string): string {
    const decode = (s: string) =>
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

    const parts: string[] = [];
    const re = /<img\b[^>]*>/gi;
    let last = 0;
    let m: RegExpExecArray | null;
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

  private rewriteImageUrls(html: string, urlMap: Map<string, string>): string {
    let out = html;
    for (const [remote, local] of urlMap.entries()) {
      out = out.split(remote).join(local);
      const noQuery = remote.split('?')[0];
      if (noQuery !== remote) {
        const esc = noQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(esc + '[^"\'\\s>]*', 'g'), local);
      }
    }
    return out;
  }
}
