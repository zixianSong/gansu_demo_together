const mine = require('../../services/mine')

Page({
  data: {
    stats: { poiCount: 0, cityCount: 0, travelDays: 0 },
    groups: [],
  },

  onShow() {
    mine.fetchFootprints().then((res) => {
      this.setData({
        stats: res.stats,
        groups: mine.groupFootprints(res.list || []),
      })
    })
  },

  onOpen(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
  },
})
