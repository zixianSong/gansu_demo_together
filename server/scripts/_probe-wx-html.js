const fs = require('fs');
const path = require('path');

const WX_URL = 'https://mp.weixin.qq.com/s/C0SuRbF6dNl_ZGlbKiwH7w';
const htmlPath = path.join(__dirname, '../../tools/_wx-article.html');

async function fetchHtml() {
  const res = await fetch(WX_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.40 NetType/WIFI Language/zh_CN',
      Accept: 'text/html',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Referer: 'https://mp.weixin.qq.com/',
    },
  });
  const html = await res.text();
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, 'utf8');
  return html;
}

function analyze(html) {
  console.log('len', html.length);
  console.log('has js_content id', /id="js_content"/.test(html));
  console.log('img tags', (html.match(/<img\b/gi) || []).length);
  console.log('data-src', (html.match(/data-src=/gi) || []).length);
  console.log('http mmbiz', (html.match(/mmbiz\.qpic\.cn/gi) || []).length);

  const keys = [
    'js_content',
    'rich_media_content',
    'msg_cdn_url',
    'picture_page_info_list',
    'cgiData',
    'createTime',
  ];
  for (const k of keys) {
    console.log(k, 'index', html.indexOf(k));
  }

  // Sample around js_content
  const i = html.indexOf('id="js_content"');
  if (i >= 0) console.log('js_content snippet:\n', html.slice(i, i + 800));

  // Look for escaped content
  const m = html.match(/id=\\"js_content\\"[^>]*>([\s\S]{0,200})/);
  if (m) console.log('escaped snippet', m[0].slice(0, 300));
}

(async () => {
  const html = await fetchHtml();
  analyze(html);
})();
