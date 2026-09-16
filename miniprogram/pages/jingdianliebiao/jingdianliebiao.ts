import type { Spot } from '../../types/spot.d'

interface CityTab {
  name: string
  city: string
}

const SPOT_LIST: Spot[] = [
  {
    id: '1',
    name: '敦煌莫高窟',
    cover: '/static/images/feed/mogao.jpg',
    city: '敦煌市',
    price: 238,
    tags: ['世界遗产', '免排队'],
  },
  {
    id: '2',
    name: '张掖丹霞观景台',
    cover: '/static/images/feed/homestay.jpg',
    city: '张掖市',
    price: 38,
    tags: ['景区', '观景台'],
  },
  {
    id: '3',
    name: '嘉峪关长城文化体验馆',
    cover: '/static/images/feed/jiayuguan.jpg',
    city: '嘉峪关市',
    price: 120,
    tags: ['文化讲解', '互动体验'],
  },
  {
    id: '4',
    name: '兰州黄河风情线',
    cover: '/static/images/dest/lanzhou.jpg',
    city: '兰州市',
    tags: ['城市漫步', '夜景'],
  },
  {
    id: '5',
    name: '天水麦积山石窟',
    cover: '/static/images/dest/tianshui.jpg',
    city: '天水市',
    price: 80,
    tags: ['石窟', '历史'],
  },
  {
    id: '6',
    name: '甘南草原自驾游',
    cover: '/static/images/feed/gannan.jpg',
    city: '甘南州',
    tags: ['自驾', '草原'],
  },
]

Page({
  data: {
    keyword: '',
    activeTabIndex: 0,
    cityTabs: [
      { name: '全部', city: '' },
      { name: '兰州', city: '兰州市' },
      { name: '敦煌', city: '敦煌市' },
      { name: '张掖', city: '张掖市' },
      { name: '天水', city: '天水市' },
    ] as CityTab[],
    spotList: SPOT_LIST,
    filteredList: SPOT_LIST,
  },

  onShow() {
    const keyword = wx.getStorageSync('spotSearchKeyword') as string
    if (keyword) {
      wx.removeStorageSync('spotSearchKeyword')
      this.setData({ keyword })
      this.applyFilter(keyword, this.data.activeTabIndex)
    }
  },

  onKeywordInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.applyFilter(e.detail.value, this.data.activeTabIndex)
  },

  onTabChange(e: WechatMiniprogram.CustomEvent<{ index: number }>) {
    this.applyFilter(this.data.keyword, e.detail.index)
  },

  applyFilter(keyword: string, tabIndex: number) {
    const city = (this.data.cityTabs[tabIndex] as CityTab).city
    const filtered = this.data.spotList.filter((item) => {
      const matchCity = !city || item.city === city
      const matchKeyword = !keyword || item.name.includes(keyword) || item.city.includes(keyword)
      return matchCity && matchKeyword
    })
    this.setData({ activeTabIndex: tabIndex, filteredList: filtered })
  },

  onSpotTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showToast({ title: `景点 ${id}`, icon: 'none' })
  },
})
