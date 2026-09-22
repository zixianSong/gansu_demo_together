const mine = require('../../services/mine')

const LABELS = ['非常不满意', '不满意', '一般', '满意', '非常满意']

function toast(title) {
  wx.showToast({ title, icon: 'none' })
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
    media: [],
    isAnonymous: true,
  },

  onLoad(query) {
    const orderId = (query && query.id) || ''
    this.setData({
      orderId,
      place: query && query.place ? decodeURIComponent(query.place) : '',
      address: query && query.address ? decodeURIComponent(query.address) : '',
    })
    if (!this.data.place) {
      mine.fetchPendingReviews().then((res) => {
        const found = res.list.find((item) => String(item.orderId) === String(orderId) || item.id === String(orderId))
        if (found) this.setData({ place: found.place, address: found.address })
      })
    }
  },

  onStar(e) {
    const rating = Number(e.currentTarget.dataset.index) + 1
    this.setData({ rating, ratingLabel: LABELS[rating - 1] })
  },

  onInput(e) {
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
      .catch((err) => toast((err && err.message) || '提交失败'))
  },
})
