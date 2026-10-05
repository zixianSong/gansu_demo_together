import * as mine from '../../../services/user/user'

const GENDERS = ['女', '男', '保密']

function toast(title: string) {
  wx.showToast({ title, icon: 'none' })
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
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

  onChooseAvatar(e: WechatMiniprogram.TouchEvent) {
    const avatarUrl = e.detail && (e.detail as { avatarUrl?: string }).avatarUrl
    if (avatarUrl) this.setData({ 'form.avatarUrl': avatarUrl })
  },

  onNickInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.nickName': e.detail.value })
  },

  onBioInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.bio': e.detail.value })
  },

  onSelectGender() {
    const current = this.data.form.gender as string
    const next = GENDERS[(GENDERS.indexOf(current) + 1) % GENDERS.length]
    this.setData({ 'form.gender': next })
  },

  onBirthdayChange(e: WechatMiniprogram.PickerChange) {
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
      .catch((err: unknown) => toast(errMsg(err, '保存失败')))
  },
})
