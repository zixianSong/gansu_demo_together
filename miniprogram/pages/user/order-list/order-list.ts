import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'unpaid', label: '待支付' },
      { key: 'togo', label: '待出行' },
      { key: 'review', label: '待评价' },
      { key: 'refund', label: '退款/售后' },
    ],
    activeTab: 'all',
    keyword: '',
    list: [] as Array<{ id?: string; orderId?: number; status?: string }>,
  },

  onLoad(query: Record<string, string | undefined>) {
    this.setData({ activeTab: (query && query.tab) || 'all' })
  },

  onShow() {
    this.loadList()
  },

  onTabChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeTab: e.currentTarget.dataset.key as string })
    this.loadList()
  },

  onSearch(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value })
    this.loadList()
  },

  loadList() {
    mine
      .fetchOrders({ tab: this.data.activeTab, keyword: this.data.keyword })
      .then((res) => this.setData({ list: res.list }))
      .catch((err: unknown) => toast(errMsg(err, '加载失败')))
  },

  onOpenDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/user/order-detail/order-detail?id=${id}` })
  },

  onAction(e: WechatMiniprogram.TouchEvent) {
    const action = e.currentTarget.dataset.action as string
    const id = e.currentTarget.dataset.id
    this.runAction(action, id)
  },

  runAction(action: string, id: string | number) {
    if (action === 'review') {
      wx.navigateTo({ url: `/pages/user/review-create/review-create?id=${id}` })
      return
    }
    if (action === 'voucher') {
      wx.navigateTo({ url: `/pages/user/order-detail/order-detail?id=${id}&focus=voucher` })
      return
    }
    if (action === 'rebook') {
      mine.handleRebook(id)
      return
    }
    if (action === 'pay') {
      mine.payOrder(id).then((res) => {
        if (res && res.mock) toast(res.message || '')
        this.loadList()
      })
      return
    }
    if (action === 'cancel') {
      const togo = this.data.list.find((item) => item.id === String(id) || item.orderId === Number(id))
      const content = togo && togo.status === 'togo' ? '确认取消？将提交退款申请' : '确认取消该订单？'
      wx.showModal({
        title: '取消订单',
        content,
        success: (res) => {
          if (!res.confirm) return
          mine
            .cancelOrder(id)
            .then(() => {
              toast('已提交')
              this.loadList()
            })
            .catch((err: unknown) => toast(errMsg(err, '无法取消')))
        },
      })
      return
    }
    if (action === 'delete') {
      wx.showModal({
        title: '删除订单',
        content: '删除后列表中不再显示',
        success: (res) => {
          if (!res.confirm) return
          mine
            .deleteOrder(id)
            .then(() => {
              toast('已删除')
              this.loadList()
            })
            .catch((err: unknown) => toast(errMsg(err, '无法删除')))
        },
      })
    }
  },
})
