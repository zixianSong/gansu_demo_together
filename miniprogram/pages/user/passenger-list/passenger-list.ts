import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: { list: [] as unknown[] },

  onShow() {
    this.load()
  },

  load() {
    mine.fetchTravelers().then((res: { list: unknown[] }) => {
      this.setData({ list: res.list })
    })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/user/passenger-edit/passenger-edit' })
  },

  onEdit(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/user/passenger-edit/passenger-edit?id=${id}` })
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除出行人',
      content: '确定删除该出行人？',
      success: (res) => {
        if (!res.confirm) return
        mine
          .removeTraveler(id)
          .then(() => this.load())
          .catch((err: unknown) => toast(errMsg(err, '删除失败')))
      },
    })
  },
})
