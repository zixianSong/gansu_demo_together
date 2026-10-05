import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MineUserPort } from './mine-user.port';

/**
 * 临时实现：从请求头 X-User-Id 取用户，默认没有登录态。
 * 「我的」模块合入后替换本类，行程管理的业务代码不用改。
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
