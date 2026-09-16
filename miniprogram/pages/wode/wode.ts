const defaultAvatarUrl =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: defaultAvatarUrl,
    },
    menuList: [
      { title: '我的行程', url: '' },
      { title: '我的收藏', url: '' },
      { title: '订单记录', url: '' },
      { title: '设置', url: '' },
    ],
  },

  onShow() {
    const cached = wx.getStorageSync('userInfo') as { nickName?: string; avatarUrl?: string } | ''
    if (cached && typeof cached === 'object') {
      this.setData({
        userInfo: {
          nickName: cached.nickName || '',
          avatarUrl: cached.avatarUrl || defaultAvatarUrl,
        },
      })
    }
  },

  onEditProfile() {
    wx.getUserProfile({
      desc: '用于完善个人资料',
      success: (res) => {
        const userInfo = {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
        }
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo })
      },
    })
  },

  onMenuTap() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  onContact() {
    wx.showToast({ title: '客服功能开发中', icon: 'none' })
  },
})
