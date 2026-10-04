import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cover = (name: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(name)}/800/600`;

async function main() {
  await prisma.articleRoute.deleteMany();
  await prisma.articlePoi.deleteMany();
  await prisma.homeHotRoute.deleteMany();
  await prisma.homeHotDestination.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.article.deleteMany();
  await prisma.poi.deleteMany();
  await prisma.routeTemplate.deleteMany();
  await prisma.destination.deleteMany();

  const lanzhou = await prisma.destination.create({
    data: {
      name: '兰州',
      coverUrl: cover('lanzhou'),
      intro: '黄河穿城而过的省会城市',
      status: 1,
      sortWeight: 1,
    },
  });
  const dunhuang = await prisma.destination.create({
    data: {
      name: '敦煌',
      coverUrl: cover('dunhuang'),
      intro: '丝绸之路上的艺术宝库',
      status: 1,
      sortWeight: 2,
    },
  });
  const zhangye = await prisma.destination.create({
    data: {
      name: '张掖',
      coverUrl: cover('zhangye'),
      intro: '丹霞地貌与草原风光',
      status: 1,
      sortWeight: 3,
    },
  });

  const mogao = await prisma.poi.create({
    data: {
      destinationId: dunhuang.id,
      category: 'scenic',
      poiSubtype: 'place',
      name: '敦煌莫高窟',
      coverUrl: cover('mogao'),
      address: '甘肃省敦煌市莫高窟',
      city: '敦煌市',
      intro: '世界文化遗产，壁画与彩塑艺术殿堂。',
      grade: '5A',
      status: 1,
    },
  });
  const museum = await prisma.poi.create({
    data: {
      destinationId: lanzhou.id,
      category: 'museum',
      poiSubtype: 'place',
      name: '甘肃省博物馆',
      coverUrl: cover('gsmuseum'),
      address: '兰州市城关区西津西路3号',
      city: '兰州市',
      intro: '馆藏马踏飞燕等珍贵文物。',
      status: 1,
    },
  });
  const noodle = await prisma.poi.create({
    data: {
      destinationId: lanzhou.id,
      category: 'food',
      poiSubtype: 'food',
      name: '兰州牛肉面',
      coverUrl: cover('beefnoodle'),
      address: '兰州市城关区多处门店',
      city: '兰州市',
      intro: '一清二白三红四绿五黄的经典味道。',
      cuisineType: '面食',
      status: 1,
    },
  });

  const hexi = await prisma.routeTemplate.create({
    data: {
      destinationId: dunhuang.id,
      name: '漫游河西走廊',
      coverUrl: cover('hexi'),
      subtitle: '经典河西四日',
      intro: '串联敦煌、嘉峪关、张掖的经典玩法。',
      daysCount: 4,
      status: 1,
      sortWeight: 1,
    },
  });
  const silk = await prisma.routeTemplate.create({
    data: {
      destinationId: zhangye.id,
      name: '寻迹丝路古道',
      coverUrl: cover('silk'),
      subtitle: '三日轻徒步',
      intro: '沿着古道感受丝路风情。',
      daysCount: 3,
      status: 1,
      sortWeight: 2,
    },
  });

  const article1 = await prisma.article.create({
    data: {
      title: '探秘丝绸之路，感受千年文化',
      coverUrl: cover('article-silk'),
      contentType: 'guide',
      contentHtml:
        '<p>从兰州出发，一路向西，敦煌莫高窟是旅程的高光时刻。</p><p>建议提前预约门票，合理安排观窟时段。</p>',
      author: '环甘肃游',
      tagsJson: ['丝路', '攻略'],
      publishedAt: new Date('2026-09-01T10:00:00+08:00'),
      status: 1,
    },
  });
  const article2 = await prisma.article.create({
    data: {
      title: '兰州两日游记：黄河与牛肉面',
      coverUrl: cover('article-lanzhou'),
      contentType: 'travelogue',
      contentHtml:
        '<p>早上在黄河边散步，中午一碗牛肉面，下午逛甘肃省博物馆。</p>',
      author: '旅人小周',
      tagsJson: ['兰州', '游记'],
      publishedAt: new Date('2026-09-05T09:30:00+08:00'),
      status: 1,
    },
  });

  await prisma.articlePoi.createMany({
    data: [
      { articleId: article1.id, poiId: mogao.id, sortOrder: 0 },
      { articleId: article2.id, poiId: museum.id, sortOrder: 0 },
      { articleId: article2.id, poiId: noodle.id, sortOrder: 1 },
    ],
  });
  await prisma.articleRoute.createMany({
    data: [{ articleId: article1.id, routeId: hexi.id, sortOrder: 0 }],
  });

  await prisma.homeHotDestination.createMany({
    data: [
      { destinationId: lanzhou.id, sortOrder: 0, status: 1 },
      { destinationId: dunhuang.id, sortOrder: 1, status: 1 },
      { destinationId: zhangye.id, sortOrder: 2, status: 1 },
    ],
  });
  await prisma.homeHotRoute.createMany({
    data: [
      { routeId: hexi.id, sortOrder: 0, status: 1 },
      { routeId: silk.id, sortOrder: 1, status: 1 },
    ],
  });

  await prisma.banner.createMany({
    data: [
      {
        title: '丝路攻略推荐',
        imageUrl: cover('banner-article'),
        linkType: 'article',
        linkId: article1.id,
        sortOrder: 0,
        status: 1,
      },
      {
        title: '莫高窟',
        imageUrl: cover('banner-poi'),
        linkType: 'poi',
        linkId: mogao.id,
        sortOrder: 1,
        status: 1,
      },
      {
        title: '河西走廊线路',
        imageUrl: cover('banner-route'),
        linkType: 'route',
        linkId: hexi.id,
        sortOrder: 2,
        status: 1,
      },
      {
        title: '活动 H5',
        imageUrl: cover('banner-h5'),
        linkType: 'webview',
        linkPath: 'https://example.com/activity',
        sortOrder: 3,
        status: 1,
      },
    ],
  });

  console.log('Seed completed.');
  console.log({
    destinations: 3,
    pois: 3,
    routes: 2,
    articles: 2,
    banners: 4,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
