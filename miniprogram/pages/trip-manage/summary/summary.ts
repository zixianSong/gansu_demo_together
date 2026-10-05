import { fetchCurrent, type ItineraryItem } from '../../../api/modules/trip-manage'

Page({
  data: {
    mode: 'review' as 'review' | 'report',
    name: '',
    summary: '',
    phase: '',
    canAdjust: true,
    items: [] as ItineraryItem[],
    badges: '暂无',
    analytics: '暂无',
  },
  onShow() {
    fetchCurrent()
      .then((v) => {
        this.setData({
          name: v.plan?.name || (this.data.mode === 'report' ? '行程报告' : '当前行程'),
          summary: v.plan?.attractionSummary || '',
          phase: v.phase,
          canAdjust: v.canAdjust,
          items: v.days.flatMap((d) => d.items),
          badges: v.plan?.badges ? JSON.stringify(v.plan.badges) : '暂无',
          analytics: v.plan?.analytics ? JSON.stringify(v.plan.analytics) : '暂无',
        })
      })
      .catch(() => {
        this.setData({
          name: this.data.mode === 'report' ? '暂无报告' : '暂无行程',
          items: [],
        })
      })
  },
  showReview() {
    this.setData({ mode: 'review' })
  },
  showReport() {
    this.setData({ mode: 'report' })
  },
})
