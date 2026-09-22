const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
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
    list: [],
  },

  onLoad(query) {
    this.setData({ activeTab: (query && query.tab) || 'all' })
  },

  onShow() {
    this.loadList()
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key })
    this.loadList()
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value })
    this.loadList()
  },

  loadList() {
    mine
      .fetchOrders({ tab: this.data.activeTab, keyword: this.data.keyword })
      .then((res) => this.setData({ list: res.list }))
      .catch((err) => toast((err && err.message) || '加载失败'))
  },

  onOpenDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` })
  },

  onAction(e) {
    const action = e.currentTarget.dataset.action
    const id = e.currentTarget.dataset.id
    this.runAction(action, id)
  },

  runAction(action, id) {
    if (action === 'review') {
      wx.navigateTo({ url: `/pages/review-form/review-form?id=${id}` })
      return
    }
    if (action === 'voucher') {
      wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}&focus=voucher` })
      return
    }
    if (action === 'rebook') {
      mine.handleRebook(id)
      return
    }
    if (action === 'pay') {
      mine.payOrder(id).then((res) => {
        if (res && res.mock) toast(res.message)
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
            .catch((err) => toast((err && err.message) || '无法取消'))
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
            .catch((err) => toast((err && err.message) || '无法删除'))
        },
      })
    }
  },
})
