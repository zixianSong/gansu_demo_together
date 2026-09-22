const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    loggedIn: false,
    userInfo: mine.profileView(null),
    orderEntries: [
      { tab: 'unpaid', label: '待支付', icon: '📅' },
      { tab: 'togo', label: '待出行', icon: '⏰' },
      { tab: 'review', label: '待评价', icon: '★' },
      { tab: 'refund', label: '退款/售后', icon: '↺' },
    ],
    menuList: [
      { key: 'footprint', title: '我的足迹', url: '/pages/footprint/footprint', login: true },
      { key: 'reviews', title: '我的评价', url: '/pages/reviews/reviews', login: true },
      { key: 'favorites', title: '我的收藏', url: '/pages/favorites/favorites', login: true },
      { key: 'feedback', title: '我的反馈投诉', url: '/pages/feedback/feedback', login: true },
      { key: 'travelers', title: '出行人信息', url: '/pages/travelers/travelers', login: true },
      { key: 'privacy', title: '隐私政策简要版', url: '/pages/privacy/privacy', login: false },
      { key: 'collection-list', title: '个人信息收集清单', url: '/pages/mine-doc/mine-doc?type=collect', login: false },
      { key: 'permissions', title: '应用权限说明', url: '/pages/mine-doc/mine-doc?type=permissions', login: false },
      { key: 'service', title: '在线客服', url: '', login: false },
      { key: 'about', title: '关于我们', url: '/pages/mine-doc/mine-doc?type=about', login: false },
    ],
  },

  onShow() {
    this.syncUser()
  },

  syncUser() {
    if (!mine.isLoggedIn()) {
      this.setData({ loggedIn: false, userInfo: mine.profileView(null) })
      return
    }
    mine.getProfile().then((user) => {
      this.setData({ loggedIn: true, userInfo: mine.profileView(user) })
    })
  },

  onLogin() {
    if (this.data.loggedIn) {
      this.onOpenProfile()
      return
    }
    mine.wechatLogin().then(() => this.syncUser()).catch((err) => toast((err && err.message) || '登录失败'))
  },

  onOpenProfile() {
    this.guardThen(() => wx.navigateTo({ url: '/pages/profile/profile' }))
  },

  onOpenOrders(e) {
    const tab = e.currentTarget.dataset.tab || 'all'
    this.guardThen(() => wx.navigateTo({ url: `/pages/orders/orders?tab=${tab}` }))
  },

  guardThen(fn) {
    mine.requireLogin().then((ok) => {
      if (ok) fn()
    })
  },

  onMenuTap(e) {
    const key = e.currentTarget.dataset.key
    const item = this.data.menuList.find((menu) => menu.key === key)
    if (key === 'service') {
      mine.openCustomerService().catch(() => toast('客服暂不可用'))
      return
    }
    if (!item || !item.url) return
    if (item.login) {
      this.guardThen(() => wx.navigateTo({ url: item.url }))
      return
    }
    wx.navigateTo({ url: item.url })
  },
})
