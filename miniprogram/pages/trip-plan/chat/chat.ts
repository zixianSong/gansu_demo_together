import {
  fetchConversations,
  fetchCurrent,
  postConversation,
} from '../../../api/modules/trip-manage'

type PlanItem = { name: string | null; type: string | null; date?: string | null }

type ChatMsg = {
  id: string
  role: 'user' | 'ai'
  text: string
  planName: string
  planItems: PlanItem[]
  showEmptyPlan: boolean
}

type AiPayload = {
  text?: string
  preview?: { name?: string | null; items?: PlanItem[] } | null
}

const ADD_CHIPS = ['帮我规划河西走廊 3 日游', '敦煌 2 日怎么走', '想去张掖和嘉峪关']
const EDIT_CHIPS = ['我想取消这个节点', '我想推迟1小时', '我想提前出发', '更换交通方式']

function asAi(raw: unknown): AiPayload {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as AiPayload
  }
  if (typeof raw === 'string') return { text: raw }
  return {}
}

function fromRow(row: {
  id: number | null
  userInput: string | null
  aiResponse: unknown
}): ChatMsg[] {
  const out: ChatMsg[] = []
  if (row.userInput) {
    out.push({
      id: `u-${row.id}`,
      role: 'user',
      text: row.userInput,
      planName: '',
      planItems: [],
      showEmptyPlan: false,
    })
  }
  const ai = asAi(row.aiResponse)
  const items = ai.preview?.items || []
  const text = ai.text || ''
  if (text || items.length) {
    out.push({
      id: `a-${row.id}`,
      role: 'ai',
      text,
      planName: ai.preview?.name || '行程方案预览',
      planItems: items,
      showEmptyPlan: items.length === 0,
    })
  }
  return out
}

Page({
  data: {
    draft: '',
    hasPlan: false,
    welcome: '你好，我是行程助手。用一句话告诉我想去哪、玩几天。对话和方案都在这里，不用来回切页。',
    chips: ADD_CHIPS,
    showChips: true,
    messages: [] as ChatMsg[],
    anchor: 'bottom',
  },

  onLoad(query: Record<string, string | undefined>) {
    if (query.q) this.setData({ draft: query.q })
  },

  onShow() {
    this.reload()
  },

  async reload() {
    try {
      const view = await fetchCurrent()
      const hasPlan = Boolean(view.plan)
      this.setData({
        hasPlan,
        chips: hasPlan ? EDIT_CHIPS : ADD_CHIPS,
        welcome: hasPlan
          ? '在对话里说明想怎么改。生成的方案会出现在我的回复里，确认后才会写入当前行程。'
          : '你好，我是行程助手。用一句话告诉我想去哪、玩几天。对话和方案都在这里，不用来回切页。',
      })
    } catch {
      this.setData({ hasPlan: false, chips: ADD_CHIPS })
    }
    try {
      const res = await fetchConversations()
      const messages = (res.list || []).flatMap(fromRow)
      this.setData({
        messages,
        showChips: messages.length === 0,
        anchor: 'bottom',
      })
    } catch {
      this.setData({ messages: [], showChips: true })
    }
  },

  onInput(e: WechatMiniprogram.Input) {
    this.setData({ draft: e.detail.value })
  },

  chip(e: WechatMiniprogram.TouchEvent) {
    this.setData({ draft: String(e.currentTarget.dataset.text || '') })
    this.send()
  },

  async send() {
    const text = this.data.draft.trim()
    if (!text) return
    this.setData({ draft: '', showChips: false })
    wx.setStorageSync('itineraryLastInput', text)
    try {
      await postConversation({
        userInput: text,
        formData: {
          intent: this.data.hasPlan ? 'adjust' : 'create',
          source: 'itinerary',
        },
      })
    } catch (e) {
      wx.showToast({
        title: e instanceof Error ? e.message : '发送失败',
        icon: 'none',
      })
      this.setData({ draft: text })
      return
    }
    await this.reload()
  },

  toastApply() {
    wx.showToast({
      title: '请由行程规划确认后写入',
      icon: 'none',
    })
  },
})
