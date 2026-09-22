import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import { snapshotOf } from './order.mapper';
import { CreateFavoriteDto } from '../auth/dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, query: { tab?: string; page?: string; pageSize?: string }) {
    const tab = query.tab || 'spot';
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
    const rows = await this.prisma.favorite.findMany({
      where: { userId: BigInt(userId), deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    const mapped = [];
    for (const row of rows) {
      const item = await this.toCard(row);
      if (item.tab === tab) mapped.push(item);
    }
    const total = mapped.length;
    return {
      list: mapped.slice((page - 1) * pageSize, page * pageSize),
      pagination: { page, pageSize, total },
    };
  }

  async add(userId: number, dto: CreateFavoriteDto) {
    const tab = dto.tab;
    const extra = { ...(dto.extraInfo || {}), tab };
    const snap = await this.snapshotTarget(dto.targetType, dto.targetId, extra);
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: BigInt(userId),
          targetType: dto.targetType,
          targetId: BigInt(dto.targetId),
        },
      },
    });
    const data = {
      targetName: snap.targetName,
      targetImage: snap.targetImage,
      extraInfo: snap.extra as Prisma.InputJsonValue,
      deletedAt: null,
    };
    const row = existing
      ? await this.prisma.favorite.update({ where: { favoriteId: existing.favoriteId }, data })
      : await this.prisma.favorite.create({
          data: {
            userId: BigInt(userId),
            targetType: dto.targetType,
            targetId: BigInt(dto.targetId),
            ...data,
          },
        });
    return {
      favoriteId: toNum(row.favoriteId),
      tab,
      targetType: row.targetType,
      targetId: toNum(row.targetId),
    };
  }

  async remove(userId: number, favoriteId: number) {
    const row = await this.prisma.favorite.findFirst({
      where: { favoriteId: BigInt(favoriteId), deletedAt: null },
    });
    if (!row) throw new NotFoundException('收藏不存在');
    if (Number(row.userId) !== userId) throw new ForbiddenException('无权操作');
    await this.prisma.favorite.update({
      where: { favoriteId: row.favoriteId },
      data: { deletedAt: new Date() },
    });
    return null;
  }

  private async toCard(row: {
    favoriteId: bigint;
    targetType: number;
    targetId: bigint;
    targetName: string | null;
    targetImage: string | null;
    extraInfo: unknown;
    createdAt: Date;
  }) {
    const extra = snapshotOf(row.extraInfo);
    const tab = String(extra.tab || this.fallbackTab(row.targetType));
    const targetId = toNum(row.targetId) || 0;
    const collectedAt = row.createdAt.toISOString();
    const base = {
      favoriteId: toNum(row.favoriteId),
      tab,
      targetType: row.targetType,
      targetId,
      title: String(extra.title || row.targetName || ''),
      coverUrl: String(extra.coverUrl || row.targetImage || ''),
      collectedAt,
      path: this.pathOf(row.targetType, targetId),
    };
    if (tab === 'spot') {
      return { ...base, price: Number(extra.price ?? 0) };
    }
    if (tab === 'route') {
      return { ...base, subtitle: String(extra.subtitle || ''), price: Number(extra.price ?? 0) };
    }
    if (tab === 'guide') {
      return {
        ...base,
        author: String(extra.author || ''),
        publishTime: String(extra.publishTime || collectedAt.slice(0, 10)),
        readCount: extra.readCount ?? 0,
        likeCount: extra.likeCount ?? 0,
      };
    }
    return {
      ...base,
      rating: Number(extra.rating ?? 0),
      avgCost: Number(extra.avgCost ?? 0),
      address: String(extra.address || ''),
    };
  }

  private fallbackTab(targetType: number) {
    if (targetType === 2 || targetType === 5) return 'route';
    if (targetType === 3 || targetType === 4) return 'guide';
    return 'spot';
  }

  private pathOf(targetType: number, targetId: number) {
    if (targetType === 1) return `/pages/poi/detail?id=${targetId}`;
    if (targetType === 4) return `/pages/article/detail?id=${targetId}`;
    return '';
  }

  private async snapshotTarget(targetType: number, targetId: number, extra: Record<string, unknown>) {
    if (targetType === 1) {
      const poi = await this.prisma.poi.findFirst({ where: { id: BigInt(targetId), deletedAt: null } });
      return {
        targetName: poi?.name || String(extra.title || ''),
        targetImage: poi?.coverUrl || String(extra.coverUrl || ''),
        extra: {
          ...extra,
          title: extra.title || poi?.name,
          coverUrl: extra.coverUrl || poi?.coverUrl,
          price: extra.price ?? (poi?.price != null ? Number(poi.price) : 0),
          rating: extra.rating ?? (poi?.rating != null ? Number(poi.rating) : undefined),
          avgCost: extra.avgCost ?? (poi?.avgCost != null ? Number(poi.avgCost) : undefined),
          address: extra.address || poi?.address,
        },
      };
    }
    if (targetType === 4) {
      const article = await this.prisma.article.findFirst({ where: { id: BigInt(targetId), deletedAt: null } });
      return {
        targetName: article?.title || String(extra.title || ''),
        targetImage: article?.coverUrl || String(extra.coverUrl || ''),
        extra: {
          ...extra,
          author: extra.author || article?.author,
          publishTime: extra.publishTime || article?.publishedAt?.toISOString().slice(0, 10),
        },
      };
    }
    if (targetType === 5) {
      const route = await this.prisma.routeTemplate.findFirst({ where: { id: BigInt(targetId), deletedAt: null } });
      return {
        targetName: route?.name || String(extra.title || ''),
        targetImage: route?.coverUrl || String(extra.coverUrl || ''),
        extra: { ...extra, subtitle: extra.subtitle || route?.subtitle },
      };
    }
    return {
      targetName: String(extra.title || ''),
      targetImage: String(extra.coverUrl || ''),
      extra,
    };
  }
}
