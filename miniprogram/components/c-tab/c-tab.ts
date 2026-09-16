Component({
  properties: {
    tabs: {
      type: Array,
      value: [],
    },
    activeIndex: {
      type: Number,
      value: 0,
    },
  },
  methods: {
    onTabTap(e: WechatMiniprogram.TouchEvent) {
      const index = e.currentTarget.dataset.index as number
      if (index === this.data.activeIndex) return
      this.setData({ activeIndex: index })
      this.triggerEvent('change', { index, tab: this.data.tabs[index] })
    },
  },
})
