import { previewSwitch, switchPlan } from '../../../api/modules/trip-manage'

Page({
  data: {
    planId: 0,
    name: '',
    duplicates: [] as Array<{ name: string }>,
    conflicts: [] as Array<{ name: string; reason: string }>,
  },
  onLoad(query: Record<string, string | undefined>) {
    const planId = Number(query.targetPlanId)
    this.setData({ planId })
    if (!planId) return
    previewSwitch(planId)
      .then((res) => {
        this.setData({
          name: res.target.name || '',
          duplicates: res.conflicts.duplicatePlaces || [],
          conflicts: res.conflicts.timeLocationConflicts || [],
        })
      })
      .catch((e) => {
        wx.showToast({ title: e instanceof Error ? e.message : '预览失败', icon: 'none' })
      })
  },
  back() {
    wx.navigateBack()
  },
  async confirm() {
    try {
      await switchPlan(this.data.planId)
      wx.showToast({ title: '已切换', icon: 'none' })
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/trip-manage/multi-day/multi-day' })
      }, 400)
    } catch (e) {
      wx.showToast({ title: e instanceof Error ? e.message : '切换失败', icon: 'none' })
    }
  },
})
