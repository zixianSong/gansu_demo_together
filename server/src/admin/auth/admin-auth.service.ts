import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class AdminAuthService {
  constructor(private readonly config: ConfigService) {}

  login(username: string, password: string) {
    const expectedUser =
      this.config.get<string>('ADMIN_USERNAME') || 'admin';
    const expectedPass =
      this.config.get<string>('ADMIN_PASSWORD') || 'admin123';
    const secret =
      this.config.get<string>('ADMIN_JWT_SECRET') ||
      'gansu-travel-admin-dev-secret';

    if (username !== expectedUser || password !== expectedPass) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const payload = `${username}:${exp}`;
    const sig = createHmac('sha256', secret).update(payload).digest('hex');
    return {
      token: `${Buffer.from(payload).toString('base64url')}.${sig}`,
      username,
      expiresAt: new Date(exp).toISOString(),
    };
  }

  verifyToken(token: string): boolean {
    const secret =
      this.config.get<string>('ADMIN_JWT_SECRET') ||
      'gansu-travel-admin-dev-secret';
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;

    let payload = '';
    try {
      payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    } catch {
      return false;
    }

    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    try {
      const a = Buffer.from(sig, 'utf8');
      const b = Buffer.from(expected, 'utf8');
      if (a.length !== b.length) return false;
      if (!timingSafeEqual(a, b)) return false;
    } catch {
      return false;
    }

    const [, expStr] = payload.split(':');
    const exp = Number(expStr);
    return Number.isFinite(exp) && exp > Date.now();
  }
}
