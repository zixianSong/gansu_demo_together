export function getUserId(): string {
  const stored = wx.getStorageSync('userId')
  if (stored) return String(stored)
  return '1'
}
