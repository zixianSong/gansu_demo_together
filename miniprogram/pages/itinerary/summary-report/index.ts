import { fetchCurrent } from '../../../api/modules/itinerary'

Page({
  data: {
    name: '',
    summary: '',
    badges: '暂无',
    analytics: '暂无',
  },
  onShow() {
    fetchCurrent()
      .then((v) => {
        this.setData({
          name: v.plan?.name || '行程报告',
          summary: v.plan?.attractionSummary || '',
          badges: v.plan?.badges ? JSON.stringify(v.plan.badges) : '暂无',
          analytics: v.plan?.analytics ? JSON.stringify(v.plan.analytics) : '暂无',
        })
      })
      .catch(() => this.setData({ name: '暂无报告' }))
  },
  goReview() {
    wx.redirectTo({ url: '/pages/itinerary/summary-reviewing/index' })
  },
})
