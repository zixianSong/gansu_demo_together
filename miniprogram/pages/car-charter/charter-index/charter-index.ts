import { fetchCharterRoutes } from '../../../api/modules/charter'

const FAV_KEY = 'charter_fav_ids'
const FALLBACK_CITIES = [
  { id: 0, name: '西宁', hot: true },
  { id: 1, name: '兰州', hot: false },
  { id: 2, name: '张掖', hot: false },
  { id: 3, name: '敦煌', hot: false },
  { id: 4, name: '嘉峪关', hot: false },
  { id: 5, name: '格尔木', hot: false },
]

function pad(n: number) {
  return n < 10 ? '0' + n : String(n)
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

function dateLabel(iso: string) {
  const parts = iso.split('-')
  const m = Number(parts[1])
  const day = Number(parts[2])
  return m + '月' + day + '日'
}

function sortLabel(sort: string) {
  if (sort === 'priceAsc') return '价格从低到高'
  if (sort === 'soldDesc') return '销量优先'
  return '推荐排序'
}

function tripLabel(tripType: string) {
  return tripType || '行程天数'
}

function loadFavs(): number[] {
  try {
    const stored = wx.getStorageSync(FAV_KEY)
    if (stored && stored.length) return stored
    return []
  } catch (e) {
    return []
  }
}

function splitDesc(routeDesc: string) {
  const raw = (routeDesc || '').split(/\s*\/\s*|\n/)
  const lines: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i].trim()
    if (s) lines.push(s)
  }
  return lines
}

function favHas(favs: number[], id: number) {
  for (let i = 0; i < favs.length; i++) {
    if (favs[i] === id) return true
  }
  return false
}

