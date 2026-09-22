import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/serialize';
import { ID_TYPE, maskId, maskPhone } from './order.mapper';
import { CreateTravelerDto, UpdateTravelerDto } from '../auth/dto';

@Injectable()
export class TravelersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number) {
    const rows = await this.prisma.traveler.findMany({
      where: { userId: BigInt(userId), deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return { list: rows.map((row) => this.toPublic(row)) };
  }

  async create(userId: number, dto: CreateTravelerDto) {
    this.assertPlainId(dto.idNumber, dto.idType || 1);
    const isDefault = dto.isDefault === true;
    if (isDefault) {
      await this.clearDefault(userId);
    }
    const row = await this.prisma.traveler.create({
      data: {
        userId: BigInt(userId),
        name: dto.name.trim(),
        idType: dto.idType || 1,
        idNumber: dto.idNumber.trim(),
        phone: dto.phone?.trim() || null,
        phoneAreaCode: dto.phoneAreaCode || '+86',
        isDefault: isDefault ? 1 : 0,
      },
    });
    return this.toPublic(row);
  }

  async update(userId: number, travelerId: number, dto: UpdateTravelerDto) {
    const row = await this.loadOwn(userId, travelerId);
    const hasField = ['name', 'idType', 'idNumber', 'phone', 'phoneAreaCode', 'isDefault'].some(
      (key) => dto[key as keyof UpdateTravelerDto] !== undefined,
    );
    if (!hasField) {
      throw new BadRequestException('至少填写一项');
    }
    if (dto.idNumber !== undefined) {
      this.assertPlainId(dto.idNumber, dto.idType || row.idType || 1);
    }
    if (dto.isDefault === true) {
      await this.clearDefault(userId);
    }
    const updated = await this.prisma.traveler.update({
      where: { travelerId: row.travelerId },
      data: {
        name: dto.name?.trim(),
        idType: dto.idType,
        idNumber: dto.idNumber?.trim(),
        phone: dto.phone !== undefined ? dto.phone.trim() || null : undefined,
        phoneAreaCode: dto.phoneAreaCode,
        isDefault: dto.isDefault === undefined ? undefined : dto.isDefault ? 1 : 0,
      },
    });
    return this.toPublic(updated);
  }

  async remove(userId: number, travelerId: number) {
    const row = await this.loadOwn(userId, travelerId);
    await this.prisma.traveler.update({
      where: { travelerId: row.travelerId },
      data: { deletedAt: new Date() },
    });
    return null;
  }

  private toPublic(row: {
    travelerId: bigint;
    name: string;
    idType: number | null;
    idNumber: string;
    phone: string | null;
    phoneAreaCode: string | null;
    isDefault: number | null;
  }) {
    const idType = row.idType ?? 1;
    return {
      travelerId: toNum(row.travelerId),
      name: row.name,
      idType,
      idTypeText: ID_TYPE[idType] || '身份证',
      idNumber: maskId(row.idNumber),
      phone: maskPhone(row.phone),
      phoneAreaCode: row.phoneAreaCode || '+86',
      isDefault: row.isDefault === 1,
    };
  }

  private assertPlainId(idNumber: string, idType: number) {
    const raw = String(idNumber || '').trim();
    if (!raw || raw.includes('*')) {
      throw new BadRequestException('请填写完整证件号或不要传证件号');
    }
    if (idType === 1) {
      if (!/^\d{15}$/.test(raw) && !/^\d{17}[\dXx]$/.test(raw)) {
        throw new BadRequestException('证件格式不合法');
      }
      return;
    }
    if (raw.length < 6 || raw.length > 30) {
      throw new BadRequestException('证件格式不合法');
    }
  }

  private async clearDefault(userId: number) {
    await this.prisma.traveler.updateMany({
      where: { userId: BigInt(userId), deletedAt: null, isDefault: 1 },
      data: { isDefault: 0 },
    });
  }

  private async loadOwn(userId: number, travelerId: number) {
    const row = await this.prisma.traveler.findFirst({
      where: { travelerId: BigInt(travelerId), deletedAt: null },
    });
    if (!row) {
      throw new NotFoundException('出行人不存在');
    }
    if (Number(row.userId) !== userId) {
      throw new ForbiddenException('无权操作');
    }
    return row;
  }
}
