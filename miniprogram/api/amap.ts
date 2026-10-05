/** 高德开放平台 · Web 服务 Key（天气等 REST）。交互地图用微信原生 map（GCJ-02，与高德同一坐标系）。 */
const AMAP_WEB_KEY = '126f152cac4814a314dc81bd36d25ead'

export type AmapLiveWeather = {
  city: string
  weather: string
  temperature: string
}

export function fetchAmapWeather(city: string): Promise<AmapLiveWeather | null> {
  const name = city.trim()
  if (!name) return Promise.resolve(null)
  return new Promise((resolve) => {
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      method: 'GET',
      data: {
        key: AMAP_WEB_KEY,
        city: name,
        extensions: 'base',
      },
      success: (res) => {
        const body = res.data as {
          status?: string
          lives?: Array<{ city?: string; weather?: string; temperature?: string }>
        }
        const live = body?.status === '1' ? body.lives?.[0] : undefined
        if (!live?.weather) {
          resolve(null)
          return
        }
        resolve({
          city: live.city || name,
          weather: String(live.weather),
          temperature: String(live.temperature || ''),
        })
      },
      fail: () => resolve(null),
    })
  })
}
