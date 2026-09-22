const TOKEN_KEY = 'admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const body = (await res.json()) as ApiResponse<T>;

  if (res.status === 401) {
    clearToken();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error(body?.message || '请先登录');
  }

  if (!res.ok || body.code !== 0) {
    throw new Error(body?.message || `请求失败(${res.status})`);
  }

  return body.data;
}
