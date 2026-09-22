const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    activeTab: 'pending',
    pending: [],
    posted: [],
  },

  onShow() {
    this.load()
  },

  load() {
    Promise.all([mine.fetchPendingReviews(), mine.fetchPostedReviews()]).then(([pending, posted]) => {
      this.setData({ pending: pending.list, posted: posted.list })
    })
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onReview(e) {
    const { id, place, address } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/review-form/review-form?id=${id}&place=${encodeURIComponent(place || '')}&address=${encodeURIComponent(address || '')}`,
    })
  },

  onPendingAction(e) {
    const action = e.currentTarget.dataset.action
    const id = e.currentTarget.dataset.id
    if (action === 'review') {
      this.onReview(e)
      return
    }
    if (action === 'voucher') {
      wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}&focus=voucher` })
      return
    }
    if (action === 'rebook') mine.handleRebook(id)
  },

  onToggleAnonymous(e) {
    const id = e.currentTarget.dataset.id
    const anonymous = !!e.currentTarget.dataset.anonymous
    mine.toggleReviewAnonymous(id, !anonymous).then(() => this.load()).catch((err) => toast((err && err.message) || '操作失败'))
  },
})
