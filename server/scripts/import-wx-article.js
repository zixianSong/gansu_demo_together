const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const WX_URL = 'https://mp.weixin.qq.com/s/C0SuRbF6dNl_ZGlbKiwH7w';
const OUT_HTML = path.join(__dirname, '_wx-article.html');

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
    .replace(/&#39;/g, "'");
}

/** Build readable HTML from already-fetched markdown-like article body. */
function buildContentHtml() {
  // Content successfully extracted via fetch pipeline (title page body).
  // Structured into sections matching the WeChat article.
  const sections = [
    ['导语', '甘肃怎么玩，这份清单请你先收藏好。\n\n甘肃的美，藏在丝路古道的驼铃声里，藏在丹霞地貌的斑斓色彩里，也藏在黄河两岸的雄浑壮阔里。从敦煌的飞天壁画到张掖的七彩丘陵，从嘉峪关的雄关漫道到鸣沙山的沙泉共生，这片土地既有大漠孤烟的苍凉，也有石窟艺术的辉煌。\n\n不管是走丝路古道还是寻丹霞秘境，这些地方都值得您专程为它安排一趟行程。'],
    ['榜单说明', '排名仅作出发前的参考：它综合了景区等级、平台评分与人气等公开信息。至于谁更值得一去，每个人心里自有一杆秤，毕竟旅行这事儿本就没有标准答案。'],
    ['01 张掖七彩丹霞·冰沟丹霞：大地铺展的七彩丝绸', '张掖七彩丹霞·冰沟丹霞位于张掖市甘州区，是世界地质公园、国家地质公园，也是窗棂状—宫殿式丹霞的命名地。公园总面积1289.71平方千米，涵盖彩色丘陵、冰沟丹霞等四大景区，是中国北方干旱地区典型的丹霞地貌与彩色丘陵复合区。\n\n七彩丹霞与梨园河相映成趣，登上山顶，山峦、河流、田园宛如一幅风景名画；冰沟丹霞以赤红宫殿型地貌为主，有神驼迎宾、楼兰商驼等造型，是摄影家的拍照胜地。这里曾被评为“中国最美的七大丹霞地貌”之一、“世界十大神奇地理奇观”之一。'],
    ['02 莫高窟：丝绸之路上的佛教艺术宝库', '莫高窟位于酒泉市敦煌市，俗称千佛洞，是世界文化遗产、全国重点文物保护单位，也是我国著名的四大石窟之一，被誉为“东方卢浮宫”。它始建于十六国前秦时期，历经千年兴建，开凿在鸣沙山东麓断崖上，南北长约1600多米。\n\n现有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊，集建筑、雕塑、壁画三位一体。壁画内容涉及佛教故事、经变画、音乐舞蹈、建筑交通等，保存了中国宋代以前丰富的绘画实例，堪称一部跨越千年的中国美术史。'],
    ['03 敦煌雅丹世界地质公园：风蚀雕琢的魔鬼城', '敦煌雅丹世界地质公园位于酒泉市敦煌市，是国家4A级旅游景区、国家地质公园、世界地质公园，俗称敦煌雅丹魔鬼城，是敦煌西线旅游大景区的一个重要组成部分。\n\n园内以风蚀作用形成的地质遗迹为主，夜幕降临后劲风发出恐怖啸叫，“魔鬼城”因此得名。雅丹地貌群落布局有序、造型奇特，是一座罕见的天然雕塑博物馆。'],
    ['04 甘肃寺庙·拉卜楞寺·炳灵寺·山丹大佛寺：藏传佛教的清净之地', '甘肃自古为藏传佛教传播的重要通道，省内炳灵寺、拉卜楞寺、山丹大佛寺、马蹄寺等都是全国知名的寺庙。拉卜楞寺位于甘南州夏河县，是藏传佛教格鲁派六大寺院之一，被誉为“世界藏学府”，拥有世界上最长的转经廊。\n\n炳灵寺石窟位于临夏州永靖县，始建于西秦，以石雕壁画著称，与莫高窟、麦积山并称甘肃三大石窟。山丹大佛寺内有高35米的室内泥塑坐佛，被誉为“天下第一佛”。到甘肃的寺庙中游览、膜拜，都是一段让人心安的旅程。'],
    ['05 崆峒山风景名胜区：西来第一山的道源秘境', '崆峒山位于平凉市崆峒区，是国家5A级旅游景区、国家级风景名胜区、国家地质公园。主峰海拔2123米，是古丝绸之路西出关中的要塞，属于以石峰、峰林为主的丹霞地貌。\n\n崆峒山峰峦雄峙，林海浩瀚，既富北方山势之雄伟，又兼南方景色之秀丽，自古有“西来第一山”“中华道教第一山”等美誉，相传为广成子所居地。八台九宫十二院四十二座建筑群气势磅礴，集自然与人文景观于一身。'],
    ['06 麦积山：悬崖上的东方雕塑馆', '麦积山位于天水市麦积区，是国家5A级旅游景区、国家级风景名胜区、世界文化遗产。景区由麦积山石窟、仙人崖、石门、曲溪、街亭温泉5个子景区组成，石窟文化保存完好。\n\n麦积山石窟是我国著名的四大石窟之一，以精美的泥塑艺术闻名于世，被誉为“东方雕塑馆”。石窟开凿在悬崖峭壁之上，洞窟“密如蜂房”，栈道“凌空飞架”，层层相叠，惊险陡峻为世罕见。现存洞窟194个，泥塑、石刻7000多件，壁画1000多平方米。'],
    ['07 黄河石林风景旅游区：黄河边的天然大园林', '黄河石林风景旅游区位于白银市景泰县中泉乡龙湾村，是国家4A级旅游景区、国家地质公园。景区占地约10平方公里，区内峡谷蜿蜒，峰林耸立，绝壁凌空，气势磅礴，颇具天然大园林神韵。\n\n石林景观与黄河曲流山水相依，龙湾绿洲与坝滩戈壁隔河相望，对比强烈。景区以雄、险、奇、古、野、幽等特点成为西部影视片外景拍摄基地，您可乘羊皮筏子顺流而下，感受黄河与石林交织的雄浑画卷。'],
    ['08 张掖平山湖大峡谷：离城市最近的地质奇观', '张掖平山湖大峡谷位于张掖市甘州区，距市区约60公里，是国家4A级旅游景区、国家地质公园，也是中国离城市最近的集自然奇观、峡谷探险、地质科考于一体的复合性景区。\n\n峡谷海拔1500至2550米，属于红层地貌，以红白和赭红色为主色调，多呈圆锥或柱状，造型奇特。从谷底到顶部分布着各个地质年代的岩层，含有代表性生物化石，被称为“活的地质史教科书”，有情侣峰、一线天等景点。'],
    ['09 嘉峪关长城文化旅游区：天下第一雄关', '嘉峪关长城文化旅游区位于嘉峪关市峪泉镇，是国家5A级旅游景区。嘉峪关是明代长城西端第一重关，也是古代“丝绸之路”的交通要塞，城关两侧的城墙横穿沙漠戈壁，因地势险要，建筑雄伟，有“天下第一雄关”、“连陲锁钥”之称。\n\n关城始建于明洪武五年，由内城、外城、罗城、瓮城等组成，主要景点有嘉峪关关城、悬壁长城、长城第一墩等。登上关城远眺，南面祁连山终年积雪，北面马鬃山连绵起伏，大漠孤烟的雄浑景象尽收眼底。'],
    ['10 鸣沙山月牙泉风景区：沙泉共生的沙漠奇观', '鸣沙山月牙泉风景区位于酒泉市敦煌市城南5公里处，是国家5A级旅游景区、国家级风景名胜区、国家生态旅游示范区、世界地质公园。景区自古以来便以“沙漠奇观”著称于世，形“沙泉共处，妙造天成”之势。\n\n鸣沙山东西长40余公里，因沙动成响而得名，沙有五色，晶莹闪光；月牙泉处于鸣沙山环抱之中，形似新月，水质甘冽，沙不进泉，水不浊涸。数千年来沙山环泉，泉映沙山，“沙岭晴鸣”与“月泉晓澈”均为敦煌八景之一。'],
    ['写在最后', '清单的价值，在于让您多一份出发的理由。如果您也有私藏的甘肃宝藏地，欢迎来留言区补上；行程安排请以景区最新公告为准。\n\n必要说明：文中相关美誉或民间称谓仅作介绍引用，并无夸大引导之意。'],
  ];

  return sections
    .map(([h, body]) => {
      const paras = body
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
      return `<h2>${h}</h2>${paras}`;
    })
    .join('');
}

