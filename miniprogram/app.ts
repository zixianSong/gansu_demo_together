// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.login({
      success: (res) => {
        console.log('login code', res.code)
      },
    })
  },
})
