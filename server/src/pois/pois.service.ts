import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';

@Injectable()
export class PoisService {
  constructor(private readonly prisma: PrismaService) {}

  async getDetail(id: number) {
    const poi = await this.prisma.poi.findFirst({
      where: { id: BigInt(id), status: 1, deletedAt: null },
    });
    if (!poi) {
      throw new NotFoundException('地点不存在或已下架');
    }
    return {
      id: toNum(poi.id),
      name: poi.name,
      coverUrl: poi.coverUrl,
      intro: poi.intro,
      address: poi.address,
      category: poi.category,
      city: poi.city,
    };
  }
}
