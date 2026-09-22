import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import { dateText } from './order.mapper';
import { ReportFootprintDto } from '../auth/dto';

@Injectable()
export class FootprintsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, query: { page?: string; pageSize?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
    const where = { userId: BigInt(userId), deletedAt: null };
    const total = await this.prisma.footprint.count({ where });
    const rows = await this.prisma.footprint.findMany({
      where,
      orderBy: [{ visitDate: 'desc' }, { visitTime: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const all = await this.prisma.footprint.findMany({
      where,
      select: { poiId: true, cityName: true, visitDate: true },
    });
    const pois = new Set(all.map((item) => String(item.poiId || '')));
    const cities = new Set(all.map((item) => item.cityName || '').filter(Boolean));
    const days = new Set(all.map((item) => dateText(item.visitDate) || ''));
    return {
      stats: {
        poiCount: [...pois].filter(Boolean).length,
        cityCount: cities.size,
        travelDays: [...days].filter(Boolean).length,
      },
      list: rows.map((row) => this.toItem(row)),
      pagination: { page, pageSize, total },
    };
  }

  async report(userId: number, dto: ReportFootprintDto) {
    const poi = await this.prisma.poi.findFirst({
      where: { id: BigInt(dto.poiId), deletedAt: null },
    });
    if (!poi) throw new NotFoundException('地点不存在');
    const type = dto.type === 2 ? 2 : 1;
    const { dateStr, timeDate } = this.shanghaiNow();
    const visitDate = new Date(`${dateStr}T00:00:00+08:00`);
    const existing = await this.prisma.footprint.findFirst({
      where: {
        userId: BigInt(userId),
        poiId: poi.id,
        visitDate,
        deletedAt: null,
      },
    });
    const snap = {
      poiName: poi.name,
      poiImage: poi.coverUrl,
      poiGrade: poi.grade,
      poiCategory: poi.category,
      address: poi.address,
      cityName: poi.city,
      visitTime: timeDate,
    };
    if (existing) {
      await this.prisma.footprint.update({
        where: { footprintId: existing.footprintId },
        data: {
          ...snap,
          type: type === 2 ? 2 : existing.type,
        },
      });
      return null;
    }
    await this.prisma.footprint.create({
      data: {
        userId: BigInt(userId),
        poiId: poi.id,
        visitDate,
        type,
        ...snap,
      },
    });
    return null;
  }

  private toItem(row: {
    footprintId: bigint;
    poiId: bigint | null;
    poiName: string | null;
    poiImage: string | null;
    poiGrade: string | null;
    poiCategory: string | null;
    address: string | null;
    cityName: string | null;
    visitDate: Date;
    visitTime: Date | null;
    type: number | null;
  }) {
    const tags = [row.poiGrade, this.categoryLabel(row.poiCategory)].filter(Boolean) as string[];
    return {
      footprintId: toNum(row.footprintId),
      visitDate: dateText(row.visitDate),
      visitTime: this.timeText(row.visitTime),
      type: row.type || 1,
      title: row.poiName || '',
      coverUrl: row.poiImage || '',
      tags,
      address: row.address || '',
      cityName: row.cityName || '',
      poiId: toNum(row.poiId),
    };
  }

  private categoryLabel(category: string | null) {
    if (category === 'scenic') return '景点';
    if (category === 'museum') return '文博场馆';
    if (category === 'food') return '美食';
    return category || '';
  }

  private timeText(value: Date | null) {
    if (!value) return null;
    const h = String(value.getHours()).padStart(2, '0');
    const m = String(value.getMinutes()).padStart(2, '0');
    const s = String(value.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  private shanghaiNow() {
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
    const timeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
    return { dateStr, timeDate: new Date(`1970-01-01T${timeStr}+08:00`) };
  }
}
