import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      userId?: number;
    }>();
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      throw new UnauthorizedException('未登录或登录已过期');
    }
    try {
      const payload = this.jwt.verify<{ sub: number }>(token);
      req.userId = Number(payload.sub);
      return true;
    } catch {
      throw new UnauthorizedException('未登录或登录已过期');
    }
  }
}

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest<{ userId?: number }>();
    if (!req.userId) {
      throw new UnauthorizedException('未登录或登录已过期');
    }
    return req.userId;
  },
);
