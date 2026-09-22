export interface CharterRoute {
  id: number
  routeName: string
  startCity: string
  endCity: string
  estimatedDuration: string | null
  referencePrice: number | null
  routeDesc: string | null
  coverImg: string | null
  score: number | null
  soldCount: number
}

export interface CharterCity {
  id: number
  name: string
  hot: boolean
}

export interface CharterCarModel {
  id: number
  modelName: string
  vehicleType: string | null
  seatCount: number
}

export interface CharterBanner {
  id: number
  title: string | null
  imageUrl: string
  linkType: string
  linkId: number | null
  linkPath: string | null
}

export interface CharterRoutesData {
  list: CharterRoute[]
  page: number
  pageSize: number
  total: number
  cities: CharterCity[]
  carModels: CharterCarModel[]
  banner: CharterBanner | null
}

export type CharterSort = 'recommend' | 'priceAsc' | 'soldDesc'

import { request } from '../request'

export function fetchCharterRoutes(params: {
  startCity?: string
  tripType?: string
  sort?: CharterSort
  page?: number
  pageSize?: number
}) {
  const data: Record<string, string | number> = {
    startCity: params.startCity || '西宁',
    sort: params.sort || 'recommend',
    page: params.page || 1,
    pageSize: params.pageSize || 20,
  }
  if (params.tripType) data.tripType = params.tripType
  return request<CharterRoutesData>({
    url: '/charter/routes',
    method: 'GET',
    data,
  })
}
