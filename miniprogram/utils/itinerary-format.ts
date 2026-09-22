const WEEK = '日一二三四五六'

export function formatClock(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  return `${hh}:${mm}`
}

export function formatCnDate(isoDate: string | null | undefined) {
  if (!isoDate) return ''
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatWeekday(isoDate: string | null | undefined) {
  if (!isoDate) return ''
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`)
  return `周${WEEK[d.getDay()]}`
}

export function formatDayMeta(isoDate: string | null | undefined, dayNumber: number | null | undefined) {
  const w = formatWeekday(isoDate)
  const n = dayNumber != null ? `第${dayNumber}天` : ''
  return [w, n].filter(Boolean).join(' · ')
}

export function planCity(cities: unknown): string {
  if (Array.isArray(cities) && cities.length) return String(cities[0])
  if (typeof cities === 'string' && cities) return cities
  return ''
}

export function nodeKind(type: string | null | undefined) {
  const t = type || ''
  if (t.includes('住宿') || t.includes('酒店')) return 'hotel'
  if (t.includes('交通')) return 'transit'
  return 'spot'
}
