import { request } from './request';

export interface ArticleListItem {
  id: number;
  title: string;
  coverUrl: string | null;
  contentType: string;
  author: string | null;
  publishedAt: string | null;
  status: number;
  wechatUrl: string | null;
  createdAt: string | null;
}

export interface ArticleDetail extends ArticleListItem {
  contentHtml: string | null;
  tags: string[];
  updatedAt: string | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ImportResult {
  id: number;
  title: string;
  coverUrl: string | null;
  imageCount: number;
  contentHtmlLength: number;
  wechatUrl: string;
}

export function fetchArticles(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  contentType?: string;
  status?: number;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.keyword) q.set('keyword', params.keyword);
  if (params.contentType) q.set('contentType', params.contentType);
  if (params.status !== undefined && params.status !== -1) {
    q.set('status', String(params.status));
  }
  return request<{ list: ArticleListItem[]; pagination: Pagination }>(
    `/api/v1/admin/articles?${q.toString()}`,
  );
}

export function fetchArticleDetail(id: number) {
  return request<ArticleDetail>(`/api/v1/admin/articles/${id}`);
}

export function importWechatArticle(url: string, overwrite = false) {
  return request<ImportResult>('/api/v1/admin/articles/import-wechat', {
    method: 'POST',
    body: JSON.stringify({ url, overwrite }),
  });
}

export function updateArticle(
  id: number,
  data: {
    title?: string;
    contentType?: string;
    author?: string;
    publishedAt?: string;
    tags?: string[];
  },
) {
  return request<ArticleListItem>(`/api/v1/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function updateArticleStatus(id: number, status: 0 | 1) {
  return request<ArticleListItem>(`/api/v1/admin/articles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteArticle(id: number) {
  return request<{ id: number }>(`/api/v1/admin/articles/${id}`, {
    method: 'DELETE',
  });
}
