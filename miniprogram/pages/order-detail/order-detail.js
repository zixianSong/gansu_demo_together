const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    order: {},
    traveler: {},
    voucher: {},
    usedCount: 0,
    totalCount: 0,
    showCancel: false,
    showVoucher: false,
    snapshotNote: '',
    refundRule: '',
  },

  onLoad(query) {
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
        const traveler = (order.travelers && order.travelers[0]) || {}
        const voucher = (order.vouchers && order.vouchers[0]) || {}
        const actions = order.actions || []
        this.setData({
          order: mine.toOrderCard(order),
          raw: order,
          traveler,
          voucher,
          usedCount: (order.voucherSummary && order.voucherSummary.usedCount) || 0,
          totalCount: (order.voucherSummary && order.voucherSummary.totalCount) || 0,
          showCancel: actions.indexOf('cancel') >= 0,
          showVoucher: actions.indexOf('voucher') >= 0 || (order.vouchers && order.vouchers.length > 0),
          snapshotNote: order.snapshotNote,
          refundRule: order.refundRule,
          statusDesc: order.statusHint || '',
        })
      })
      .catch((err) => toast((err && err.message) || '加载失败'))
  },

  onShowVoucher() {
    toast('请向工作人员出示上方二维码')
  },

  onCopy() {
    wx.setClipboardData({ data: this.data.order.orderNo })
  },

  onFee() {
    const fee = (this.data.raw && this.data.raw.feeDetail) || {}
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
          .catch((err) => toast((err && err.message) || '无法取消'))
      },
    })
  },

  onRebook() {
    mine.handleRebook(this.orderId)
  },
})
