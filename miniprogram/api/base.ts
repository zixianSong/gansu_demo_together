const config = require('./config')

export type EnvType = 'development' | 'test' | 'production'

export const BASE_URL: string = config.BASE_URL
export const ENABLE_REMOTE_API: boolean = config.ENABLE_REMOTE_API
export const MINE_USE_MOCK: boolean = config.MINE_USE_MOCK
export const MINE_AUTH_REMOTE: boolean = config.MINE_AUTH_REMOTE
export const MINE_ORDERS_REMOTE: boolean = config.MINE_ORDERS_REMOTE
export const MINE_REVIEWS_REMOTE: boolean = config.MINE_REVIEWS_REMOTE
export const MINE_TRAVELERS_REMOTE: boolean = config.MINE_TRAVELERS_REMOTE
export const MINE_EXPLORE_REMOTE: boolean = config.MINE_EXPLORE_REMOTE
export const MINE_LEGAL_REMOTE: boolean = config.MINE_LEGAL_REMOTE

export const getBaseUrl = (): string => BASE_URL
