import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    tabs: [
      { key: 'spot', label: '景点' },
      { key: 'route', label: '精品线路' },
      { key: 'guide', label: '攻略资讯' },
      { key: 'food', label: '美食' },
    ],
    activeTab: 'spot',
    list: [] as unknown[],
  },

  onLoad() {
    this.load('spot')
  },

  onTabChange(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as string
    this.setData({ activeTab: key })
    this.load(key)
  },

  load(tab: string) {
    mine.fetchFavorites(tab).then((res) => this.setData({ list: res.list }))
  },

  onOpen(e: WechatMiniprogram.TouchEvent) {
    const path = e.currentTarget.dataset.path as string
    if (!path) {
      toast('详情页即将上线')
      return
    }
    wx.navigateTo({ url: path })
  },
})
