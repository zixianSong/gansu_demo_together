const mine = require('../../services/mine')

function fail(err) {
  wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' })
}

Page({
  data: {
    title: '说明',
    paragraphs: [],
    html: '',
  },

  onLoad(query) {
    const type = (query && query.type) || 'about'
    if (type === 'about') {
      wx.setNavigationBarTitle({ title: '关于我们' })
      mine
        .fetchAbout()
        .then((about) => {
          this.setData({
            title: about.name || '关于我们',
            paragraphs: [about.intro, `当前版本 ${about.version}`].filter(Boolean),
            html: '',
          })
        })
        .catch(fail)
      return
    }
    if (type === 'collect') {
      wx.setNavigationBarTitle({ title: '个人信息收集清单' })
      mine
        .fetchCollectList()
        .then((data) => {
          const rows = (data && data.rows) || []
          this.setData({
            title: '个人信息收集清单',
            html: '',
            paragraphs: rows.map(
              (row) => `${row.scene}：${row.dataTypes}。目的：${row.purpose}。方式：${row.method}。`,
            ),
          })
        })
        .catch(fail)
      return
    }
    if (type === 'privacy') {
      wx.setNavigationBarTitle({ title: '隐私政策' })
      mine
        .fetchPrivacy()
        .then((data) => {
          this.setData({
            title: data.title || '隐私政策',
            paragraphs: [],
            html: data.contentHtml || '',
          })
        })
        .catch(fail)
      return
    }
    wx.setNavigationBarTitle({ title: '应用权限说明' })
    mine
      .fetchPermissions()
      .then((data) => {
        const preamble = (data && data.preamble) || []
        const rows = (data && data.rows) || []
        this.setData({
          title: '应用权限说明',
          html: '',
          paragraphs: preamble.concat(
            rows.map((row) => `${row.permission}：${row.purpose}（${row.timing}）`),
          ),
        })
      })
      .catch(fail)
  },
})
