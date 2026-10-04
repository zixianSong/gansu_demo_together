import { fetchPoiDetail, type PoiDetail } from '../../../api/modules/content'

const CATEGORY_LABEL: Record<string, string> = {
  scenic: '景点',
  museum: '文博场馆',
  food: '美食',
}

Page({
  data: {
    loading: true,
    poi: {} as PoiDetail,
    categoryLabel: '',
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = Number(query.id)
    if (!id) {
      wx.showToast({ title: '地点不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => undefined }), 800)
      return
    }
    this.loadDetail(id)
  },

  async loadDetail(id: number) {
    wx.showNavigationBarLoading()
    try {
      const poi = await fetchPoiDetail(id)
      this.setData({
        loading: false,
        poi,
        categoryLabel: CATEGORY_LABEL[poi.category] || poi.category,
      })
      wx.setNavigationBarTitle({ title: poi.name || '地点详情' })
    } catch (e) {
      const message = e instanceof Error ? e.message : '加载失败'
      wx.showToast({ title: message, icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => undefined }), 1000)
    } finally {
      wx.hideNavigationBarLoading()
    }
  },
})
