import * as mine from '../../../services/user/user'

Page({
  data: {
    stats: { poiCount: 0, cityCount: 0, travelDays: 0 },
    groups: [] as unknown[],
  },

  onShow() {
    mine.fetchFootprints().then((res) => {
      this.setData({
        stats: res.stats,
        groups: mine.groupFootprints(res.list || []),
      })
    })
  },

  onOpen(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/index/poi/detail?id=${id}` })
  },
})
