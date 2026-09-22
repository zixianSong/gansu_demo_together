import { fetchPlans, type PlanCard } from '../../../api/modules/itinerary'

Page({
  data: {
    current: null as PlanCard | null,
    drafts: [] as PlanCard[],
    archived: [] as PlanCard[],
    isEmpty: true,
    showNew: false,
  },

  onLoad(query: Record<string, string | undefined>) {
    if (query.new === '1') this.setData({ showNew: true })
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const res = await fetchPlans()
      const list = res.list || []
      const current = list.find((p) => p.planStatus === 'current') || null
      const drafts = list.filter((p) => p.planStatus === 'draft')
      const archived = list.filter((p) => p.planStatus === 'archived')
      this.setData({
        current,
        drafts,
        archived,
        isEmpty: !current && !drafts.length && !archived.length,
      })
    } catch {
      this.setData({
        current: null,
        drafts: [],
        archived: [],
        isEmpty: true,
      })
    }
  },

  openNew() {
    this.setData({ showNew: true })
  },

  closeNew() {
    this.setData({ showNew: false })
  },

  pickClassic() {
    this.setData({ showNew: false })
    wx.showToast({ title: '经典线路模板待规划模块接入', icon: 'none' })
  },

  pickCustom() {
    this.setData({ showNew: false })
    wx.navigateTo({ url: '/pages/itinerary/adjust-chat/index' })
  },

  goCurrent() {
    wx.switchTab({ url: '/pages/xingchengguanli/xingchengguanli' })
  },

  goSwitch(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/itinerary/plans-switch/index?targetPlanId=${id}` })
  },
})
