import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from '../auth/dto';
import { toPublicUser } from './user.mapper';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    return toPublicUser(await this.loadUser(userId));
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.loadUser(userId);
    const updated = await this.prisma.user.update({
      where: { userId: BigInt(userId) },
      data: {
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
        gender: dto.gender,
        birthday: dto.birthday ? new Date(`${dto.birthday}T00:00:00`) : undefined,
        signature: dto.signature,
      },
    });
    return toPublicUser(updated);
  }

  async saveAvatar(userId: number, filename: string, publicBase: string) {
    await this.loadUser(userId);
    const avatarUrl = `${publicBase}/uploads/avatars/${filename}`;
    const updated = await this.prisma.user.update({
      where: { userId: BigInt(userId) },
      data: { avatarUrl },
    });
    return { avatarUrl: updated.avatarUrl };
  }

  private async loadUser(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { userId: BigInt(userId), deletedAt: null, status: 1 },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  ensureImage(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传图片');
    }
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    if (!ok) {
      throw new BadRequestException('仅支持 jpg/png/webp');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('图片不能超过 2MB');
    }
  }
}
