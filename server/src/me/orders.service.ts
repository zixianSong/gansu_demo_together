import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import { Prisma } from '@prisma/client';
import {
  ID_TYPE,
  isHidden,
  maskId,
  maskPhone,
  matchTab,
  money,
  snapshotOf,
  STATUS_HINT,
  STATUS_TEXT,
  toOrderCard,
} from './order.mapper';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, query: { tab?: string; keyword?: string; page?: string; pageSize?: string }) {
    const tab = query.tab || 'all';
    const keyword = (query.keyword || '').trim();
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));

    const rows = await this.prisma.order.findMany({
      where: { userId: BigInt(userId) },
      include: { vouchers: true },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = rows.filter((row) => {
      if (isHidden(row.snapshot)) return false;
      if (!matchTab(row.status, row.refundStatus, tab)) return false;
      if (keyword && !row.productName.includes(keyword) && !row.orderNo.includes(keyword)) {
        return false;
      }
      return true;
    });

    const total = filtered.length;
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
    return {
      list: pageRows.map((row) => toOrderCard(row, this.usedVoucher(row.vouchers))),
      pagination: { page, pageSize, total },
    };
  }

  async detail(userId: number, orderId: number) {
    const order = await this.loadOwn(userId, orderId);
    const used = this.usedVoucher(order.vouchers);
    const card = toOrderCard(order, used);
    const snap = snapshotOf(order.snapshot);
    const fee = (snap.feeDetail as Record<string, unknown> | undefined) || {};
    return {
      ...card,
      statusHint: STATUS_HINT[order.status] || '',
      travelers: order.travelers.map((item) => ({
        name: item.name,
        idType: item.idType ?? 1,
        idTypeText: ID_TYPE[item.idType ?? 1] || '身份证',
        idNumber: maskId(item.idNumber),
        phone: maskPhone(item.phone),
      })),
      vouchers: order.vouchers.map((item) => ({
        voucherId: toNum(item.voucherId),
        source: 'ticket',
        qrcodeData: item.qrcodeData,
        qrcodeImage: item.qrcodeImage,
        status: item.status,
        statusText: item.status === 2 ? '已使用' : item.status === 3 ? '已过期' : '待使用',
      })),
      voucherSummary: {
        usedCount: order.vouchers.filter((item) => item.status === 2).length,
        totalCount: order.vouchers.length,
      },
      feeDetail: {
        totalAmount: money(fee.totalAmount ?? order.totalAmount),
        discountAmount: money(fee.discountAmount ?? order.discountAmount),
        payAmount: money(fee.payAmount ?? order.payAmount),
      },
      snapshotNote: String(snap.snapshotNote || '作为本订单交易凭证，与订单具有同等效力'),
      refundRule: String(snap.refundRule || '未使用可随时退，部分使用不可退'),
    };
  }

  async cancel(userId: number, orderId: number, reason?: string) {
    const order = await this.loadOwn(userId, orderId);
    if ([4, 5, 6, 7].includes(order.status)) {
      throw new ConflictException('当前状态不可取消');
    }
    if (order.status === 3) {
      throw new ConflictException('履约中不可取消');
    }
    if (this.usedVoucher(order.vouchers)) {
      throw new ConflictException('已使用不可取消');
    }
    if (order.status === 1) {
      await this.prisma.$transaction([
        this.prisma.order.update({
          where: { orderId: order.orderId },
          data: { status: 7, cancelTime: new Date() },
        }),
        this.prisma.payment.updateMany({
          where: { orderId: order.orderId, status: 1 },
          data: { status: 4 },
        }),
        this.prisma.orderStatusLog.create({
          data: {
            orderId: order.orderId,
            fromStatus: 1,
            toStatus: 7,
            operator: 'user',
            remark: reason || '用户取消待支付订单',
          },
        }),
      ]);
      return { orderId, status: 7, statusText: STATUS_TEXT[7] };
    }
    if (order.status === 2) {
      const refund = await this.prisma.$transaction(async (tx) => {
        const rec = await tx.refundRecord.create({
          data: {
            orderId: order.orderId,
            refundAmount: order.payAmount,
            reason: reason || '用户取消待出行',
            status: 1,
          },
        });
        await tx.order.update({
          where: { orderId: order.orderId },
          data: { status: 6, refundStatus: 1, cancelTime: new Date() },
        });
        await tx.orderStatusLog.create({
          data: {
            orderId: order.orderId,
            fromStatus: 2,
            toStatus: 6,
            operator: 'user',
            remark: reason || '用户取消待出行，提交退款',
          },
        });
        return rec;
      });
      return {
        orderId,
        status: 6,
        statusText: STATUS_TEXT[6],
        refundId: toNum(refund.id),
        refundStatus: 1,
      };
    }
    throw new ConflictException('当前状态不可取消');
  }

  async remove(userId: number, orderId: number) {
    const order = await this.loadOwn(userId, orderId);
    if (order.status !== 6 && order.status !== 7) {
      throw new ConflictException('当前状态不可删除');
    }
    const snap = snapshotOf(order.snapshot);
    snap.userHidden = true;
    await this.prisma.order.update({
      where: { orderId: order.orderId },
      data: { snapshot: snap as Prisma.InputJsonValue },
    });
    return null;
  }

  async refund(userId: number, orderId: number, reason?: string) {
    const order = await this.loadOwn(userId, orderId);
    if (order.status !== 2) {
      if (order.status === 3) {
        throw new ConflictException('履约中不可取消');
      }
      if (this.usedVoucher(order.vouchers)) {
        throw new ConflictException('已使用不可取消');
      }
      throw new ConflictException('当前状态不可取消');
    }
    const result = await this.cancel(userId, orderId, reason);
    if (!('refundId' in result) || result.refundId == null) {
      throw new ConflictException('当前状态不可取消');
    }
    return {
      refundId: result.refundId,
      orderId,
      status: 1,
      statusText: '待审核',
      refundAmount: money(order.payAmount),
    };
  }

  async rebook(userId: number, orderId: number) {
    const order = await this.loadOwn(userId, orderId);
    const productId = toNum(order.productId) || 0;
    return {
      enabled: false,
      productType: order.productType,
      productId,
      path: `/pages/ticket/detail?productId=${productId}`,
      message: '购票功能即将上线',
    };
  }

  private usedVoucher(vouchers: { status: number }[]) {
    return vouchers.some((item) => item.status === 2);
  }

  private async loadOwn(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { orderId: BigInt(orderId) },
      include: { travelers: { orderBy: { sortOrder: 'asc' } }, vouchers: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!order || isHidden(order.snapshot)) {
      throw new NotFoundException('订单不存在');
    }
    if (Number(order.userId) !== userId) {
      throw new ForbiddenException('无权操作');
    }
    return order;
  }
}
