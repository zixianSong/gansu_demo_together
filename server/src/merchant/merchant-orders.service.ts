import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { money, maskId, maskPhone } from '../me/order.mapper';
import { toNum } from '../common/utils/serialize';

/** C 端 orders.status → 商家端 1待支付 2已支付 3已使用 4已退款 5已过期 */
function merchantStatus(status: number, refundStatus: number) {
  if (refundStatus >= 2) return 4;
  if (status === 1) return 1;
  if (status === 7) return 5;
  if (status === 6) return 4;
  if (status === 4 || status === 5) return 3;
  return 2;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtDateTime(value: Date | null | undefined) {
  if (!value) return null;
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

function fmtDate(value: Date | null | undefined) {
  if (!value) return null;
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function dayStart(date: string) {
  return new Date(`${date}T00:00:00`);
}

function dayEnd(date: string) {
  return new Date(`${date}T23:59:59`);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const PAY_TEXT: Record<string, string> = {
  wxpay: '微信支付',
  wechat: '微信支付',
  alipay: '支付宝',
};

@Injectable()
export class MerchantOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: {
    keyword?: string;
    dateStart?: string;
    dateEnd?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where = this.buildWhere(query);
    const [total, rows] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: { travelers: true, vouchers: true, payments: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      list: rows.map((row) => this.toListItem(row)),
      page,
      pageSize,
      total,
    };
  }

  async summary() {
    const t = todayStr();
    const start = dayStart(t);
    const end = dayEnd(t);
    const todayOrders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { vouchers: true },
    });
    const paidToday = await this.prisma.order.findMany({
      where: { payTime: { gte: start, lte: end }, status: { in: [2, 3, 4, 5] } },
    });
    let usedCount = 0;
    let unusedCount = 0;
    const playDay = await this.prisma.order.findMany({
      where: { travelDate: start, status: { in: [2, 3, 4, 5] } },
      include: { vouchers: true },
    });
    playDay.forEach((o) => {
      o.vouchers.forEach((v) => {
        if (v.status === 2) usedCount += 1;
        else if (v.status === 1) unusedCount += 1;
      });
      if (!o.vouchers.length && merchantStatus(o.status, o.refundStatus) === 2) {
        unusedCount += o.quantity ?? 1;
      }
      if (!o.vouchers.length && merchantStatus(o.status, o.refundStatus) === 3) {
        usedCount += o.quantity ?? 1;
      }
    });
    const refundCount = todayOrders.filter((o) => o.status === 6 || o.refundStatus >= 2).length;
    return {
      totalOrders: todayOrders.length,
      usedCount,
      unusedCount,
      refundCount,
      paidAmount: paidToday.reduce((s, o) => s + money(o.payAmount), 0),
    };
  }

  async todos() {
    const refunds = await this.prisma.order.count({
      where: { OR: [{ status: 6 }, { refundStatus: 1 }] },
    });
    return {
      refunds: { count: refunds, hint: '游客发起退款，请尽快处理' },
      exceptions: { count: 0, hint: '同一二维码多次核销，请人工核实' },
    };
  }

  async detail(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { orderId: BigInt(orderId) },
      include: {
        travelers: { orderBy: { sortOrder: 'asc' } },
        vouchers: { orderBy: { sortOrder: 'asc' } },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('订单不存在');
    const traveler = order.travelers[0];
    const payment = order.payments.find((p) => p.status === 2) || order.payments[0];
    const mStatus = merchantStatus(order.status, order.refundStatus);
    const qty = order.quantity ?? 1;
    const unit = money(order.unitPrice ?? order.payAmount);
    const vouchers = order.vouchers.length
      ? order.vouchers.map((v) => ({
          id: toNum(v.voucherId),
          qrCode: v.qrcodeData,
          verifyCode: v.qrcodeData,
          status: v.status,
          usedTime: fmtDateTime(v.useTime),
        }))
      : [{
          id: 0,
          qrCode: '',
          verifyCode: '',
          status: mStatus === 3 ? 2 : mStatus === 4 ? 3 : 1,
          usedTime: null,
        }];
    const used = order.vouchers.find((v) => v.status === 2);
    return {
      id: toNum(order.orderId),
      status: mStatus,
      orderNo: order.orderNo,
      createdAt: fmtDateTime(order.createdAt),
      payMethod: PAY_TEXT[payment?.payMethod || 'wxpay'] || payment?.payMethod || '微信支付',
      payTime: fmtDateTime(order.payTime),
      visitorName: traveler?.name || '游客',
      visitorPhone: maskPhone(traveler?.phone) || '',
      visitorIdCard: maskId(traveler?.idNumber || ''),
      totalAmount: money(order.totalAmount),
      discountAmount: money(order.discountAmount),
      paidAmount: money(order.payAmount),
      checkTime: fmtDateTime(used?.useTime),
      operatorId: null,
      operatorPhoneMask: null,
      items: [
        {
          id: toNum(order.orderId),
          ticketName: order.productName,
          unitPrice: unit,
          quantity: qty,
          playDate: fmtDate(order.travelDate),
          status: mStatus === 3 ? 2 : mStatus === 4 ? 3 : 1,
          vouchers,
        },
      ],
    };
  }

  async checkIns(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { orderId: BigInt(orderId) },
      include: { vouchers: true },
    });
    if (!order) throw new NotFoundException('订单不存在');
    const list = order.vouchers
      .filter((v) => v.status === 2)
      .map((v) => ({
        voucherId: toNum(v.voucherId),
        verifyCode: v.qrcodeData,
        checkTime: fmtDateTime(v.useTime),
        checkMethod: 1,
        operatorId: null,
        operatorPhoneMask: null,
      }));
    return { list };
  }

  private buildWhere(query: {
    keyword?: string;
    dateStart?: string;
    dateEnd?: string;
    status?: string;
  }): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = { productType: 1 };
    const keyword = (query.keyword || '').trim();
    const and: Prisma.OrderWhereInput[] = [];
    if (query.dateStart || query.dateEnd) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (query.dateStart) createdAt.gte = dayStart(query.dateStart);
      if (query.dateEnd) createdAt.lte = dayEnd(query.dateEnd);
      and.push({ createdAt });
    }
    const merchantSt = query.status ? Number(query.status) : 0;
    if (merchantSt === 1) and.push({ status: 1 });
    else if (merchantSt === 2) and.push({ status: { in: [2, 3] } });
    else if (merchantSt === 3) and.push({ status: { in: [4, 5] } });
    else if (merchantSt === 4) and.push({ OR: [{ status: 6 }, { refundStatus: { gte: 2 } }] });
    else if (merchantSt === 5) and.push({ status: 7 });
    if (keyword) {
      and.push({
        OR: [
          { orderNo: { contains: keyword } },
          { productName: { contains: keyword } },
          { travelers: { some: { phone: { contains: keyword } } } },
        ],
      });
    }
    if (and.length) where.AND = and;
    return where;
  }

  private toListItem(row: {
    orderId: bigint;
    orderNo: string;
    productName: string;
    quantity: number | null;
    payAmount: unknown;
    status: number;
    refundStatus: number;
    createdAt: Date;
    travelers: { phone: string | null }[];
  }) {
    const qty = row.quantity ?? 1;
    const mStatus = merchantStatus(row.status, row.refundStatus);
    return {
      id: toNum(row.orderId),
      orderNo: row.orderNo,
      orderNoMask: '...' + row.orderNo.slice(-4),
      ticketSummary: `${row.productName} × ${qty}`,
      ticketName: row.productName,
      qty,
      paidAmount: money(row.payAmount),
      status: mStatus,
      createdAt: fmtDateTime(row.createdAt),
      visitorPhoneMask: maskPhone(row.travelers[0]?.phone) || '',
    };
  }
}
