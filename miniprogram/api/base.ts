export type EnvType = 'development' | 'test' | 'production'

const ENV_BASE_URL: Record<EnvType, string> = {
  development: 'http://127.0.0.1:3000/api/v1',
  test: 'https://test-api.example.com/api/v1',
  production: 'https://api.example.com/api/v1',
}

const currentEnv: EnvType = 'development'

export const BASE_URL = ENV_BASE_URL[currentEnv]

export const getBaseUrl = (): string => BASE_URL
