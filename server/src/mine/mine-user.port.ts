export const MINE_USER_PORT = 'MINE_USER_PORT';

/** 「我的」模块可替换端口：目前只解析用户 ID，不实现登录。 */
export interface MineUserPort {
  requireUserId(raw: string | undefined): bigint;
}
