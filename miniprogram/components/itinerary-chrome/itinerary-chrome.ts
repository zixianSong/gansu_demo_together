import {
  fetchCurrent,
  fetchSnapshots,
  restoreSnapshot,
} from '../../api/modules/itinerary'

Component({
  properties: {
    active: {
      type: String,
      value: 'multiday',
    },
  },
  data: {
    showMore: false,
    showHist: false,
    statusBarHeight: 20,
    navHeight: 44,
    morePanelTop: 88,
    snapshots: [] as Array<{ id: number | null; createdAt: string | null }>,
  },
  lifetimes: {
    attached() {
      this.layoutChrome()
    },
  },
  pageLifetimes: {
    show() {
      this.layoutChrome()
    },
  },
  methods: {
    layoutChrome() {
      const sys = wx.getSystemInfoSync()
      const menu = wx.getMenuButtonBoundingClientRect()
      const statusBarHeight = sys.statusBarHeight || 20
      const valid = Boolean(menu && menu.width > 20 && menu.height > 0)
      const navHeight = valid
        ? Math.max(32, (menu.top - statusBarHeight) * 2 + menu.height)
        : 44
      this.setData({
        statusBarHeight,
        navHeight,
        morePanelTop: statusBarHeight + navHeight + 48,
      })
    },
    goBack() {
      if (this.properties.active === 'multiday') {
        wx.switchTab({ url: '/pages/index/index' })
        return
      }
      wx.navigateBack({
        fail: () => wx.switchTab({ url: '/pages/xingchengguanli/xingchengguanli' }),
      })
    },
    goView(e: WechatMiniprogram.TouchEvent) {
      const view = e.currentTarget.dataset.view as string
      if (view === this.data.active) return
      if (view === 'multiday') {
        wx.switchTab({ url: '/pages/xingchengguanli/xingchengguanli' })
        return
      }
      wx.navigateTo({ url: `/pages/itinerary/${view}/index` })
    },
    toggleMore() {
      this.setData({ showMore: !this.data.showMore })
    },
    closeMore() {
      this.setData({ showMore: false })
    },
    goPlans() {
      this.setData({ showMore: false })
      wx.navigateTo({ url: '/pages/itinerary/plans/index' })
    },
    goSummary() {
      this.setData({ showMore: false })
      wx.navigateTo({ url: '/pages/itinerary/summary-reviewing/index' })
    },
    async openHist() {
      this.setData({ showMore: false, showHist: true })
      try {
        const cur = await fetchCurrent()
        if (cur.plan?.id) {
          const res = await fetchSnapshots(cur.plan.id)
          this.setData({ snapshots: res.list || [] })
        }
      } catch {
        this.setData({ snapshots: [] })
      }
    },
    closeHist() {
      this.setData({ showHist: false })
    },
    async restore(e: WechatMiniprogram.TouchEvent) {
      const id = Number(e.currentTarget.dataset.id)
      if (!id) return
      try {
        const cur = await fetchCurrent()
        if (!cur.plan?.id) return
        await restoreSnapshot(cur.plan.id, id)
        wx.showToast({ title: '已切换版本', icon: 'none' })
        this.setData({ showHist: false })
        this.triggerEvent('restored')
      } catch (err) {
        wx.showToast({
          title: err instanceof Error ? err.message : '恢复失败',
          icon: 'none',
        })
      }
    },
  },
})
