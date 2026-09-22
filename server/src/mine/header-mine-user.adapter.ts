import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MineUserPort } from './mine-user.port';

/**
 * 占位适配：从请求头 X-User-Id 取用户。
 * 合并「我的」模块时，替换本 provider 即可，行程管理 Module 不用改业务。
 */
@Injectable()
export class HeaderMineUserAdapter implements MineUserPort {
  requireUserId(raw: string | undefined): bigint {
    if (!raw || !/^\d+$/.test(raw.trim())) {
      throw new UnauthorizedException('缺少用户标识（X-User-Id），请对接「我的」模块');
    }
    return BigInt(raw.trim());
  }
}
