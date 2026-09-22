import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import { CATEGORY, isHidden, snapshotOf, toOrderCard } from './order.mapper';
import { CreateReviewDto } from '../auth/dto';

const RATING_LABEL: Record<number, string> = {
  1: '非常不满意',
  2: '不满意',
  3: '一般',
  4: '满意',
  5: '非常满意',
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async pending(userId: number, query: { page?: string; pageSize?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
    const rows = await this.prisma.order.findMany({
      where: { userId: BigInt(userId), status: 4 },
      include: { vouchers: true, reviews: { where: { deletedAt: null } } },
      orderBy: { createdAt: 'desc' },
    });
    const filtered = rows.filter((row) => !isHidden(row.snapshot) && row.reviews.length === 0);
    const total = filtered.length;
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
    return {
      list: pageRows.map((row) => {
        const snap = snapshotOf(row.snapshot);
        const card = toOrderCard(row, row.vouchers.some((item) => item.status === 2));
        return {
          ...card,
          placeName: String(snap.placeName || row.productName),
          placeAddress: String(snap.placeAddress || ''),
          actions: ['review', 'rebook', 'voucher'],
        };
      }),
      pagination: { page, pageSize, total },
    };
  }

  async posted(userId: number, query: { page?: string; pageSize?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
    const where = { userId: BigInt(userId), deletedAt: null };
    const total = await this.prisma.review.count({ where });
    const rows = await this.prisma.review.findMany({
      where,
      include: { order: true },
      orderBy: { reviewTime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      list: rows.map((row) => {
        const snap = snapshotOf(row.order.snapshot);
        return {
          reviewId: toNum(row.reviewId),
          orderId: toNum(row.orderId),
          rating: row.rating,
          ratingLabel: row.ratingLabel || RATING_LABEL[row.rating] || '',
          content: row.content || '',
          images: Array.isArray(row.images) ? row.images : [],
          isAnonymous: row.isAnonymous === 1,
          reviewTime: (row.reviewTime || row.createdAt).toISOString(),
          placeName: String(snap.placeName || row.productName || row.order.productName),
          categoryLabel: CATEGORY[row.productType || row.order.productType] || '其他',
        };
      }),
      pagination: { page, pageSize, total },
    };
  }

  async create(userId: number, dto: CreateReviewDto, uploadBase: string) {
    const orderId = Number(dto.orderId);
    const order = await this.prisma.order.findUnique({
      where: { orderId: BigInt(orderId) },
      include: { reviews: { where: { deletedAt: null } } },
    });
    if (!order || isHidden(order.snapshot)) {
      throw new NotFoundException('订单不存在');
    }
    if (Number(order.userId) !== userId) {
      throw new ForbiddenException('无权操作');
    }
    if (order.status !== 4) {
      throw new ConflictException('订单非待评价或已评');
    }
    if (order.reviews.length) {
      throw new ConflictException('订单非待评价或已评');
    }
    const images = this.normalizeImages(dto.images, uploadBase);
    const isAnonymous = dto.isAnonymous !== false;
    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          userId: BigInt(userId),
          orderId: order.orderId,
          productType: order.productType,
          productId: order.productId,
          productName: order.productName,
          rating: dto.rating,
          ratingLabel: dto.ratingLabel || RATING_LABEL[dto.rating],
          content: (dto.content || '').slice(0, 200),
          images: images as Prisma.InputJsonValue,
          isAnonymous: isAnonymous ? 1 : 0,
          reviewTime: new Date(),
        },
      });
      await tx.order.update({
        where: { orderId: order.orderId },
        data: { status: 5 },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.orderId,
          fromStatus: 4,
          toStatus: 5,
          operator: 'user',
          remark: '用户提交评价',
        },
      });
      return created;
    });
    return { reviewId: toNum(review.reviewId), orderId };
  }

  async setAnonymous(userId: number, reviewId: number, isAnonymous: boolean) {
    const review = await this.prisma.review.findFirst({
      where: { reviewId: BigInt(reviewId), deletedAt: null },
    });
    if (!review) {
      throw new NotFoundException('评价不存在');
    }
    if (Number(review.userId) !== userId) {
      throw new ForbiddenException('无权操作');
    }
    const updated = await this.prisma.review.update({
      where: { reviewId: review.reviewId },
      data: { isAnonymous: isAnonymous ? 1 : 0 },
    });
    return { reviewId, isAnonymous: updated.isAnonymous === 1 };
  }

  saveMedia(file: Express.Multer.File | undefined, publicBase: string) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    const image = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    const video = file.mimetype === 'video/mp4';
    if (!image && !video) {
      throw new BadRequestException('仅支持 jpg/png/webp/mp4');
    }
    if (image && file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('图片不能超过 2MB');
    }
    if (video && file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('视频不能超过 10MB');
    }
    return {
      url: `${publicBase}/uploads/reviews/${file.filename}`,
      kind: image ? 'image' : 'video',
    };
  }

  private normalizeImages(images: string[] | undefined, uploadBase: string) {
    const list = Array.isArray(images) ? images : [];
    if (list.length > 9) {
      throw new BadRequestException('最多 9 个媒体');
    }
    const videos = list.filter((url) => /\.mp4(\?|$)/i.test(url));
    if (videos.length > 1) {
      throw new BadRequestException('视频最多 1 个');
    }
    const prefix = `${uploadBase}/uploads/reviews/`;
    for (const url of list) {
      if (!url || url.indexOf('://') < 0 || url.startsWith('wxfile://') || url.startsWith('http://tmp')) {
        throw new BadRequestException('请先上传评价媒体');
      }
      if (!url.startsWith(prefix) && !url.includes('/uploads/reviews/')) {
        throw new BadRequestException('请先上传评价媒体');
      }
    }
    return list;
  }
}
