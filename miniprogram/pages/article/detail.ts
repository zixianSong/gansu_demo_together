import {

  fetchArticleDetail,

  fetchArticlePois,

  fetchArticleRoutes,

  type ArticleDetail,

  type RelatedPoi,

  type RelatedRoute,

} from '../../api/modules/content'



const CATEGORY_LABEL: Record<string, string> = {

  scenic: '景点',

  museum: '文博',

  food: '美食',

}



type PoiView = RelatedPoi & {

  categoryLabel: string

  subtitle: string

}



function formatTime(iso: string | null | undefined): string {

  if (!iso) return ''

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ''

  const y = d.getFullYear()

  const m = `${d.getMonth() + 1}`.padStart(2, '0')

  const day = `${d.getDate()}`.padStart(2, '0')

  return `${y}-${m}-${day}`

}



function buildPoiSubtitle(item: RelatedPoi): string {

  const parts = [item.city, item.address].filter(Boolean)

  return parts.join(' · ') || CATEGORY_LABEL[item.category] || item.category

}



function mapPoiItem(item: RelatedPoi): PoiView {

  return {

    ...item,

    categoryLabel: CATEGORY_LABEL[item.category] || item.category,

    subtitle: buildPoiSubtitle(item),

  }

}



Page({

  data: {

    loading: true,

    articleId: 0,

    article: {} as ArticleDetail,

    contentNodes: '',

    publishedText: '',

    contentTypeLabel: '',

    showPoiSheet: false,

    showRouteSheet: false,

    relatedPois: [] as PoiView[],

    relatedRoutes: [] as RelatedRoute[],

    previewPoi: null as PoiView | null,

    poiSheetTitle: '提及地点',

  },



  onLoad(query: Record<string, string | undefined>) {

    const id = Number(query.id)

    if (!id) {

      wx.showToast({ title: '文章不存在', icon: 'none' })

      setTimeout(() => wx.navigateBack({ fail: () => undefined }), 800)

      return

    }

    this.setData({ articleId: id })

    this.loadDetail(id)

  },



  async loadDetail(id: number) {

    wx.showNavigationBarLoading()

    try {

      const article = await fetchArticleDetail(id)

      this.setData({

        loading: false,

        article,

        contentNodes: article.contentHtml || '<p>暂无正文</p>',

        publishedText: formatTime(article.publishedAt),

        contentTypeLabel: article.contentType === 'guide' ? '攻略' : '游记',

      })

      wx.setNavigationBarTitle({ title: '文章详情' })

      if (article.hasRelatedPois) {

        await this.loadRelatedPois(id)

      }

    } catch (e) {

      const message = e instanceof Error ? e.message : '加载失败'

      wx.showToast({ title: message, icon: 'none' })

      setTimeout(() => wx.navigateBack({ fail: () => undefined }), 1000)

    } finally {

      wx.hideNavigationBarLoading()

    }

  },



  async loadRelatedPois(articleId: number) {

    try {

      const res = await fetchArticlePois(articleId)

      const relatedPois = (res.list || []).map(mapPoiItem)

      this.setData({

        relatedPois,

        previewPoi: relatedPois[0] || null,

        poiSheetTitle: relatedPois.length ? `提及地点（${relatedPois.length}）` : '提及地点',

      })

    } catch (_) {

      // 预览区与弹层可稍后重试

    }

  },



  noop() {},



  onCloseSheets() {

    this.setData({ showPoiSheet: false, showRouteSheet: false })

  },



  async onOpenPoiSheet() {

    const { articleId, relatedPois } = this.data

    this.setData({ showPoiSheet: true, showRouteSheet: false })

    if (relatedPois.length) return

    try {

      await this.loadRelatedPois(articleId)

    } catch (e) {

      const message = e instanceof Error ? e.message : '加载失败'

      wx.showToast({ title: message, icon: 'none' })

    }

  },



  async onOpenRouteSheet() {

    const { articleId, relatedRoutes } = this.data

    this.setData({ showRouteSheet: true, showPoiSheet: false })

    if (relatedRoutes.length) return

    try {

      const res = await fetchArticleRoutes(articleId)

      this.setData({ relatedRoutes: res.list || [] })

    } catch (e) {

      const message = e instanceof Error ? e.message : '加载失败'

      wx.showToast({ title: message, icon: 'none' })

    }

  },



  onPreviewPoiTap(e: WechatMiniprogram.TouchEvent) {

    const id = Number(e.currentTarget.dataset.id)

    if (!id) return

    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })

  },



  onPoiTap(e: WechatMiniprogram.TouchEvent) {

    const id = Number(e.currentTarget.dataset.id)

    if (!id) return

    this.onCloseSheets()

    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })

  },



  onRouteTap() {

    wx.showToast({ title: '线路详情页即将接入', icon: 'none' })

  },

})

