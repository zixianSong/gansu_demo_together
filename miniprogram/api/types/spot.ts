export interface SpotListItem {
  id: string
  name: string
  cover: string
  city: string
  price?: number
  tags?: string[]
}

export interface SpotListQuery {
  keyword?: string
  city?: string
  page?: number
  pageSize?: number
}

export interface SpotListResult {
  list: SpotListItem[]
  total: number
}
