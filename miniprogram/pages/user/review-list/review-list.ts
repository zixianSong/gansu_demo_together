import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: {
    activeTab: 'pending',
    pending: [] as unknown[],
    posted: [] as unknown[],
  },

  onShow() {
    this.load()
  },

  load() {
    Promise.all([mine.fetchPendingReviews(), mine.fetchPostedReviews()]).then(
      ([pending, posted]) => {
        this.setData({ pending: pending.list, posted: posted.list })
      },
    )
  },

  onTabChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeTab: e.currentTarget.dataset.tab as string })
  },

  onReview(e: WechatMiniprogram.TouchEvent) {
    const { id, place, address } = e.currentTarget.dataset as { id?: string; place?: string; address?: string }
    wx.navigateTo({
      url: `/pages/user/review-create/review-create?id=${id}&place=${encodeURIComponent(place || '')}&address=${encodeURIComponent(address || '')}`,
    })
  },

  onPendingAction(e: WechatMiniprogram.TouchEvent) {
    const action = e.currentTarget.dataset.action as string
    const id = e.currentTarget.dataset.id
    if (action === 'review') {
      this.onReview(e)
      return
    }
    if (action === 'voucher') {
      wx.navigateTo({ url: `/pages/user/order-detail/order-detail?id=${id}&focus=voucher` })
      return
    }
    if (action === 'rebook') mine.handleRebook(id)
  },

  onToggleAnonymous(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    const anonymous = !!e.currentTarget.dataset.anonymous
    mine
      .toggleReviewAnonymous(id, !anonymous)
      .then(() => this.load())
      .catch((err: unknown) => toast(errMsg(err, '操作失败')))
  },
})
