import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseTags, toIso, toNum } from '../common/utils/serialize';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveArticle(id: bigint) {
    const article = await this.prisma.article.findFirst({
      where: { id, status: 1, deletedAt: null },
    });
    if (!article) {
      throw new NotFoundException('文章不存在或已下架');
    }
    return article;
  }

  async getDetail(id: number) {
    const article = await this.getActiveArticle(BigInt(id));
    const [poiCount, routeCount] = await Promise.all([
      this.prisma.articlePoi.count({
        where: {
          articleId: article.id,
          poi: { status: 1, deletedAt: null },
        },
      }),
      this.prisma.articleRoute.count({
        where: {
          articleId: article.id,
          route: { status: 1, deletedAt: null },
        },
      }),
    ]);

    return {
      id: toNum(article.id),
      title: article.title,
      coverUrl: article.coverUrl,
      contentType: article.contentType,
      contentHtml: article.contentHtml,
      author: article.author,
      publishedAt: toIso(article.publishedAt),
      tags: parseTags(article.tagsJson),
      hasRelatedPois: poiCount > 0,
      hasRelatedRoutes: routeCount > 0,
    };
  }

  async getRelatedPois(id: number) {
    await this.getActiveArticle(BigInt(id));
    const rows = await this.prisma.articlePoi.findMany({
      where: {
        articleId: BigInt(id),
        poi: { status: 1, deletedAt: null },
      },
      include: { poi: true },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      list: rows.map((r) => ({
        poiId: toNum(r.poiId),
        name: r.poi.name,
        coverUrl: r.poi.coverUrl,
        category: r.poi.category,
        city: r.poi.city,
        address: r.poi.address,
        sortOrder: r.sortOrder,
      })),
    };
  }

  async getRelatedRoutes(id: number) {
    await this.getActiveArticle(BigInt(id));
    const rows = await this.prisma.articleRoute.findMany({
      where: {
        articleId: BigInt(id),
        route: { status: 1, deletedAt: null },
      },
      include: { route: true },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      list: rows.map((r) => ({
        routeId: toNum(r.routeId),
        name: r.route.name,
        coverUrl: r.route.coverUrl,
        subtitle: r.route.subtitle,
        daysCount: r.route.daysCount,
        sortOrder: r.sortOrder,
      })),
    };
  }
}
