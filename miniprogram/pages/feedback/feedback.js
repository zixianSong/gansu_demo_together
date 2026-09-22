const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    formTitle: '',
    formContent: '',
  },

  onTitle(e) {
    this.setData({ formTitle: e.detail.value })
  },

  onContent(e) {
    this.setData({ formContent: e.detail.value })
  },

  onSubmit() {
    const title = String(this.data.formTitle || '').trim()
    const content = String(this.data.formContent || '').trim()
    if (!title || !content) {
      toast('请填写标题和内容')
      return
    }
    mine
      .submitFeedback({ title, content, type: 2 })
      .then(() => {
        toast('提交成功')
        this.setData({ formTitle: '', formContent: '' })
        setTimeout(() => wx.navigateBack(), 500)
      })
      .catch((err) => toast((err && err.message) || '提交失败'))
  },
})
