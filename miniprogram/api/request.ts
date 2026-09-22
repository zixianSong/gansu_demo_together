import { BASE_URL, ENABLE_REMOTE_API } from './base'

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: WechatMiniprogram.IAnyObject
  header?: WechatMiniprogram.IAnyObject
  auth?: boolean
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export class ApiError extends Error {
  code: number
  constructor(message: string, code = 500) {
    super(message)
    this.code = code
  }
}

function readToken(): string {
  try {
    return String(wx.getStorageSync('accessToken') || '')
  } catch {
    return ''
  }
}

function clearSession() {
  try {
    wx.removeStorageSync('accessToken')
    wx.removeStorageSync('userProfile')
  } catch {
    /* ignore */
  }
}

export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, auth = true } = options

  if (!ENABLE_REMOTE_API) {
    return Promise.reject(new ApiError('REMOTE_API_DISABLED', 0))
  }

  const token = readToken()
  const headers: WechatMiniprogram.IAnyObject = {
    'Content-Type': 'application/json',
    ...header,
  }
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
      success: (res) => {
        const body = res.data as ApiResponse<T>
        const code = body?.code
        if (res.statusCode === 401 || code === 401) {
          clearSession()
          reject(new ApiError(body?.message || '未登录或登录已过期', 401))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && code === 0) {
          resolve(body.data)
          return
        }
        reject(new ApiError(body?.message || `请求失败(${res.statusCode})`, code || res.statusCode))
      },
      fail: (err) => reject(err),
    })
  })
}
