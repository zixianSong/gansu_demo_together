import {
  fetchCharterRoutes,
  type CharterBanner,
  type CharterCity,
  type CharterRoute,
  type CharterSort,
} from '../../api/modules/charter'

const FAV_KEY = 'charter_fav_ids'
const FALLBACK_CITIES: CharterCity[] = [
  { id: 0, name: '西宁', hot: true },
  { id: 1, name: '兰州', hot: false },
  { id: 2, name: '张掖', hot: false },
  { id: 3, name: '敦煌', hot: false },
  { id: 4, name: '嘉峪关', hot: false },
  { id: 5, name: '格尔木', hot: false },
]

type RouteView = CharterRoute & { fav: boolean; descLines: string[] }

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function dateLabel(iso: string) {
  const [, m, day] = iso.split('-')
  return `${Number(m)}月${Number(day)}日`
}

function sortLabel(sort: CharterSort) {
  if (sort === 'priceAsc') return '价格从低到高'
  if (sort === 'soldDesc') return '销量优先'
  return '推荐排序'
}

function tripLabel(tripType: string) {
  return tripType || '行程天数'
}

function loadFavs(): number[] {
  try {
    return (wx.getStorageSync(FAV_KEY) as number[]) || []
  } catch {
    return []
  }
}

Page({
  data: {
    startCity: '西宁',
    tripType: '',
    sort: 'recommend' as CharterSort,
    sortLabel: '推荐排序',
    tripLabel: '行程天数',
    departDate: todayStr(),
    minDate: todayStr(),
    departDateLabel: dateLabel(todayStr()),
    cities: FALLBACK_CITIES as CharterCity[],
    list: [] as RouteView[],
    total: 0,
    banner: null as CharterBanner | null,
    loading: false,
    showSortSheet: false,
    showTripSheet: false,
    showCitySheet: false,
    scrollInto: '',
  },

  onShow() {
    this.loadRoutes()
  },

  async loadRoutes() {
    this.setData({ loading: true, scrollInto: '' })
    try {
      const data = await fetchCharterRoutes({
        startCity: this.data.startCity,
        tripType: this.data.tripType || undefined,
        sort: this.data.sort,
      })
      const favs = new Set(loadFavs())
      const cities = data.cities.length ? data.cities : FALLBACK_CITIES
      const list: RouteView[] = data.list.map((item) => ({
        ...item,
        fav: favs.has(item.id),
        descLines: (item.routeDesc || '')
          .split(/\s*\/\s*|\n/)
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      this.setData({
        list,
        total: data.total,
        banner: data.banner,
        cities,
        loading: false,
      })
    } catch {
      wx.showToast({ title: '网络失败', icon: 'none' })
      this.setData({
        list: [],
        total: 0,
        loading: false,
      })
    }
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
    const sort = e.currentTarget.dataset.sort as CharterSort
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

  onHourTap() {
    wx.showToast({ title: '按小时包车本期未开放', icon: 'none' })
  },

  onCarpoolTap() {
    wx.showToast({ title: '座位拼车本期未开放', icon: 'none' })
  },

  onCardTap() {
    wx.showToast({ title: '下单本期未开放', icon: 'none' })
  },

  onFavTap(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    const favs = new Set(loadFavs())
    if (favs.has(id)) favs.delete(id)
    else favs.add(id)
    wx.setStorageSync(FAV_KEY, Array.from(favs))
    const list = this.data.list.map((item) =>
      item.id === id ? { ...item, fav: favs.has(id) } : item,
    )
    this.setData({ list })
  },

  onBannerTap() {
    const banner = this.data.banner
    if (!banner?.linkId) return
    const hit = this.data.list.some((item) => item.id === banner.linkId)
    if (!hit) {
      wx.showToast({ title: '当前筛选下无该线路', icon: 'none' })
      return
    }
    this.setData({ scrollInto: `route-${banner.linkId}` })
  },
})
