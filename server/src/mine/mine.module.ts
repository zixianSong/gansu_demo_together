import { Global, Module } from '@nestjs/common';
import { HeaderMineUserAdapter } from './header-mine-user.adapter';
import { MINE_USER_PORT } from './mine-user.port';

@Global()
@Module({
  providers: [{ provide: MINE_USER_PORT, useClass: HeaderMineUserAdapter }],
  exports: [MINE_USER_PORT],
})
export class MineModule {}
