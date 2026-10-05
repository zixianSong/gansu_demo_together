import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: {
    formTitle: '',
    formContent: '',
  },

  onTitle(e: WechatMiniprogram.Input) {
    this.setData({ formTitle: e.detail.value })
  },

  onContent(e: WechatMiniprogram.Input) {
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
      .catch((err: unknown) => toast(errMsg(err, '提交失败')))
  },
})
