import { fetchAmapWeather } from '../../../api/amap'
import {
  fetchCurrent,
  ignoreHint,
  postSense,
  type ItineraryDay,
  type ItineraryItem,
} from '../../../api/modules/trip-manage'
import {
  formatClock,
  formatCnDate,
  formatDayMeta,
  nodeKind,
  planCity,
} from '../../../utils/trip-manage-format'

type DayItem = ItineraryItem & {
  timeLabel: string
  endLabel: string
  kind: string
}

Page({
  data: {
    dayIndex: 0,
    days: [] as ItineraryDay[],
    items: [] as DayItem[],
    title: '',
    subtitle: '',
    weatherTemp: '--',
    weatherText: '暂无天气',
    weatherCity: '',
    hint: null as { key: string; message: string } | null,
    showSuggest: false,
    cities: [] as string[],
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const view = await fetchCurrent()
      const days = view.days || []
      const cities = Array.isArray(view.plan?.cities)
        ? (view.plan?.cities as string[])
        : []
      this.setData({ days, cities }, () => this.renderDay(this.data.dayIndex))
      this.sense()
    } catch {
      this.setData({ days: [], items: [] })
    }
  },

  async sense() {
    try {
      const loc = await new Promise<{ lat?: number; lng?: number }>((resolve) => {
        wx.getLocation({
          type: 'gcj02',
          success: (r) => resolve({ lat: r.latitude, lng: r.longitude }),
          fail: () => resolve({}),
        })
      })
      const sense = await postSense(loc)
      const first = (sense.hints || [])[0]
      this.setData({
        hint: first ? { key: first.key, message: first.message } : null,
        showSuggest: Boolean(first),
      })
    } catch {
      this.setData({ showSuggest: false })
    }
  },

  async renderDay(index: number) {
    const days = this.data.days
    if (!days.length) {
      this.setData({
        items: [],
        title: '暂无行程',
        subtitle: '',
        weatherTemp: '--',
        weatherText: '暂无天气',
      })
      return
    }
    const i = Math.min(Math.max(index, 0), days.length - 1)
    const d = days[i]
    const items: DayItem[] = (d.items || []).map((n) => ({
      ...n,
      timeLabel: formatClock(n.exactStartTime),
      endLabel: formatClock(n.exactEndTime),
      kind: nodeKind(n.type),
    }))
    const localWeather = d.weather as { text?: string; temp?: number } | null
    const city = planCity(this.data.cities)
    this.setData({
      dayIndex: i,
      items,
      title: formatCnDate(d.date) || `第${d.dayNumber}天`,
      subtitle: formatDayMeta(d.date, d.dayNumber),
      weatherCity: city || '行程城市',
      weatherTemp: localWeather?.temp != null ? String(localWeather.temp) : '--',
      weatherText: localWeather?.text || '暂无天气',
    })
    if (city) {
      const live = await fetchAmapWeather(city)
      if (live) {
        this.setData({
          weatherCity: live.city,
          weatherTemp: live.temperature || this.data.weatherTemp,
          weatherText: live.weather,
        })
      }
    }
  },

  prev() {
    this.renderDay(this.data.dayIndex - 1)
  },
  next() {
    this.renderDay(this.data.dayIndex + 1)
  },
  goAdjust() {
    wx.navigateTo({ url: '/pages/trip-plan/chat/chat' })
  },
  async closeSuggest() {
    if (this.data.hint?.key) {
      try {
        await ignoreHint(this.data.hint.key)
      } catch {
        /* ignore */
      }
    }
    this.setData({ showSuggest: false })
  },
  openPoi(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (id) wx.navigateTo({ url: `/pages/discovery/attraction/attraction-detail?id=${id}` })
  },
})
