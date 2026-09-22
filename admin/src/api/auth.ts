import { request, setToken } from './request';

export interface LoginResult {
  token: string;
  username: string;
  expiresAt: string;
}

export async function login(username: string, password: string) {
  const data = await request<LoginResult>('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}
