Page({
  data: {
    serviceList: [
      { name: '景区', icon: '/static/images/category/scenic.jpg' },
      { name: '文博场馆', icon: '/static/images/category/museum.jpg' },
      { name: '美食', icon: '/static/images/category/food.jpg' },
      { name: '线路', icon: '/static/images/category/route.jpg' },
      { name: '门票预订', icon: '/static/images/feed/mogao.jpg' },
      { name: '导游服务', icon: '/static/images/feed/silkroad.jpg' },
      { name: '交通出行', icon: '/static/images/route/hexi.jpg' },
      { name: '更多服务', icon: '/static/images/icon/image.png' },
    ],
  },

  onServiceTap(e) {
    const name = e.currentTarget.dataset.name
    if (name === '线路') {
      wx.switchTab({ url: '/pages/charter/charter' })
      return
    }
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },
})
