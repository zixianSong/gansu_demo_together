/**
 * 临时模块，不是页面目录里的「我的」(user)。
 * 行程管理还没有登录，只用它从请求头认出用户。
 * 「我的」模块合入后，替换 HeaderMineUserAdapter，本文件的注册方式可以保留。
 */
import { Global, Module } from '@nestjs/common';
import { HeaderMineUserAdapter } from './header-mine-user.adapter';
import { MINE_USER_PORT } from './mine-user.port';

@Global()
@Module({
  providers: [{ provide: MINE_USER_PORT, useClass: HeaderMineUserAdapter }],
  exports: [MINE_USER_PORT],
})
export class MineModule {}
