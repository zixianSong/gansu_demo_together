import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import {
  CHARTER_SORTS,
  CHARTER_TRIP_TYPES,
  CharterSort,
} from './charter.dto';

const CHARTER_PRODUCT_TYPE = 5;
const PAID_ORDER_STATUSES = [2, 3, 4, 5];

@Injectable()
export class CharterService {
  constructor(private readonly prisma: PrismaService) {}

  async findRoutes(query: Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(query, 'seats')) {
      throw new BadRequestException({
        code: 40002,
        message: '本期不支持 seats 筛选',
      });
    }

    const startCity = this.parseStartCity(query.startCity);
    const tripType = this.parseTripType(query.tripType);
    const sort = this.parseSort(query.sort);
    const page = this.parsePage(query.page, 1);
    const pageSize = this.parsePageSize(query.pageSize, 20);

    const where: Prisma.BizTourRouteWhereInput = {
      status: 1,
      deletedAt: null,
      startCity,
    };
    if (tripType) {
      where.estimatedDuration = tripType;
    }

    const [cities, carModels, banner] = await Promise.all([
      this.listCities(),
      this.listCarModels(),
      this.findCharterBanner(),
    ]);

    if (sort === 'soldDesc') {
      const all = await this.prisma.bizTourRoute.findMany({
        where,
        orderBy: { id: 'asc' },
      });
      const soldMap = await this.soldCountMap(all.map((r) => r.id));
      const scoreMap = await this.scoreMap(all.map((r) => r.id));
      const sorted = [...all].sort((a, b) => {
        const sa = soldMap.get(Number(a.id)) ?? 0;
        const sb = soldMap.get(Number(b.id)) ?? 0;
        if (sb !== sa) return sb - sa;
        return Number(a.id) - Number(b.id);
      });
      const total = sorted.length;
      const slice = sorted.slice((page - 1) * pageSize, page * pageSize);
      return {
        list: slice.map((row) =>
          this.toListItem(
            row,
            scoreMap.get(Number(row.id)) ?? null,
            soldMap.get(Number(row.id)) ?? 0,
          ),
        ),
        page,
        pageSize,
        total,
        cities,
        carModels,
        banner,
      };
    }

    const orderBy: Prisma.BizTourRouteOrderByWithRelationInput[] =
      sort === 'priceAsc'
        ? [{ referencePrice: 'asc' }, { id: 'asc' }]
        : [{ id: 'asc' }];

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.bizTourRoute.count({ where }),
      this.prisma.bizTourRoute.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const ids = rows.map((r) => r.id);
    const [soldMap, scoreMap] = await Promise.all([
      this.soldCountMap(ids),
      this.scoreMap(ids),
    ]);

