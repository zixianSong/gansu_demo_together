import { fetchCurrent, type ItineraryDay, type ItineraryItem } from '../../../api/modules/itinerary'
import { formatClock, formatCnDate, formatDayMeta } from '../../../utils/itinerary-format'

type DayChip = { dayNumber: number | null; shortDate: string }
type Picked = ItineraryItem & { timeLabel: string }

function withCoord(n: ItineraryItem) {
  return n.latitude != null && n.longitude != null
}

Page({
  data: {
    days: [] as ItineraryDay[],
    dayIndex: 0,
    title: '',
    subtitle: '',
    dayChips: [] as DayChip[],
    latitude: 36.0611,
    longitude: 103.8343,
    scale: 10,
    markers: [] as WechatMiniprogram.MapMarker[],
    polyline: [] as WechatMiniprogram.MapPolyline[],
    includePoints: [] as Array<{ latitude: number; longitude: number }>,
    picked: null as Picked | null,
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const view = await fetchCurrent()
      const days = view.days || []
      const dayChips = days.map((d) => ({
        dayNumber: d.dayNumber,
        shortDate: (d.date || '').slice(5).replace('-', '/'),
      }))
      this.setData({ days, dayChips })
      this.renderDay(this.data.dayIndex)
    } catch {
      this.setData({ days: [], dayChips: [], markers: [], polyline: [], picked: null })
    }
  },

  renderDay(index: number) {
    const days = this.data.days
    if (!days.length) {
      this.setData({ title: '暂无行程', subtitle: '', markers: [], polyline: [], picked: null })
      return
    }
    const i = Math.min(Math.max(index, 0), days.length - 1)
    const d = days[i]
    const nodes = (d.items || []).filter(withCoord)
    const points = nodes.map((n) => ({
      latitude: Number(n.latitude),
      longitude: Number(n.longitude),
    }))
    const markers: WechatMiniprogram.MapMarker[] = nodes.map((n, idx) => ({
      id: Number(n.id || idx + 1),
      latitude: Number(n.latitude),
      longitude: Number(n.longitude),
      width: 28,
      height: 28,
      title: n.name || '',
      callout: {
        content: n.name || `节点${idx + 1}`,
        color: '#1e293b',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#ffffff',
        padding: 6,
        display: 'BYCLICK',
      },
    }))
    const polyline: WechatMiniprogram.MapPolyline[] =
      points.length >= 2
        ? [
            {
              points,
              color: '#2B6EEA',
              width: 4,
              dottedLine: false,
            },
          ]
        : []
    const first = points[0]
    this.setData({
      dayIndex: i,
      title: formatCnDate(d.date) || `第${d.dayNumber}天`,
      subtitle: formatDayMeta(d.date, d.dayNumber),
      latitude: first?.latitude ?? this.data.latitude,
      longitude: first?.longitude ?? this.data.longitude,
      scale: points.length > 1 ? 8 : 12,
      markers,
      polyline,
      includePoints: points,
      picked: null,
    })
  },

  prev() {
    this.renderDay(this.data.dayIndex - 1)
  },
  next() {
    this.renderDay(this.data.dayIndex + 1)
  },
  pickDay(e: WechatMiniprogram.TouchEvent) {
    this.renderDay(Number(e.currentTarget.dataset.index))
  },

  onMarkerTap(e: WechatMiniprogram.MapMarkerTap) {
    const id = Number(e.detail.markerId)
    const d = this.data.days[this.data.dayIndex]
    const node = (d?.items || []).find((n) => Number(n.id) === id)
    if (!node) return
    this.setData({
      picked: {
        ...node,
        timeLabel: [formatClock(node.exactStartTime), formatClock(node.exactEndTime)]
          .filter(Boolean)
          .join(' - '),
      },
    })
  },

  locate() {
    const map = wx.createMapContext('itinMap', this)
    map.moveToLocation({
      fail: () => {
        wx.showToast({ title: '无法定位', icon: 'none' })
      },
    })
  },

  openPoi(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) {
      wx.showToast({ title: '暂无详情', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
  },
})
