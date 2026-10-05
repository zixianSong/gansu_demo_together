import * as mine from '../../../services/user/user'

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: {
    infoItems: [] as unknown[],
    permItems: [] as unknown[],
  },

  onShow() {
    mine
      .fetchPrivacyBrief()
      .then((data: { collectScenes?: unknown[]; permissionScenes?: unknown[] }) => {
        this.setData({
          infoItems: data.collectScenes || [],
          permItems: data.permissionScenes || [],
        })
      })
      .catch((err: unknown) => wx.showToast({ title: errMsg(err, '加载失败'), icon: 'none' }))
  },

  onFull() {
    wx.navigateTo({ url: '/pages/user/about/about?type=privacy' })
  },

  onCollect() {
    wx.navigateTo({ url: '/pages/user/about/about?type=collect' })
  },

  onPermission() {
    wx.navigateTo({ url: '/pages/user/about/about?type=permissions' })
  },
})
