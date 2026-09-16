Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    type: {
      type: String,
      value: 'primary',
    },
    text: {
      type: String,
      value: '',
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    block: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onTap() {
      if (this.data.disabled) return
      this.triggerEvent('tap')
    },
  },
})
