import { fetchBanners, fetchFeed, type BannerItem, type FeedItem } from '../../api/modules/content'
import { request } from '../../api/request'

function splitFeed(list: FeedItem[]) {
  const leftFeed: FeedItem[] = []
  const rightFeed: FeedItem[] = []
  list.forEach((item, index) => {
    if (index % 2 === 0) leftFeed.push(item)
    else rightFeed.push(item)
  })
  return { leftFeed, rightFeed }
}

Page({
  data: {
    banners: [] as BannerItem[],
    categories: [
      { name: '景区', icon: '/static/images/icon/image.svg' },
      { name: '文博场馆', icon: '/static/images/icon/image.svg' },
      { name: '美食', icon: '/static/images/icon/image.svg' },
      { name: '线路', icon: '/static/images/icon/image.svg' },
    ],
    // 设计稿占位行程（P2，真实数据未接入）
    trips: [
      { title: '敦煌莫高窟', time: '10:00-12:00', city: '敦煌市' },
      { title: '张掖丹霞地质公园一日游', time: '09:00-17:00', city: '张掖市' },
    ] as Array<{ title: string; time: string; city: string }>,
    destinations: [] as Array<{ name: string; cover: string }>,
    routes: [] as Array<{ name: string; cover: string }>,
    leftFeed: [] as FeedItem[],
    rightFeed: [] as FeedItem[],
    loadingFeed: false,
  },

  onShow() {
    this.loadHome()
  },

  async loadHome() {
    this.setData({ loadingFeed: true })
    try {
      const [bannerRes, feedRes, destRes, routeRes] = await Promise.all([
        fetchBanners().catch(() => ({ list: [] as BannerItem[] })),
        fetchFeed(1, 10),
        request<{ list: Array<{ name: string; coverUrl: string | null }> }>({
          url: '/home/hot-destinations',
          method: 'GET',
          data: { limit: 4 },
        }).catch(() => ({ list: [] })),
        request<{ list: Array<{ name: string; coverUrl: string | null }> }>({
          url: '/home/hot-routes',
          method: 'GET',
          data: { limit: 4 },
        }).catch(() => ({ list: [] })),
      ])
      const { leftFeed, rightFeed } = splitFeed(feedRes.list || [])
      this.setData({
        banners: bannerRes.list || [],
        leftFeed,
        rightFeed,
        destinations: (destRes.list || []).map((d) => ({
          name: d.name,
          cover: d.coverUrl || '/static/images/icon/image.svg',
        })),
        routes: (routeRes.list || []).map((r) => ({
          name: r.name,
          cover: r.coverUrl || '/static/images/icon/image.svg',
        })),
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : '首页加载失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ loadingFeed: false })
    }
  },

  onSearch() {
    wx.showToast({ title: '即将上线', icon: 'none' })
  },

  onCategoryTap() {
    wx.showToast({ title: '即将上线', icon: 'none' })
  },

  onTripTap() {
    wx.showToast({ title: '即将上线', icon: 'none' })
  },

  onAiTap() {
    wx.showToast({ title: '即将上线', icon: 'none' })
  },

  onBannerTap(e: WechatMiniprogram.TouchEvent) {
    const item = e.currentTarget.dataset.item as BannerItem
    if (!item) return
    if (item.linkType === 'article' && item.linkId) {
      wx.navigateTo({ url: `/pages/article/detail?id=${item.linkId}` })
      return
    }
    if (item.linkType === 'poi' && item.linkId) {
      wx.navigateTo({ url: `/pages/poi/detail?id=${item.linkId}` })
      return
    }
    if (item.linkType === 'webview' && item.linkPath) {
      wx.showToast({ title: 'web-view 页待接入', icon: 'none' })
      return
    }
    if (item.linkType === 'route') {
      wx.showToast({ title: '线路详情页即将接入', icon: 'none' })
    }
  },

  onFeedTap(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) return
    wx.navigateTo({ url: `/pages/article/detail?id=${id}` })
  },
})
