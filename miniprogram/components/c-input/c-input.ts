Component({
  properties: {
    value: {
      type: String,
      value: '',
    },
    placeholder: {
      type: String,
      value: '请输入',
    },
    showSearchBtn: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onInput(e: WechatMiniprogram.Input) {
      const value = e.detail.value
      this.setData({ value })
      this.triggerEvent('input', { value })
    },
    onConfirm(e: WechatMiniprogram.Input) {
      this.triggerEvent('search', { value: e.detail.value })
    },
    onSearchTap() {
      this.triggerEvent('search', { value: this.data.value })
    },
  },
})
