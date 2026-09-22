const mine = require('../../services/mine')

Page({
  data: {
    infoItems: [],
    permItems: [],
  },

  onShow() {
    mine
      .fetchPrivacyBrief()
      .then((data) => {
        this.setData({
          infoItems: data.collectScenes || [],
          permItems: data.permissionScenes || [],
        })
      })
      .catch((err) => wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' }))
  },

  onFull() {
    wx.navigateTo({ url: '/pages/mine-doc/mine-doc?type=privacy' })
  },

  onCollect() {
    wx.navigateTo({ url: '/pages/mine-doc/mine-doc?type=collect' })
  },

  onPermission() {
    wx.navigateTo({ url: '/pages/mine-doc/mine-doc?type=permissions' })
  },
})
