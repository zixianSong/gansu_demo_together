const mine = require('../../services/mine')

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    travelerId: '',
    name: '',
    idNumber: '',
    phone: '',
    idHint: '不修改证件号请留空',
  },

  onLoad(query) {
    const id = (query && query.id) || ''
    this.setData({ travelerId: id })
    wx.setNavigationBarTitle({ title: id ? '编辑出行人' : '新增出行人' })
    if (!id) return
    mine.fetchTravelers().then((res) => {
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

  onName(e) {
    this.setData({ name: e.detail.value })
  },

  onId(e) {
    this.setData({ idNumber: e.detail.value })
  },

  onPhone(e) {
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
    const payload = { name, idType: 1 }
    if (idNumber) payload.idNumber = idNumber
    if (phone) payload.phone = phone
    const job = travelerId ? mine.updateTraveler(travelerId, payload) : mine.addTraveler(payload)
    job
      .then(() => {
        toast('已保存')
        setTimeout(() => wx.navigateBack(), 400)
      })
      .catch((err) => toast((err && err.message) || '保存失败'))
  },
})
