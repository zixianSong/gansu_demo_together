import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  orderId: '',
  focusVoucher: false,

  data: {
    order: {} as Record<string, unknown>,
    traveler: {} as Record<string, unknown>,
    voucher: {} as Record<string, unknown>,
    usedCount: 0,
    totalCount: 0,
    showCancel: false,
    showVoucher: false,
    snapshotNote: '',
    refundRule: '',
    raw: {} as Record<string, unknown>,
    statusDesc: '',
  },

  onLoad(query: Record<string, string | undefined>) {
    this.orderId = (query && query.id) || ''
    this.focusVoucher = query && query.focus === 'voucher'
  },

  onShow() {
    this.loadDetail()
  },

  loadDetail() {
    mine
      .fetchOrderDetail(this.orderId)
      .then((order) => {
        const travelers = order.travelers || []
        const vouchers = order.vouchers || []
        const actions = order.actions || []
        const summary = order.voucherSummary || {}
        this.setData({
          order: mine.toOrderCard(order),
          raw: order as unknown as Record<string, unknown>,
          traveler: (travelers[0] || {}) as Record<string, unknown>,
          voucher: (vouchers[0] || {}) as Record<string, unknown>,
          usedCount: summary.usedCount || 0,
          totalCount: summary.totalCount || 0,
          showCancel: actions.indexOf('cancel') >= 0,
          showVoucher: actions.indexOf('voucher') >= 0 || vouchers.length > 0,
          snapshotNote: order.snapshotNote,
          refundRule: order.refundRule,
          statusDesc: order.statusHint || '',
        })
      })
      .catch((err: unknown) => toast(errMsg(err, '加载失败')))
  },

  onShowVoucher() {
    toast('请向工作人员出示上方二维码')
  },

  onCopy() {
    wx.setClipboardData({ data: String(this.data.order.orderNo || '') })
  },

  onFee() {
    const fee = (this.data.raw && (this.data.raw.feeDetail as Record<string, unknown>)) || {}
    toast(`应付 ¥${fee.totalAmount || this.data.order.price}，实付 ¥${fee.payAmount || this.data.order.price}`)
  },

  onCancel() {
    const status = this.data.order.status
    const content = status === 'togo' ? '确认取消？将提交退款申请' : '确认取消该订单？'
    wx.showModal({
      title: '取消订单',
      content,
      success: (res) => {
        if (!res.confirm) return
        mine
          .cancelOrder(this.orderId)
          .then(() => {
            toast('已提交')
            this.loadDetail()
          })
          .catch((err: unknown) => toast(errMsg(err, '无法取消')))
      },
    })
  },

  onRebook() {
    mine.handleRebook(this.orderId)
  },
})
