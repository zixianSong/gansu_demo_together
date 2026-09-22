import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUser } from '../me/user.mapper';
import { WechatLoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async wechatLogin(dto: WechatLoginDto) {
    const session = await this.code2Session(dto.code);
    const existing = await this.prisma.user.findFirst({
      where: { openid: session.openid, deletedAt: null },
    });

    const user = existing
      ? await this.prisma.user.update({
          where: { userId: existing.userId },
          data: {
            unionid: session.unionid || existing.unionid,
            nickname: dto.nickname || existing.nickname,
            avatarUrl: dto.avatarUrl || existing.avatarUrl,
          },
        })
      : await this.prisma.user.create({
          data: {
            openid: session.openid,
            unionid: session.unionid,
            nickname: dto.nickname,
            avatarUrl: dto.avatarUrl,
          },
        });

    if (user.status !== 1 || user.deletedAt) {
      throw new BadRequestException('账号不可用');
    }

    const accessToken = await this.jwt.signAsync({
      sub: Number(user.userId),
    });
    return {
      accessToken,
      expiresIn: 604800,
      user: toPublicUser(user),
    };
  }

  private async code2Session(code: string) {
    const appid = this.config.get<string>('WECHAT_APPID') || '';
    const secret = this.config.get<string>('WECHAT_SECRET') || '';
    const allowMock = this.config.get<string>('WECHAT_DEV_MOCK') === 'true';

    if (!secret) {
      if (allowMock) {
        return { openid: 'dev_simulator_openid', unionid: null as string | null };
      }
      throw new BadRequestException('未配置 WECHAT_SECRET');
    }

    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', appid);
    url.searchParams.set('secret', secret);
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');

    const res = await fetch(url);
    const json = (await res.json()) as {
      openid?: string;
      unionid?: string;
      errcode?: number;
      errmsg?: string;
    };
    if (!json.openid) {
      throw new BadRequestException(json.errmsg || '微信登录失败');
    }
    return { openid: json.openid, unionid: json.unionid || null };
  }
}
