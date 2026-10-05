Component({
  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      const key = e.currentTarget.dataset.key as string
      if (key === 'home') return
      if (key === 'trip') {
        wx.navigateTo({ url: '/pages/trip-manage/multi-day/multi-day' })
        return
      }
      if (key === 'service') {
        wx.navigateTo({ url: '/pages/car-charter/charter-index/charter-index' })
        return
      }
      wx.showToast({ title: '即将上线', icon: 'none' })
    },
  },
})
