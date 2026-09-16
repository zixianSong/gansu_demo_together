import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDetail(id: number) {
    const route = await this.prisma.routeTemplate.findFirst({
      where: { id: BigInt(id), status: 1, deletedAt: null },
    });
    if (!route) {
      throw new NotFoundException('线路不存在或已下架');
    }
    return {
      id: toNum(route.id),
      name: route.name,
      coverUrl: route.coverUrl,
      intro: route.intro,
      address: null,
      subtitle: route.subtitle,
      daysCount: route.daysCount,
      destinationId: toNum(route.destinationId),
    };
  }
}
