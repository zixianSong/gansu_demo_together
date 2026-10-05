import * as mine from '../../../services/user/user'

const LABELS = ['非常不满意', '不满意', '一般', '满意', '非常满意']

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: {
    orderId: '',
    place: '',
    address: '',
    rating: 5,
    ratingLabel: '非常满意',
    stars: [0, 1, 2, 3, 4],
    content: '',
    media: [] as string[],
    isAnonymous: true,
  },

  onLoad(query: Record<string, string | undefined>) {
    const orderId = (query && query.id) || ''
    this.setData({
      orderId,
      place: query && query.place ? decodeURIComponent(query.place) : '',
      address: query && query.address ? decodeURIComponent(query.address) : '',
    })
    if (!this.data.place) {
      mine.fetchPendingReviews().then((res: { list: Array<{ orderId?: number; id?: string; place?: string; address?: string }> }) => {
        const found = res.list.find((item) => String(item.orderId) === String(orderId) || item.id === String(orderId))
        if (found) this.setData({ place: found.place, address: found.address })
      })
    }
  },

  onStar(e: WechatMiniprogram.TouchEvent) {
    const rating = Number(e.currentTarget.dataset.index) + 1
    this.setData({ rating, ratingLabel: LABELS[rating - 1] })
  },

  onInput(e: WechatMiniprogram.Input) {
    this.setData({ content: (e.detail.value || '').slice(0, 200) })
  },

  onToggleAnonymous() {
    this.setData({ isAnonymous: !this.data.isAnonymous })
  },

  onUpload() {
    wx.chooseMedia({
      count: 9 - this.data.media.length,
      mediaType: ['image', 'video'],
      success: (res) => {
        const files = res.tempFiles.map((file) => file.tempFilePath)
        this.setData({ media: this.data.media.concat(files).slice(0, 9) })
      },
    })
  },

  onSubmit() {
    mine
      .submitReview({
        orderId: Number(this.data.orderId),
        rating: this.data.rating,
        ratingLabel: this.data.ratingLabel,
        content: this.data.content,
        images: this.data.media,
        isAnonymous: this.data.isAnonymous,
      })
      .then(() => {
        toast('评价提交成功')
        setTimeout(() => wx.navigateBack(), 400)
      })
      .catch((err: unknown) => toast(errMsg(err, '提交失败')))
  },
})