    return {
      list: rows.map((row) =>
        this.toListItem(
          row,
          scoreMap.get(Number(row.id)) ?? null,
          soldMap.get(Number(row.id)) ?? 0,
        ),
      ),
      page,
      pageSize,
      total,
      cities,
      carModels,
      banner,
    };
  }

  private parseStartCity(raw: unknown): string {
    if (raw === undefined || raw === null || raw === '') {
      return '西宁';
    }
    if (typeof raw !== 'string') {
      throw new BadRequestException({
        code: 40002,
        message: 'startCity 须为字符串',
      });
    }
    return raw;
  }

  private parseTripType(raw: unknown): string | undefined {
    if (raw === undefined || raw === null || raw === '') return undefined;
    if (typeof raw !== 'string' || !CHARTER_TRIP_TYPES.includes(raw as never)) {
      throw new BadRequestException({
        code: 40002,
        message: 'tripType 仅支持 半日游、1日游、2日游',
      });
    }
    return raw;
  }

  private parseSort(raw: unknown): CharterSort {
    if (raw === undefined || raw === null || raw === '') return 'recommend';
    if (typeof raw !== 'string' || !CHARTER_SORTS.includes(raw as CharterSort)) {
      throw new BadRequestException({
        code: 40002,
        message: 'sort 仅支持 recommend、priceAsc、soldDesc',
      });
    }
    return raw as CharterSort;
  }

  private parsePage(raw: unknown, fallback: number): number {
    if (raw === undefined || raw === null || raw === '') return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1) {
      throw new BadRequestException({
        code: 40001,
        message: 'page 须为正整数',
      });
    }
    return n;
  }

  private parsePageSize(raw: unknown, fallback: number): number {
    if (raw === undefined || raw === null || raw === '') return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 50) {
      throw new BadRequestException({
        code: 40001,
        message: 'pageSize 须为 1～50 的整数',
      });
    }
    return n;
  }

  private toListItem(
    row: {
      id: bigint;
      routeName: string;
      startCity: string;
      endCity: string;
      estimatedDuration: string | null;
      referencePrice: Prisma.Decimal | null;
      routeDesc: string | null;
      coverImg: string | null;
    },
    score: number | null,
    soldCount: number,
  ) {
    return {
      id: toNum(row.id),
      routeName: row.routeName,
      startCity: row.startCity,
      endCity: row.endCity,
      estimatedDuration: row.estimatedDuration,
      referencePrice:
        row.referencePrice == null ? null : Number(row.referencePrice),
      routeDesc: row.routeDesc,
      coverImg: row.coverImg,
      score,
      soldCount,
    };
  }

  private async listCities() {
    const dests = await this.prisma.destination.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: [{ sortWeight: 'asc' }, { id: 'asc' }],
    });
    const hot = await this.prisma.homeHotDestination.findMany({
      where: { status: 1, deletedAt: null },
      select: { destinationId: true },
    });
    const hotSet = new Set(hot.map((h) => Number(h.destinationId)));
    return dests.map((d) => ({
      id: toNum(d.id),
      name: d.name,
      hot: hotSet.has(Number(d.id)),
    }));
  }

  private async listCarModels() {
    const rows = await this.prisma.sysCarModel.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map((r) => ({
      id: toNum(r.id),
      modelName: r.modelName,
      vehicleType: r.vehicleType,
      seatCount: r.seatCount,
    }));
  }

  private async findCharterBanner() {
    const now = new Date();
    const row = await this.prisma.banner.findFirst({
      where: {
        status: 1,
        deletedAt: null,
        linkType: 'charter',
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (!row) return null;
    return {
      id: toNum(row.id),
      title: row.title,
      imageUrl: row.imageUrl,
      linkType: row.linkType,
      linkId: toNum(row.linkId),
      linkPath: row.linkPath,
    };
  }

  private async soldCountMap(ids: bigint[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (!ids.length) return map;
    try {
      const rows = await this.prisma.$queryRaw<
        { product_id: bigint; cnt: bigint }[]
      >`
        SELECT product_id, COUNT(*) AS cnt
        FROM orders
        WHERE product_type = ${CHARTER_PRODUCT_TYPE}
          AND product_id IN (${Prisma.join(ids)})
          AND status IN (${Prisma.join(PAID_ORDER_STATUSES)})
        GROUP BY product_id
      `;
      for (const r of rows) {
        map.set(Number(r.product_id), Number(r.cnt));
      }
    } catch {
      // orders 表未导入时视为 0
    }
    return map;
  }

  private async scoreMap(ids: bigint[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (!ids.length) return map;
    try {
      const rows = await this.prisma.$queryRaw<
        { product_id: bigint; avg_rating: number | null }[]
      >`
        SELECT product_id, AVG(rating) AS avg_rating
        FROM reviews
        WHERE product_type = ${CHARTER_PRODUCT_TYPE}
          AND product_id IN (${Prisma.join(ids)})
          AND status = 1
          AND deleted_at IS NULL
        GROUP BY product_id
      `;
      for (const r of rows) {
        if (r.avg_rating == null) continue;
        map.set(Number(r.product_id), Number(Number(r.avg_rating).toFixed(1)));
      }
    } catch {
      // reviews 表未导入时视为 null
    }
    return map;
  }
}
