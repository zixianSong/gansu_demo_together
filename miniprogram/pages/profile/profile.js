const mine = require('../../services/mine')

const GENDERS = ['女', '男', '保密']

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

Page({
  data: {
    form: mine.profileView(null),
  },

  onShow() {
    mine.getProfile().then((user) => {
      this.setData({ form: mine.profileView(user) })
    })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl
    if (avatarUrl) this.setData({ 'form.avatarUrl': avatarUrl })
  },

  onNickInput(e) {
    this.setData({ 'form.nickName': e.detail.value })
  },

  onBioInput(e) {
    this.setData({ 'form.bio': e.detail.value })
  },

  onSelectGender() {
    const current = this.data.form.gender
    const next = GENDERS[(GENDERS.indexOf(current) + 1) % GENDERS.length]
    this.setData({ 'form.gender': next })
  },

  onBirthdayChange(e) {
    this.setData({ 'form.birthday': e.detail.value })
  },

  onSave() {
    const form = this.data.form
    mine
      .updateProfile({
        nickname: form.nickName,
        avatarUrl: form.avatarUrl,
        gender: mine.GENDER_VALUE[form.gender] == null ? 0 : mine.GENDER_VALUE[form.gender],
        birthday: form.birthday,
        signature: form.bio,
      })
      .then(() => {
        toast('保存成功')
        setTimeout(() => wx.navigateBack(), 400)
      })
      .catch((err) => toast((err && err.message) || '保存失败'))
  },
})
