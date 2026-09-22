const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: { list: [] },

  onShow() {
    this.load()
  },

  load() {
    mine.fetchTravelers().then((res) => {
      this.setData({ list: res.list })
    })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/traveler-form/traveler-form' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/traveler-form/traveler-form?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除出行人',
      content: '确定删除该出行人？',
      success: (res) => {
        if (!res.confirm) return
        mine.removeTraveler(id).then(() => this.load()).catch((err) => toast((err && err.message) || '删除失败'))
      },
    })
  },
})
