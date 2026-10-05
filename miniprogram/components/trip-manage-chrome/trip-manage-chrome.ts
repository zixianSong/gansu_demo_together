import {
  fetchCurrent,
  fetchSnapshots,
  restoreSnapshot,
} from '../../api/modules/trip-manage'

const VIEW_PAGE: Record<string, string> = {
  'multi-day': '/pages/trip-manage/multi-day/multi-day',
  map: '/pages/trip-manage/map/map',
  'single-day': '/pages/trip-manage/single-day/single-day',
  overview: '/pages/trip-manage/overview/overview',
}

Component({
  properties: {
    active: {
      type: String,
      value: 'multi-day',
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
      if (this.properties.active === 'multi-day') {
        if (getCurrentPages().length > 1) wx.navigateBack()
        return
      }
      wx.navigateBack({
        fail: () => wx.reLaunch({ url: '/pages/trip-manage/multi-day/multi-day' }),
      })
    },
    goView(e: WechatMiniprogram.TouchEvent) {
      const view = e.currentTarget.dataset.view as string
      if (view === this.properties.active) return
      const url = VIEW_PAGE[view]
      if (!url) return
      if (view === 'multi-day') {
        wx.reLaunch({ url })
        return
      }
      const open = this.properties.active === 'multi-day' ? wx.navigateTo : wx.redirectTo
      open({ url })
    },
    toggleMore() {
      this.setData({ showMore: !this.data.showMore })
    },
    closeMore() {
      this.setData({ showMore: false })
    },
    goPlans() {
      this.setData({ showMore: false })
      wx.navigateTo({ url: '/pages/plan/plan-index/plan-index' })
    },
    goSummary() {
      this.setData({ showMore: false })
      wx.navigateTo({ url: '/pages/trip-manage/summary/summary' })
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
