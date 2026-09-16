import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseTags, toIso, toNum } from '../common/utils/serialize';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getBanners() {
    const now = new Date();
    const rows = await this.prisma.banner.findMany({
      where: {
        status: 1,
        deletedAt: null,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    const allowed = new Set(['none', 'article', 'poi', 'route', 'webview']);
    return {
      list: rows
        .filter((b) => allowed.has(b.linkType))
        .map((b) => ({
          id: toNum(b.id),
          title: b.title,
          imageUrl: b.imageUrl,
          linkType: b.linkType,
          linkId: toNum(b.linkId),
          linkPath: b.linkPath,
          sortOrder: b.sortOrder,
        })),
    };
  }

  async getHotDestinations(limit = 4) {
    const take = Math.min(Math.max(limit, 1), 20);
    const rows = await this.prisma.homeHotDestination.findMany({
      where: {
        status: 1,
        deletedAt: null,
        destination: { status: 1, deletedAt: null },
      },
      include: { destination: true },
      orderBy: { sortOrder: 'asc' },
      take,
    });

    return {
      list: rows.map((r) => ({
        id: toNum(r.id),
        destinationId: toNum(r.destinationId),
        name: r.destination.name,
        coverUrl: r.coverOverride || r.destination.coverUrl,
        sortOrder: r.sortOrder,
      })),
    };
  }

  async getHotRoutes(limit = 4) {
    const take = Math.min(Math.max(limit, 1), 20);
    const rows = await this.prisma.homeHotRoute.findMany({
      where: {
        status: 1,
        deletedAt: null,
        route: { status: 1, deletedAt: null },
      },
      include: { route: true },
      orderBy: { sortOrder: 'asc' },
      take,
    });

    return {
      list: rows.map((r) => ({
        id: toNum(r.id),
        routeId: toNum(r.routeId),
        name: r.route.name,
        coverUrl: r.coverOverride || r.route.coverUrl,
        sortOrder: r.sortOrder,
      })),
    };
  }

  async getFeed(page = 1, pageSize = 10) {
    const p = Math.max(page, 1);
    const size = Math.min(Math.max(pageSize, 1), 50);
    const where: Prisma.ArticleWhereInput = {
      status: 1,
      deletedAt: null,
      contentType: { in: ['guide', 'travelogue'] },
    };

    const [total, rows] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        skip: (p - 1) * size,
        take: size,
      }),
    ]);

    return {
      list: rows.map((a) => ({
        id: toNum(a.id),
        title: a.title,
        coverUrl: a.coverUrl,
        contentType: a.contentType,
        author: a.author,
        publishedAt: toIso(a.publishedAt),
        tags: parseTags(a.tagsJson),
      })),
      pagination: { page: p, pageSize: size, total },
    };
  }
}
