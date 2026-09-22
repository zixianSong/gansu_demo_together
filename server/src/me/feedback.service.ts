import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import { CreateFeedbackDto } from '../auth/dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateFeedbackDto) {
    const title = dto.title.trim();
    const body = dto.content.trim();
    const row = await this.prisma.feedback.create({
      data: {
        userId: BigInt(userId),
        type: dto.type ?? 2,
        content: `【${title}】\n${body}`,
        contact: dto.contact?.trim() || null,
        status: 0,
      },
    });
    return { feedbackId: toNum(row.feedbackId), status: row.status };
  }
}
