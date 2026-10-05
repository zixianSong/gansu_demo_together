import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
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
      { key: 'footprint', title: '我的足迹', url: '/pages/user/footprint/footprint', login: true },
      { key: 'reviews', title: '我的评价', url: '/pages/user/review-list/review-list', login: true },
      { key: 'favorites', title: '我的收藏', url: '/pages/user/favorite/favorite', login: true },
      { key: 'feedback', title: '我的反馈投诉', url: '/pages/user/complaint/complaint', login: true },
      { key: 'travelers', title: '出行人信息', url: '/pages/user/passenger-list/passenger-list', login: true },
      { key: 'privacy', title: '隐私政策简要版', url: '/pages/user/privacy-policy/privacy-policy', login: false },
      { key: 'collection-list', title: '个人信息收集清单', url: '/pages/user/about/about?type=collect', login: false },
      { key: 'permissions', title: '应用权限说明', url: '/pages/user/about/about?type=permissions', login: false },
      { key: 'service', title: '在线客服', url: '', login: false },
      { key: 'about', title: '关于我们', url: '/pages/user/about/about?type=about', login: false },
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
    mine.wechatLogin().then(() => this.syncUser()).catch((err: unknown) => toast(errMsg(err, '登录失败')))
  },

  onOpenProfile() {
    this.guardThen(() => wx.navigateTo({ url: '/pages/user/profile/profile' }))
  },

  onOpenOrders(e: WechatMiniprogram.TouchEvent) {
    const tab = (e.currentTarget.dataset.tab as string) || 'all'
    this.guardThen(() => wx.navigateTo({ url: `/pages/user/order-list/order-list?tab=${tab}` }))
  },

  guardThen(fn: () => void) {
    mine.requireLogin().then((ok: boolean) => {
      if (ok) fn()
    })
  },

  onMenuTap(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as string
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
