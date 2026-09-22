import { fetchCurrent, type ItineraryItem } from '../../../api/modules/itinerary'

Page({
  data: {
    name: '',
    summary: '',
    phase: '',
    canAdjust: true,
    items: [] as ItineraryItem[],
  },
  onShow() {
    fetchCurrent()
      .then((v) => {
        this.setData({
          name: v.plan?.name || '当前行程',
          summary: v.plan?.attractionSummary || '',
          phase: v.phase,
          canAdjust: v.canAdjust,
          items: v.days.flatMap((d) => d.items),
        })
      })
      .catch(() => {
        this.setData({ name: '暂无行程', items: [] })
      })
  },
  goReport() {
    wx.redirectTo({ url: '/pages/itinerary/summary-report/index' })
  },
})