Page({
  data: {
    startCity: '西宁',
    tripType: '',
    sort: 'recommend',
    sortLabel: '推荐排序',
    tripLabel: '行程天数',
    departDate: todayStr(),
    minDate: todayStr(),
    departDateLabel: dateLabel(todayStr()),
    cities: FALLBACK_CITIES,
    list: [] as any[],
    total: 0,
    banner: null as any,
    loading: false,
    showSortSheet: false,
    showTripSheet: false,
    showCitySheet: false,
    mode: 'line',
    showServiceNote: true,
    hourPackages: [
      {
        tag: '半日',
        title: '包 4 小时',
        price: '¥260 ~ ¥350',
        desc: '市区 / 近郊半日推荐',
      },
      {
        tag: '整日',
        title: '包 8 小时',
        price: '¥382 ~ ¥452',
        desc: '周边单日往返推荐',
      },
    ],
    hotRoutes: [
      {
        save: '省 ¥50',
        title: '半日游・塔尔寺 + 南山公园',
        score: '4.9',
        sold: '已售 126 单',
        price: '¥268',
        oldPrice: '¥318',
        cover: '/static/images/charter/taersi.jpg',
      },
      {
        save: '省 ¥80',
        title: '1日游・青海湖二郎剑 + 日月山',
        score: '4.8',
        sold: '已售 328 单',
        price: '¥699',
        oldPrice: '¥779',
        cover: '/static/images/charter/qinghaihu.jpg',
      },
    ],
  },

  onShow() {
    this.loadRoutes()
  },

  loadRoutes() {
    const that = this
    that.setData({ loading: true })
    fetchCharterRoutes({
      startCity: that.data.startCity,
      tripType: that.data.tripType || undefined,
      sort: that.data.sort,
    })
      .then(function (data) {
        const favs = loadFavs()
        const cities = data.cities.length ? data.cities : FALLBACK_CITIES
        const src = data.list || []
        const list: any[] = []
        for (let i = 0; i < src.length; i++) {
          const item = src[i]
          list.push({
            id: item.id,
            routeName: item.routeName,
            startCity: item.startCity,
            endCity: item.endCity,
            estimatedDuration: item.estimatedDuration,
            referencePrice: item.referencePrice,
            routeDesc: item.routeDesc,
            coverImg: item.coverImg,
            score: item.score,
            soldCount: item.soldCount,
            fav: favHas(favs, item.id),
            descLines: splitDesc(item.routeDesc || ''),
          })
        }
        that.setData({
          list: list,
          total: data.total,
          banner: data.banner,
          cities: cities,
          loading: false,
        })
      })
      .catch(function () {
        wx.showToast({ title: '网络失败', icon: 'none' })
        that.setData({
          list: [],
          total: 0,
          loading: false,
        })
      })
  },

  onCityChip(e: WechatMiniprogram.TouchEvent) {
    const name = e.currentTarget.dataset.name as string
    this.setData({
      startCity: name,
      showCitySheet: false,
    })
    this.loadRoutes()
  },

  onCityPick() {
    this.setData({ showCitySheet: true, showSortSheet: false, showTripSheet: false })
  },

  onDateChange(e: WechatMiniprogram.PickerChange) {
    const value = e.detail.value as string
    this.setData({
      departDate: value,
      departDateLabel: dateLabel(value),
    })
  },

  onSortTap() {
    this.setData({ showSortSheet: true, showTripSheet: false, showCitySheet: false })
  },

  onTripTap() {
    this.setData({ showTripSheet: true, showSortSheet: false, showCitySheet: false })
  },

  onCloseSheet() {
    this.setData({ showSortSheet: false, showTripSheet: false, showCitySheet: false })
  },

  onSortPick(e: WechatMiniprogram.TouchEvent) {
    const sort = e.currentTarget.dataset.sort as string
    this.setData({
      sort,
      sortLabel: sortLabel(sort),
      showSortSheet: false,
    })
    this.loadRoutes()
  },

  onTripPick(e: WechatMiniprogram.TouchEvent) {
    const tripType = (e.currentTarget.dataset.trip as string) || ''
    this.setData({
      tripType,
      tripLabel: tripLabel(tripType),
      showTripSheet: false,
    })
    this.loadRoutes()
  },

  onCarModelTap() {
    wx.showToast({ title: '本期不按车型过滤', icon: 'none' })
  },

  onLineTap() {
    this.setData({ mode: 'line' })
  },

  onHourTap() {
    this.setData({ mode: 'hourly' })
  },

  onToggleService() {
    this.setData({ showServiceNote: !this.data.showServiceNote })
  },

  onHourPackageTap() {
    wx.showToast({ title: '下单本期未开放', icon: 'none' })
  },

  onHotPickTap() {
    wx.showToast({ title: '下单本期未开放', icon: 'none' })
  },

  onCarpoolTap() {
    wx.showToast({ title: '座位拼车本期未开放', icon: 'none' })
  },

  onCardTap() {
    wx.showToast({ title: '下单本期未开放', icon: 'none' })
  },

  onFavTap(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    const favs = loadFavs()
    const next: number[] = []
    let found = false
    for (let i = 0; i < favs.length; i++) {
      if (favs[i] === id) {
        found = true
      } else {
        next.push(favs[i])
      }
    }
    if (!found) next.push(id)
    wx.setStorageSync(FAV_KEY, next)
    const oldList = this.data.list
    const list: any[] = []
    for (let i = 0; i < oldList.length; i++) {
      const item = oldList[i]
      list.push({
        id: item.id,
        routeName: item.routeName,
        startCity: item.startCity,
        endCity: item.endCity,
        estimatedDuration: item.estimatedDuration,
        referencePrice: item.referencePrice,
        routeDesc: item.routeDesc,
        coverImg: item.coverImg,
        score: item.score,
        soldCount: item.soldCount,
        fav: item.id === id ? favHas(next, id) : item.fav,
        descLines: item.descLines,
      })
    }
    this.setData({ list })
  },

  onBannerTap() {
    const banner = this.data.banner
    if (!banner || !banner.linkId) return
    const rows = this.data.list
    let hit = false
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].id === banner.linkId) hit = true
    }
    if (!hit) {
      wx.showToast({ title: '当前筛选下无该线路', icon: 'none' })
      return
    }
    wx.pageScrollTo({
      selector: '#route-' + banner.linkId,
      duration: 300,
    })
  },
})
