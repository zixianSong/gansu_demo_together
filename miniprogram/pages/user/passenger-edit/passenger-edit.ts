import * as mine from '../../../services/user/user'

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

Page({
  data: {
    travelerId: '',
    name: '',
    idNumber: '',
    phone: '',
    idHint: '不修改证件号请留空',
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = (query && query.id) || ''
    this.setData({ travelerId: id })
    wx.setNavigationBarTitle({ title: id ? '编辑出行人' : '新增出行人' })
    if (!id) return
    mine.fetchTravelers().then((res: { list: Array<{ travelerId?: number; name?: string; idNumber?: string }> }) => {
      const item = res.list.find((row) => String(row.travelerId) === String(id))
      if (item) {
        this.setData({
          name: item.name,
          phone: '',
          idNumber: '',
          idHint: `当前 ${item.idNumber}，不改请留空`,
        })
      }
    })
  },

  onName(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value })
  },

  onId(e: WechatMiniprogram.Input) {
    this.setData({ idNumber: e.detail.value })
  },

  onPhone(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value })
  },

  onSave() {
    const { travelerId, name, idNumber, phone } = this.data
    if (!name) {
      toast('请填写姓名')
      return
    }
    if (idNumber && idNumber.indexOf('*') >= 0) {
      toast('请填写完整证件号或不要传证件号')
      return
    }
    if (!travelerId && !idNumber) {
      toast('请填写证件号')
      return
    }
    const payload: mine.TravelerInput = { name, idType: 1 }
    if (idNumber) payload.idNumber = idNumber
    if (phone) payload.phone = phone
    const job = travelerId ? mine.updateTraveler(travelerId, payload) : mine.addTraveler(payload)
    job
      .then(() => {
        toast('已保存')
        setTimeout(() => wx.navigateBack(), 400)
      })
      .catch((err: unknown) => toast(errMsg(err, '保存失败')))
  },
})
