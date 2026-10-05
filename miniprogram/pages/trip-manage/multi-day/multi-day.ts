import {
  fetchCurrent,
  postSense,
  type CurrentView,
  type ItineraryDay,
  type ItineraryItem,
} from '../../../api/modules/trip-manage'
import { formatClock, formatCnDate, nodeKind } from '../../../utils/trip-manage-format'

type DayNode = ItineraryItem & {
  timeLabel: string
  playHint: string
  goHint: string
  kind: string
  coverClass: string
  coverStyle: string
}

type DayRow = ItineraryDay & {
  dateLabel: string
  items: DayNode[]
}

function slashDate(iso: string | null | undefined) {
  if (!iso) return ''
  const d = iso.slice(0, 10)
  const [, m, day] = d.split('-')
  return m && day ? `${m}/${day}` : ''
}

function playHint(start: string | null, end: string | null) {
  if (!start || !end) return ''
  const h = (new Date(end).getTime() - new Date(start).getTime()) / 3600000
  if (h <= 0) return ''
  const lo = Math.max(1, Math.round(h))
  return `建议游玩 ${lo}-${lo + 1}小时`
}

function demoHint(days: DayRow[]) {
  const nodes = days.flatMap((d) => d.items)
  const target =
    nodes.find((n) => (n.name || '').includes('鸣沙山')) ||
    nodes.find((n) => n.kind === 'spot') ||
    nodes[0]
  if (!target) return null
  const start = formatClock(target.exactStartTime) || '14:00'
  return {
    key: 'demo:overtime',
    message: `【${target.name || '行程'}】计划 ${start} 开始，现已超时 30分钟`,
    extraCount: 2,
  }
}

Page({
  data: {
    plan: null as CurrentView['plan'] | null,
    days: [] as DayRow[],
    dateStart: '',
    dateEnd: '',
    hint: null as { key: string; message: string; extraCount: number } | null,
    optimizeCount: 0,
    footerLabel: '添加行程',
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const view = await fetchCurrent()
      if (!view.plan) {
        this.setData({
          plan: null,
          days: [],
          dateStart: '',
          dateEnd: '',
          hint: null,
          optimizeCount: 0,
          footerLabel: '添加行程',
        })
        return
      }
      let coverIdx = 0
      const days: DayRow[] = (view.days || []).map((d) => ({
        ...d,
        dateLabel: formatCnDate(d.date),
        items: (d.items || []).map((n) => {
          const kind = nodeKind(n.type)
          const coverClass = kind === 'transit' ? '' : `cover-${coverIdx++ % 3}`
          const photo = n.photoUrl
          return {
            ...n,
            kind,
            timeLabel: [formatClock(n.exactStartTime), formatClock(n.exactEndTime)]
              .filter(Boolean)
              .join('-'),
            playHint: playHint(n.exactStartTime, n.exactEndTime),
            goHint: formatClock(n.exactStartTime) ? `建议 ${formatClock(n.exactStartTime)} 前往` : '',
            coverClass,
            coverStyle: photo
              ? `background-image: linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${photo});`
              : '',
          }
        }),
      }))
      this.setData({
        plan: view.plan,
        days,
        dateStart: slashDate(view.plan.startDate),
        dateEnd: slashDate(view.plan.endDate),
        hint: demoHint(days),
        optimizeCount: 2,
        footerLabel: '编辑行程',
      })
      this.sense()
    } catch {
      this.setData({ plan: null, days: [], hint: null, footerLabel: '添加行程' })
    }
  },

  async sense() {
    try {
      const loc = await this.getLoc()
      const res = await postSense(loc)
      const hints = res.hints || []
      const first = hints[0]
      if (!first) return
      this.setData({
        hint: {
          key: first.key,
          message: first.message,
          extraCount: Math.max(0, hints.length - 1),
        },
        optimizeCount: hints.length,
      })
    } catch {
      /* 保留演示感知卡片 */
    }
  },

  getLoc(): Promise<{ lat?: number; lng?: number }> {
    return new Promise((resolve) => {
      wx.getLocation({
        type: 'gcj02',
        success: (r) => resolve({ lat: r.latitude, lng: r.longitude }),
        fail: () => resolve({}),
      })
    })
  },

  goAdjust() {
    const q = this.data.hint?.message
      ? `?q=${encodeURIComponent(this.data.hint.message)}`
      : ''
    wx.navigateTo({ url: `/pages/trip-plan/chat/chat${q}` })
  },

  goMap() {
    wx.navigateTo({ url: '/pages/trip-manage/map/map' })
  },

  openPoi(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) {
      wx.showToast({ title: '暂无详情', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/discovery/attraction/attraction-detail?id=${id}` })
  },
})
