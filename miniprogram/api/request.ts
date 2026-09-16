import { BASE_URL } from './base'

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: WechatMiniprogram.IAnyObject
  header?: WechatMiniprogram.IAnyObject
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {} } = options

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.code === 0) {
          resolve(body.data)
          return
        }
        reject(new Error(body?.message || `请求失败(${res.statusCode})`))
      },
      fail: (err) => reject(err),
    })
  })
}
