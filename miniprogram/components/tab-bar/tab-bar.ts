Component({
  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      const key = e.currentTarget.dataset.key as string
      if (key === 'home') return
      wx.showToast({ title: '即将上线', icon: 'none' })
    },
  },
})
