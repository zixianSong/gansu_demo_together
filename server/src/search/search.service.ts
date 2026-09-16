import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';

type SearchItem = {
  type: 'article' | 'poi' | 'food' | 'route';
  id: number | null;
  title: string;
  coverUrl: string | null;
  subtitle: string | null;
  category: string | null;
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    keywordRaw: string | undefined,
    page = 1,
    pageSize = 10,
    type?: string,
  ) {
    const keyword = (keywordRaw ?? '').trim();
    if (!keyword || keyword.length > 50) {
      throw new BadRequestException('请输入有效关键词');
    }

    const p = Math.max(page, 1);
    const size = Math.min(Math.max(pageSize, 1), 50);
    const like = keyword;
    const wantAll = !type;
    const items: SearchItem[] = [];

    if (wantAll || type === 'article') {
      const articles = await this.prisma.article.findMany({
        where: {
          status: 1,
          deletedAt: null,
          contentType: { in: ['guide', 'travelogue'] },
          title: { contains: like },
        },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      });
      for (const a of articles) {
        items.push({
          type: 'article',
          id: toNum(a.id),
          title: a.title,
          coverUrl: a.coverUrl,
          subtitle: a.contentType === 'guide' ? '攻略' : '游记',
          category: null,
        });
      }
    }

    if (wantAll || type === 'poi') {
      const pois = await this.prisma.poi.findMany({
        where: {
          status: 1,
          deletedAt: null,
          category: { in: ['scenic', 'museum'] },
          name: { contains: like },
        },
        orderBy: { id: 'desc' },
      });
      for (const poi of pois) {
        items.push({
          type: 'poi',
          id: toNum(poi.id),
          title: poi.name,
          coverUrl: poi.coverUrl,
          subtitle: poi.city,
          category: poi.category,
        });
      }
    }

    if (wantAll || type === 'food') {
      const foods = await this.prisma.poi.findMany({
        where: {
          status: 1,
          deletedAt: null,
          category: 'food',
          name: { contains: like },
        },
        orderBy: { id: 'desc' },
      });
      for (const poi of foods) {
        items.push({
          type: 'food',
          id: toNum(poi.id),
          title: poi.name,
          coverUrl: poi.coverUrl,
          subtitle: poi.city,
          category: poi.category,
        });
      }
    }

    if (wantAll || type === 'route') {
      const routes = await this.prisma.routeTemplate.findMany({
        where: {
          status: 1,
          deletedAt: null,
          name: { contains: like },
        },
        orderBy: { id: 'desc' },
      });
      for (const r of routes) {
        items.push({
          type: 'route',
          id: toNum(r.id),
          title: r.name,
          coverUrl: r.coverUrl,
          subtitle: `${r.daysCount}天`,
          category: null,
        });
      }
    }

    // Priority when merging all types: article → poi → food → route
    // When type filter is set, items are already single-type.
    if (wantAll) {
      const order = { article: 0, poi: 1, food: 2, route: 3 } as const;
      items.sort((a, b) => order[a.type] - order[b.type]);
    }

    const total = items.length;
    const list = items.slice((p - 1) * size, p * size);

    return {
      list,
      pagination: { page: p, pageSize: size, total },
    };
  }
}
