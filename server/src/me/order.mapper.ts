import { toNum } from '../common/utils/serialize';

const STATUS_TEXT: Record<number, string> = {
  1: '待支付',
  2: '待出行',
  3: '待出行',
  4: '待评价',
  5: '已完成',
  6: '退款/售后',
  7: '已取消',
};

const STATUS_HINT: Record<number, string> = {
  1: '请尽快完成支付',
  2: '订单已确认，请按时出行',
  3: '订单已确认，请按时出行',
  4: '行程已结束，欢迎点评',
  5: '订单已完成',
  6: '退款处理中，请耐心等待',
  7: '订单已取消',
};

const CATEGORY: Record<number, string> = {
  1: '门票',
  2: '线路',
  3: '美食',
  4: '其他',
  5: '包车',
  6: '拼车',
};

const ID_TYPE: Record<number, string> = {
  1: '身份证',
  2: '护照',
  3: '港澳通行证',
  4: '台湾通行证',
};

export function money(value: unknown) {
  return Number(value ?? 0);
}

export function dateText(value: Date | null | undefined) {
  if (!value) return null;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function snapshotOf(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function isHidden(raw: unknown) {
  return snapshotOf(raw).userHidden === true;
}

export function matchTab(status: number, refundStatus: number, tab: string) {
  if (!tab || tab === 'all') return true;
  if (tab === 'unpaid') return status === 1;
  if (tab === 'togo') return status === 2 || status === 3;
  if (tab === 'review') return status === 4;
  if (tab === 'refund') return status === 6 || refundStatus > 0;
  return true;
}

export function buildActions(status: number, usedVoucher: boolean) {
  const actions: string[] = ['rebook'];
  if (status === 1) {
    actions.unshift('cancel');
    actions.push('pay');
  }
  if (status === 2 && !usedVoucher) {
    actions.unshift('cancel');
    actions.push('voucher');
  }
  if (status === 3) actions.push('voucher');
  if (status === 4) {
    actions.unshift('review');
    actions.push('voucher');
  }
  if (status === 6 || status === 7) actions.unshift('delete');
  return actions;
}

export function toOrderCard(order: {
  orderId: bigint;
  orderNo: string;
  productType: number;
  productId: bigint | null;
  productName: string;
  status: number;
  travelDate: Date | null;
  quantity: number | null;
  payAmount: unknown;
  refundStatus: number;
  snapshot: unknown;
}, usedVoucher: boolean) {
  const snap = snapshotOf(order.snapshot);
  const qty = order.quantity ?? 1;
  const payAmount = money(order.payAmount);
  const status = order.status;
  const payHint =
    status === 1 ? '在线支付' :
    status === 2 || status === 3 ? '已付款' :
    status === 4 ? '已核销' :
    order.refundStatus === 1 ? '退款中' :
    order.refundStatus >= 2 ? '已退款' : '';
  return {
    orderId: toNum(order.orderId),
    orderNo: order.orderNo,
    productType: order.productType,
    categoryLabel: CATEGORY[order.productType] || '其他',
    productId: toNum(order.productId),
    title: order.productName,
    status,
    statusText: STATUS_TEXT[status] || '',
    validDate: dateText(order.travelDate),
    quantity: qty,
    quantityText: `${qty}张`,
    usage: String(snap.usage || '凭身份证或二维码入园'),
    payAmount,
    payHint,
    actions: buildActions(status, usedVoucher),
  };
}

export function maskId(value: string) {
  if (!value || value.includes('*')) return value;
  if (value.length < 8) return value;
  return `${value.slice(0, 6)}${'*'.repeat(Math.max(8, value.length - 10))}${value.slice(-4)}`;
}

export function maskPhone(value: string | null) {
  if (!value) return null;
  if (value.includes('*') || value.length < 7) return value;
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
}

export { STATUS_TEXT, STATUS_HINT, CATEGORY, ID_TYPE };
