import { request } from '../request'
import { getUserId } from '../../utils/user-id'

/** 临时请求头。用户 ID 来自 utils/user-id，不是登录态。 */
function headers() {
  return { 'X-User-Id': getUserId() }
}

export interface ItineraryItem {
  id: number | null
  sortOrder: number
  type: string | null
  timeSlot: number | null
  exactStartTime: string | null
  exactEndTime: string | null
  name: string | null
  photoUrl: string | null
  images: string[]
  latitude: number | null
  longitude: number | null
  poiId: number | null
  poiName?: string | null
  poiAddress?: string | null
  poiCategory?: string | null
  completed: boolean
  details: Record<string, unknown>
}

export interface ItineraryDay {
  id: number | null
  dayNumber: number | null
  date: string | null
  weather: { text?: string; temp?: number } | null
  items: ItineraryItem[]
}

export interface PlanCard {
  id: number | null
  name: string | null
  attractionSummary: string | null
  planStatus: string
  startDate: string | null
  endDate: string | null
  cities: unknown
  analytics: unknown
  badges: unknown
  updatedAt: string | null
}

export interface CurrentView {
  plan: PlanCard | null
  phase: string
  canAdjust: boolean
  days: ItineraryDay[]
  focusedNode: ItineraryItem | null
}

function call<T>(url: string, method: 'GET' | 'POST' = 'GET', data?: WechatMiniprogram.IAnyObject) {
  return request<T>({ url, method, data, header: headers() })
}

export function fetchCurrent(query?: { date?: string; slot?: string; nodeId?: string }) {
  return call<CurrentView>('/itinerary/current', 'GET', query as WechatMiniprogram.IAnyObject)
}

export function fetchPlans(status?: string) {
  return call<{ list: PlanCard[] }>('/itinerary/plans', 'GET', status ? { status } : undefined)
}

export function fetchPlan(planId: number) {
  return call<CurrentView>(`/itinerary/plans/${planId}`)
}

export function previewSwitch(planId: number, loc?: { lat?: number; lng?: number }) {
  return call<{
    conflicts: {
      duplicatePlaces: Array<{ name: string; poiId: number | null }>
      timeLocationConflicts: Array<{ name: string; reason: string }>
    }
    target: PlanCard
  }>(`/itinerary/plans/${planId}/switch-preview`, 'GET', loc)
}

export function switchPlan(planId: number, loc?: { lat?: number; lng?: number }) {
  return call(`/itinerary/plans/${planId}/switch`, 'POST', loc)
}

export function fetchSnapshots(planId: number) {
  return call<{ list: Array<{ id: number | null; createdAt: string | null }> }>(
    `/itinerary/plans/${planId}/snapshots`,
  )
}

export function restoreSnapshot(planId: number, snapshotId: number) {
  return call(`/itinerary/plans/${planId}/snapshots/${snapshotId}/restore`, 'POST', {})
}

export function postSense(body: { lat?: number; lng?: number }) {
  return call<{
    phase: string
    canAdjust: boolean
    located: boolean
    hints: Array<{
      key: string
      severity: string
      type: string
      message: string
      itemId: number | null
    }>
  }>('/itinerary/sense', 'POST', body)
}

export function ignoreHint(hintKey: string) {
  return call('/itinerary/hints/ignore', 'POST', { hintKey })
}

export function fetchConversations(planId?: number) {
  return call<{
    list: Array<{
      id: number | null
      planId: number | null
      userInput: string | null
      formData: unknown
      aiResponse: unknown
      createdAt: string | null
    }>
  }>('/itinerary/conversations', 'GET', planId != null ? { planId } : undefined)
}

export function postConversation(body: {
  userInput?: string
  formData?: unknown
  aiResponse?: unknown
}) {
  return call<{
    id: number | null
    planId: number | null
    userInput: string | null
    formData: unknown
    aiResponse: unknown
    createdAt: string | null
  }>('/itinerary/conversations', 'POST', body)
}
