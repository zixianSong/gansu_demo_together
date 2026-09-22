const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    tabs: [
      { key: 'spot', label: '景点' },
      { key: 'route', label: '精品线路' },
      { key: 'guide', label: '攻略资讯' },
      { key: 'food', label: '美食' },
    ],
    activeTab: 'spot',
    list: [],
  },

  onLoad() {
    this.load('spot')
  },

  onTabChange(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ activeTab: key })
    this.load(key)
  },

  load(tab) {
    mine.fetchFavorites(tab).then((res) => this.setData({ list: res.list }))
  },

  onOpen(e) {
    const path = e.currentTarget.dataset.path
    if (!path) {
      toast('详情页即将上线')
      return
    }
    wx.navigateTo({ url: path })
  },
})
