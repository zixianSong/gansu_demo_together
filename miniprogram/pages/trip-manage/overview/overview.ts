import { fetchCurrent, type ItineraryDay, type ItineraryItem } from '../../../api/modules/trip-manage'
import { formatClock, formatWeekday, nodeKind } from '../../../utils/trip-manage-format'

const SLOT: Record<string, number> = {
  morning: 0,
  noon: 1,
  afternoon: 2,
  evening: 3,
}

type RowNode = ItineraryItem & { timeLabel: string; kind: string }
type Row = {
  id: number | null
  dayNumber: number | null
  weekday: string
  nodes: RowNode[]
}

Page({
  data: {
    slot: 'morning',
    days: [] as ItineraryDay[],
    rows: [] as Row[],
    focus: null as RowNode | null,
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const view = await fetchCurrent()
      this.setData({ days: view.days || [] }, () => this.applySlot())
    } catch {
      this.setData({ days: [], rows: [], focus: null })
    }
  },

  applySlot() {
    const slotNo = SLOT[this.data.slot]
    const rows: Row[] = (this.data.days || [])
      .map((d) => {
        const nodes = (d.items || [])
          .filter((n) => n.timeSlot == null || n.timeSlot === slotNo)
          .map((n) => ({
            ...n,
            timeLabel: formatClock(n.exactStartTime),
            kind: nodeKind(n.type),
          }))
        return {
          id: d.id,
          dayNumber: d.dayNumber,
          weekday: formatWeekday(d.date),
          nodes,
        }
      })
      .filter((r) => r.nodes.length)
    const first = rows[0]?.nodes[0] || null
    this.setData({ rows, focus: first })
  },

  setSlot(e: WechatMiniprogram.TouchEvent) {
    this.setData({ slot: String(e.currentTarget.dataset.slot) }, () => this.applySlot())
  },

  openPoi(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (id) wx.navigateTo({ url: `/pages/discovery/attraction/attraction-detail?id=${id}` })
  },
})
