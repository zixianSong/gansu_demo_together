/** 临时注入令牌。正式登录接上后仍用这个令牌，只换实现类。 */
export const MINE_USER_PORT = 'MINE_USER_PORT';

/**
 * 临时用户端口，不是「我的」页面。
 * 目前只解析用户 ID，不实现登录、资料或订单。
 */
export interface MineUserPort {
  requireUserId(raw: string | undefined): bigint;
}
