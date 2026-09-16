import { request } from '../request'
import type { SpotListQuery, SpotListResult } from '../types/spot'

export function fetchSpotList(query: SpotListQuery = {}): Promise<SpotListResult> {
  return request<SpotListResult>({
    url: '/spots',
    method: 'GET',
    data: query,
  })
}
