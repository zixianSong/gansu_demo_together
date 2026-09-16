const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.article.create({
    data: {
      title: '张掖丹霞摄影攻略：最佳观景点与拍摄时间',
      coverUrl: 'https://picsum.photos/seed/article-zhangye/800/600',
      contentType: 'guide',
      contentHtml:
        '<p>七彩丹霞在傍晚光线最柔和，建议从4号观景台看日落。</p><p>秋季天气稳定，适合航拍与延时摄影。</p>',
      author: '环甘肃游',
      tagsJson: ['张掖', '摄影', '攻略'],
      publishedAt: new Date('2026-09-11T12:00:00+08:00'),
      status: 1,
    },
  });

  console.log('created article:', {
    id: String(article.id),
    title: article.title,
    publishedAt: article.publishedAt,
  });

  const feed = await prisma.article.findMany({
    where: {
      status: 1,
      deletedAt: null,
      contentType: { in: ['guide', 'travelogue'] },
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: 5,
    select: { id: true, title: true, publishedAt: true },
  });

  console.log('current feed top:', feed.map((a) => ({
    id: String(a.id),
    title: a.title,
    publishedAt: a.publishedAt,
  })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
