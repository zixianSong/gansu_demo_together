import { request } from '../request'

export interface FeedItem {
  id: number
  title: string
  coverUrl: string | null
  contentType: string
  author: string | null
  publishedAt: string | null
  tags: string[]
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface ArticleDetail {
  id: number
  title: string
  coverUrl: string | null
  contentType: string
  contentHtml: string | null
  author: string | null
  publishedAt: string | null
  tags: string[]
  hasRelatedPois: boolean
  hasRelatedRoutes: boolean
}

export interface RelatedPoi {
  poiId: number
  name: string
  coverUrl: string | null
  category: string
  city: string | null
  address: string | null
  sortOrder: number
}

export interface RelatedRoute {
  routeId: number
  name: string
  coverUrl: string | null
  subtitle: string | null
  daysCount: number
  sortOrder: number
}

export interface PoiDetail {
  id: number
  name: string
  coverUrl: string | null
  intro: string | null
  address: string | null
  category: string
  city: string | null
}

export interface BannerItem {
  id: number
  title: string | null
  imageUrl: string
  linkType: string
  linkId: number | null
  linkPath: string | null
  sortOrder: number
}

export function fetchFeed(page = 1, pageSize = 10) {
  return request<{ list: FeedItem[]; pagination: Pagination }>({
    url: '/home/feed',
    method: 'GET',
    data: { page, pageSize },
  })
}

export function fetchBanners() {
  return request<{ list: BannerItem[] }>({
    url: '/home/banners',
    method: 'GET',
  })
}

export function fetchArticleDetail(id: number) {
  return request<ArticleDetail>({
    url: `/articles/${id}`,
    method: 'GET',
  })
}

export function fetchArticlePois(id: number) {
  return request<{ list: RelatedPoi[] }>({
    url: `/articles/${id}/pois`,
    method: 'GET',
  })
}

export function fetchArticleRoutes(id: number) {
  return request<{ list: RelatedRoute[] }>({
    url: `/articles/${id}/routes`,
    method: 'GET',
  })
}

export function fetchPoiDetail(id: number) {
  return request<PoiDetail>({
    url: `/pois/${id}`,
    method: 'GET',
  })
}