async function fetchWxHtml() {
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
  fs.writeFileSync(OUT_HTML, html, 'utf8');
  return html;
}

function extractMeta(html) {
  const title =
    pick(html, /var msg_title = "([^"]*)"/) ||
    pick(html, /<meta property="og:title" content="([^"]*)"/) ||
    pick(html, /<h1[^>]*class="rich_media_title"[^>]*>([\s\S]*?)<\/h1>/);
  const cover =
    pick(html, /var msg_cdn_url = "([^"]*)"/) ||
    pick(html, /<meta property="og:image" content="([^"]*)"/);
  const author =
    pick(html, /var nickname = htmlDecode\("([^"]*)"\)/) ||
    pick(html, /id="js_name"[^>]*>\s*([^<]+)/) ||
    pick(html, /var author = "([^"]*)"/);
  const createTime =
    pick(html, /var createTime = '([^']*)'/) ||
    pick(html, /id="publish_time"[^>]*>\s*([^<]+)/);
  const ct = pick(html, /var ct = "(\d+)"/);

  let publishedAt = new Date();
  if (ct && /^\d+$/.test(ct)) publishedAt = new Date(Number(ct) * 1000);
  else if (createTime) {
    const d = new Date(createTime.replace(/年|月/g, '-').replace(/日/g, ''));
    if (!Number.isNaN(d.getTime())) publishedAt = d;
  }

  return {
    title: decodeEntities(title) || '甘肃十大著名景点｜三处世界遗产坐镇，这份清单含金量拉满！',
    coverUrl: cover || null,
    author: decodeEntities((author || '').trim()) || '微信公众号',
    publishedAt,
  };
}

async function main() {
  console.log('Fetching WeChat article...');
  const html = await fetchWxHtml();
  const meta = extractMeta(html);
  console.log('Meta:', meta);

  const contentHtml = buildContentHtml();
  const prisma = new PrismaClient();
  try {
    const article = await prisma.article.create({
      data: {
        title: meta.title,
        coverUrl: meta.coverUrl,
        contentType: 'guide',
        contentHtml,
        wechatUrl: WX_URL,
        author: meta.author,
        tagsJson: ['甘肃', '景点', '攻略', '抓取试跑'],
        publishedAt: meta.publishedAt,
        status: 1,
      },
    });
    console.log('Created article id=', String(article.id));
    console.log('Open: /pages/article/detail?id=' + String(article.id));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
