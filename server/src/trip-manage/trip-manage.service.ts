import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MINE_USER_PORT, type MineUserPort } from '../mine/mine-user.port';
import { toIso, toNum } from '../common/utils/serialize';
import {
  ApplyPlanDto,
  CreateConversationDto,
} from './dto/trip-manage.dto';
import {
  haversineKm,
  isCompleted,
  readDetails,
  toPlainItem,
  tripPhase,
} from './trip-manage.mapper';

const itemInclude = { poi: true } as const;

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    /** 临时用户来源，见 src/mine。正式登录只替换该实现。 */
    @Inject(MINE_USER_PORT) private readonly mineUser: MineUserPort,
  ) {}

  userId(raw: string | undefined) {
    return this.mineUser.requireUserId(raw);
  }

  async listPlans(userId: bigint, status?: string) {
    const rows = await this.prisma.plan.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { planStatus: status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { list: rows.map((p) => this.plainPlan(p)) };
  }

  async getCurrent(
    userId: bigint,
    query: { date?: string; slot?: string; nodeId?: string },
  ) {
    const plan = await this.prisma.plan.findFirst({
      where: { userId, planStatus: 'current', deletedAt: null },
    });
    if (!plan) {
      return {
        plan: null,
        phase: 'unknown' as const,
        canAdjust: true,
        days: [],
        focusedNode: null,
      };
    }
    return this.buildView(plan.id, query);
  }

  async getPlanView(
    userId: bigint,
    planId: bigint,
    query: { date?: string; slot?: string; nodeId?: string },
  ) {
    const plan = await this.requireOwned(userId, planId);
    return this.buildView(plan.id, query);
  }

  async previewSwitch(
    userId: bigint,
    targetPlanId: bigint,
    loc?: { lat?: number; lng?: number },
  ) {
    const current = await this.prisma.plan.findFirst({
      where: { userId, planStatus: 'current', deletedAt: null },
    });
    const target = await this.requireOwned(userId, targetPlanId);
    if (target.planStatus === 'current') {
      return { conflicts: this.emptyConflicts(), target: this.plainPlan(target) };
    }
    const currentItems = current
      ? await this.loadItems(current.id)
      : [];
    const targetItems = await this.loadItems(target.id);
    return {
      conflicts: this.computeConflicts(currentItems, targetItems, loc),
      target: this.plainPlan(target),
      fromPlanId: current ? toNum(current.id) : null,
    };
  }

  async switchPlan(
    userId: bigint,
    targetPlanId: bigint,
    loc?: { lat?: number; lng?: number },
  ) {
    const preview = await this.previewSwitch(userId, targetPlanId, loc);
    const target = await this.requireOwned(userId, targetPlanId);
    await this.prisma.$transaction(async (tx) => {
      await tx.plan.updateMany({
        where: { userId, planStatus: 'current', deletedAt: null },
        data: { planStatus: 'draft' },
      });
      await tx.plan.update({
        where: { id: target.id },
        data: { planStatus: 'current', deletedAt: null },
      });
    });
    const view = await this.buildView(target.id, {});
    return { ...preview, switched: true, current: view };
  }

  async listSnapshots(userId: bigint, planId: bigint) {
    const plan = await this.requireOwned(userId, planId);
    const rows = await this.prisma.planSnapshot.findMany({
      where: { planId: plan.id },
      orderBy: { createdAt: 'desc' },
    });
    return {
      planId: toNum(plan.id),
      list: rows.map((s) => ({
        id: toNum(s.id),
        createdAt: toIso(s.createdAt),
      })),
    };
  }

  async restoreSnapshot(
    userId: bigint,
    planId: bigint,
    snapshotId: bigint,
    loc?: { lat?: number; lng?: number },
  ) {
    const plan = await this.requireOwned(userId, planId);
    if (plan.planStatus !== 'current') {
      throw new ForbiddenException('请先将该方案切换为当前方案再恢复历史版本');
    }
    const snap = await this.prisma.planSnapshot.findFirst({
      where: { id: snapshotId, planId: plan.id },
    });
    if (!snap?.snapshotData) {
      throw new NotFoundException('历史版本不存在');
    }
    const currentItems = await this.loadItems(plan.id);
    const data = snap.snapshotData as SnapshotPayload;
    const targetItems = this.flattenSnapshotItems(data);
    const conflicts = this.computeConflicts(currentItems, targetItems, loc);
    await this.replaceLiveFromSnapshot(plan.id, data);
    return {
      conflicts,
      restoredSnapshotId: toNum(snap.id),
      current: await this.buildView(plan.id, {}),
    };
  }

  async applyPreview(userId: bigint, dto: ApplyPlanDto) {
    const plan = await this.requireCurrent(userId);
    if (!dto.days?.length) {
      throw new BadRequestException('调整预览不能为空');
    }
    const phase = tripPhase(plan.startDate, plan.endDate);
    if (phase === 'after') {
      throw new ForbiddenException('行程已结束，不能再生成或调整方案');
    }
    const oldItems = await this.loadItems(plan.id);
    const snapshot = await this.captureSnapshot(plan.id);
    await this.writeLiveFromApply(plan, dto, oldItems, phase);
    return {
      previousSnapshotId: snapshot ? toNum(snapshot.id) : null,
      current: await this.buildView(plan.id, {}),
    };
  }

  async completeItem(
    userId: bigint,
    itemId: bigint,
    completed = true,
  ) {
    const item = await this.prisma.itineraryItem.findFirst({
      where: { id: itemId },
      include: { planDay: { include: { plan: true } } },
    });
    if (!item || item.planDay.plan.userId !== userId) {
      throw new NotFoundException('节点不存在');
    }
    const details = {
      ...readDetails(item.details),
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    };
    if (!completed) delete details.completedAt;
    await this.prisma.itineraryItem.update({
      where: { id: item.id },
      data: { details: details as Prisma.InputJsonValue },
    });
    return { id: toNum(item.id), completed };
  }

  async sense(
    userId: bigint,
    loc: { lat?: number; lng?: number; at?: string },
  ) {
    const plan = await this.prisma.plan.findFirst({
      where: { userId, planStatus: 'current', deletedAt: null },
    });
    if (!plan) {
      return { hints: [], phase: 'unknown' as const };
    }
    const phase = tripPhase(plan.startDate, plan.endDate);
    if (phase === 'after') {
      return { hints: [], phase, canAdjust: false };
    }
    const located = loc.lat != null && loc.lng != null;
    const now = loc.at ? new Date(loc.at) : new Date();
    const items = await this.loadItems(plan.id);
    const hints: Array<{
      key: string;
      severity: 'info' | 'warn' | 'severe';
      type: string;
      message: string;
      itemId: number | null;
    }> = [];

    for (const item of items) {
      if (isCompleted(item.details)) continue;
      const start = item.exactStartTime;
      if (!start) continue;
      const mins = (start.getTime() - now.getTime()) / 60000;
      const keyNear = `nearby:${item.id}`;
      const keyLate = `unlikely:${item.id}`;
      const keyOff = `deviate:${item.id}`;
      if (mins >= 0 && mins <= 90 && !(await this.ignored(userId, keyNear))) {
        hints.push({
          key: keyNear,
          severity: 'info',
          type: 'nearby',
          message: `临近节点「${item.name ?? '行程'}」将于约 ${Math.round(mins)} 分钟后开始`,
          itemId: toNum(item.id),
        });
      }
      if (mins < 0 && !(await this.ignored(userId, `overtime:${item.id}`))) {
        const hh = `${start.getHours()}`.padStart(2, '0');
        const mm = `${start.getMinutes()}`.padStart(2, '0');
        hints.push({
          key: `overtime:${item.id}`,
          severity: 'warn',
          type: 'overtime',
          message: `【${item.name ?? '行程'}】计划 ${hh}:${mm} 开始，现已超时 ${Math.round(-mins)}分钟`,
          itemId: toNum(item.id),
        });
      }
      if (
        located &&
        item.latitude != null &&
        item.longitude != null &&
        mins > 0 &&
        mins <= 180
      ) {
        const km = haversineKm(
          loc.lat as number,
          loc.lng as number,
          Number(item.latitude),
          Number(item.longitude),
        );
        const needMin = (km / 40) * 60;
        if (needMin > mins + 15 && !(await this.ignored(userId, keyLate))) {
          hints.push({
            key: keyLate,
            severity: 'severe',
            type: 'unlikely',
            message: `按当前位置，「${item.name ?? '行程'}」可能来不及按时到达`,
            itemId: toNum(item.id),
          });
        }
        if (mins < 0 && km > 3 && !(await this.ignored(userId, keyOff))) {
          hints.push({
            key: keyOff,
            severity: 'severe',
            type: 'deviate',
            message: `当前位置偏离「${item.name ?? '行程'}」约 ${km.toFixed(1)} km`,
            itemId: toNum(item.id),
          });
        }
      }
    }

    return {
      phase,
      canAdjust: true,
      located,
      hints: hints.slice(0, 5),
    };
  }

  async ignoreHint(userId: bigint, hintKey: string) {
    await this.redis.set(`itinerary:ignore:${userId}:${hintKey}`, '1', 6 * 3600);
    return { ignored: true, hintKey };
  }

  async listConversations(userId: bigint, planId?: bigint) {
    let rows;
    if (planId) {
      const plan = await this.requireOwned(userId, planId);
      rows = await this.prisma.aiConversation.findMany({
        where: { planId: plan.id },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      const current = await this.prisma.plan.findFirst({
        where: { userId, planStatus: 'current', deletedAt: null },
      });
      if (current) {
        rows = await this.prisma.aiConversation.findMany({
          where: { planId: current.id },
          orderBy: { createdAt: 'asc' },
        });
      } else {
        const all = await this.prisma.aiConversation.findMany({
          where: { planId: null },
          orderBy: { createdAt: 'asc' },
        });
        const uid = String(userId);
        rows = all.filter((c) => {
          const fd = readDetails(c.formData);
          return String(fd.userId ?? '') === uid;
        });
      }
    }
    return {
      list: rows.map((c) => ({
        id: toNum(c.id),
        planId: toNum(c.planId),
        userInput: c.userInput,
        formData: c.formData,
        aiResponse: c.aiResponse,
        createdAt: toIso(c.createdAt),
      })),
    };
  }

  async addConversation(userId: bigint, dto: CreateConversationDto) {
    const owned = dto.planId
      ? await this.requireOwned(userId, BigInt(dto.planId))
      : await this.prisma.plan.findFirst({
          where: { userId, planStatus: 'current', deletedAt: null },
        });
    const formData = {
      userId: String(userId),
      ...(dto.formData && typeof dto.formData === 'object'
        ? (dto.formData as Record<string, unknown>)
        : {}),
    };
    let preview: unknown = null;
    if (owned) {
      const view = await this.buildView(owned.id, {});
      preview = {
        name: view.plan.name,
        items: view.days.flatMap((d) =>
          d.items.map((it) => ({
            name: it.name,
            type: it.type,
            date: d.date,
          })),
        ),
      };
    }
    const aiResponse =
      dto.aiResponse ??
      ({
        text: owned
          ? '已记下你的需求。下面是现行方案摘要，真正写入仍需在规划侧确认。'
          : '告诉我出发日期、天数和想去的城市，我来帮你生成行程。确认前不会写入方案。',
        preview,
      } as Prisma.InputJsonValue);
    const row = await this.prisma.aiConversation.create({
      data: {
        planId: owned?.id ?? null,
        userInput: dto.userInput?.slice(0, 512) ?? null,
        formData: formData as Prisma.InputJsonValue,
        aiResponse,
      },
    });
    return {
      id: toNum(row.id),
      planId: toNum(row.planId),
      userInput: row.userInput,
      formData: row.formData,
      aiResponse: row.aiResponse,
      createdAt: toIso(row.createdAt),
    };
  }

  private async ignored(userId: bigint, key: string) {
    const v = await this.redis.get(`itinerary:ignore:${userId}:${key}`);
    return Boolean(v);
  }

  private async requireCurrent(userId: bigint) {
    const plan = await this.prisma.plan.findFirst({
      where: { userId, planStatus: 'current', deletedAt: null },
    });
    if (!plan) {
      throw new NotFoundException('没有当前方案');
    }
    return plan;
  }

  private async requireOwned(userId: bigint, planId: bigint) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId, deletedAt: null },
    });
    if (!plan) {
      throw new NotFoundException('方案不存在');
    }
    return plan;
  }

  private async buildView(
    planId: bigint,
    query: { date?: string; slot?: string; nodeId?: string },
  ) {
    const plan = await this.prisma.plan.findUniqueOrThrow({
      where: { id: planId },
    });
    const days = await this.prisma.planDay.findMany({
      where: { planId },
      orderBy: [{ dayNumber: 'asc' }, { date: 'asc' }],
      include: {
        items: { include: itemInclude, orderBy: { sortOrder: 'asc' } },
      },
    });
    const slotMap: Record<string, number> = {
      morning: 0,
      noon: 1,
      afternoon: 2,
      evening: 3,
    };
    const slot =
      query.slot && query.slot !== 'all' ? slotMap[query.slot] : undefined;
    const mappedDays = days
      .filter((d) => {
        if (!query.date) return true;
        return d.date && toIso(d.date)?.slice(0, 10) === query.date;
      })
      .map((d) => ({
        id: toNum(d.id),
        dayNumber: d.dayNumber,
        date: d.date ? toIso(d.date)?.slice(0, 10) : null,
        weather: d.weather,
        items: d.items
          .filter((it) => (slot == null ? true : it.timeSlot === slot))
          .map((it) => toPlainItem(it)),
      }));
    const allItems = mappedDays.flatMap((d) => d.items);
    const focused =
      query.nodeId && allItems.find((i) => i.id === Number(query.nodeId));
    const phase = tripPhase(plan.startDate, plan.endDate);
    return {
      plan: this.plainPlan(plan),
      phase,
      canAdjust: phase !== 'after',
      days: mappedDays,
      focusedNode: focused ?? null,
    };
  }

  private plainPlan(plan: {
    id: bigint;
    userId: bigint;
    name: string | null;
    attractionSummary: string | null;
    planStatus: string;
    startDate: Date | null;
    endDate: Date | null;
    cities: Prisma.JsonValue;
    analytics: Prisma.JsonValue;
    badges: Prisma.JsonValue;
    updatedAt: Date;
  }) {
    return {
      id: toNum(plan.id),
      userId: toNum(plan.userId),
      name: plan.name,
      attractionSummary: plan.attractionSummary,
      planStatus: plan.planStatus,
      startDate: toIso(plan.startDate),
      endDate: toIso(plan.endDate),
      cities: plan.cities,
      analytics: plan.analytics,
      badges: plan.badges,
      updatedAt: toIso(plan.updatedAt),
    };
  }

  private async loadItems(planId: bigint) {
    const days = await this.prisma.planDay.findMany({
      where: { planId },
      include: { items: { include: itemInclude } },
    });
    return days.flatMap((d) => d.items);
  }

  private emptyConflicts() {
    return {
      duplicatePlaces: [] as Array<{ name: string; poiId: number | null }>,
      timeLocationConflicts: [] as Array<{ name: string; reason: string }>,
    };
  }

  private computeConflicts(
    currentItems: Awaited<ReturnType<ItineraryService['loadItems']>>,
    targetItems: Array<{
      name: string | null;
      poiId: bigint | null;
      exactStartTime: Date | null;
      latitude?: Prisma.Decimal | number | null;
      longitude?: Prisma.Decimal | number | null;
      details?: Prisma.JsonValue;
    }>,
    loc?: { lat?: number; lng?: number },
  ) {
    const result = this.emptyConflicts();
    const currentPois = new Set(
      currentItems.map((i) => (i.poiId ? String(i.poiId) : '')).filter(Boolean),
    );
    const seen = new Set<string>();
    for (const t of targetItems) {
      if (t.poiId && currentPois.has(String(t.poiId))) {
        const k = String(t.poiId);
        if (!seen.has(k)) {
          seen.add(k);
          result.duplicatePlaces.push({
            name: t.name ?? '',
            poiId: toNum(t.poiId),
          });
        }
      }
      const start = t.exactStartTime;
      if (start && start < new Date() && !isCompleted(t.details)) {
        result.timeLocationConflicts.push({
          name: t.name ?? '',
          reason: '节点计划时间早于当前时间',
        });
      }
      if (
        loc?.lat != null &&
        loc?.lng != null &&
        t.latitude != null &&
        t.longitude != null &&
        start
      ) {
        const km = haversineKm(
          loc.lat,
          loc.lng,
          Number(t.latitude),
          Number(t.longitude),
        );
        const mins = (start.getTime() - Date.now()) / 60000;
        if (mins > 0 && mins < 120 && km > 30) {
          result.timeLocationConflicts.push({
            name: t.name ?? '',
            reason: '与当前地点距离较远，时间可能冲突',
          });
        }
      }
    }
    return result;
  }

  private flattenSnapshotItems(data: SnapshotPayload) {
    return (data.days ?? []).flatMap((d) =>
      (d.items ?? []).map((it) => ({
        name: it.name ?? null,
        poiId: it.poiId != null ? BigInt(it.poiId) : null,
        exactStartTime: it.exactStartTime ? new Date(it.exactStartTime) : null,
        latitude: it.latitude ?? null,
        longitude: it.longitude ?? null,
        details: it.details as Prisma.JsonValue,
      })),
    );
  }

  private async captureSnapshot(planId: bigint) {
    const days = await this.prisma.planDay.findMany({
      where: { planId },
      orderBy: { dayNumber: 'asc' },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (days.length === 0) return null;
    const payload: SnapshotPayload = {
      days: days.map((d) => ({
        dayNumber: d.dayNumber,
        date: d.date ? toIso(d.date)?.slice(0, 10) : null,
        weather: d.weather,
        items: d.items.map((it) => ({
          type: it.type,
          timeSlot: it.timeSlot,
          exactStartTime: toIso(it.exactStartTime),
          exactEndTime: toIso(it.exactEndTime),
          name: it.name,
          photoUrl: it.photoUrl,
          latitude: it.latitude == null ? null : Number(it.latitude),
          longitude: it.longitude == null ? null : Number(it.longitude),
          poiId: toNum(it.poiId),
          details: readDetails(it.details),
        })),
      })),
    };
    return this.prisma.planSnapshot.create({
      data: {
        planId,
        snapshotData: payload as Prisma.InputJsonValue,
      },
    });
  }

  private async replaceLiveFromSnapshot(planId: bigint, data: SnapshotPayload) {
    await this.prisma.$transaction(async (tx) => {
      await tx.planDay.deleteMany({ where: { planId } });
      await this.insertDays(tx, planId, data.days ?? [], []);
    });
  }

  private async writeLiveFromApply(
    plan: { id: bigint; startDate: Date | null; endDate: Date | null },
    dto: ApplyPlanDto,
    oldItems: Awaited<ReturnType<ItineraryService['loadItems']>>,
    phase: ReturnType<typeof tripPhase>,
  ) {
    const completedKeep =
      phase === 'during'
        ? oldItems.filter((i) => isCompleted(i.details))
        : [];
    await this.prisma.$transaction(async (tx) => {
      await tx.plan.update({
        where: { id: plan.id },
        data: {
          name: dto.name ?? undefined,
          attractionSummary: dto.attractionSummary ?? undefined,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          cities: (dto.cities as Prisma.InputJsonValue) ?? undefined,
        },
      });
      await tx.planDay.deleteMany({ where: { planId: plan.id } });
      await this.insertDays(tx, plan.id, dto.days, completedKeep);
    });
  }

  private async insertDays(
    tx: Prisma.TransactionClient,
    planId: bigint,
    days: NonNullable<SnapshotPayload['days']>,
    completedKeep: Awaited<ReturnType<ItineraryService['loadItems']>>,
  ) {
    const keepPoi = new Set(
      (days ?? [])
        .flatMap((d) => d.items ?? [])
        .map((i) => i.poiId)
        .filter((id): id is number => id != null)
        .map(String),
    );
    const extra = completedKeep.filter(
      (i) => !i.poiId || !keepPoi.has(String(i.poiId)),
    );
    for (const [index, day] of (days ?? []).entries()) {
      const created = await tx.planDay.create({
        data: {
          planId,
          dayNumber: day.dayNumber ?? index + 1,
          date: day.date ? new Date(day.date) : null,
          weather: (day.weather as Prisma.InputJsonValue) ?? undefined,
        },
      });
      let sort = 0;
      for (const it of day.items ?? []) {
        await tx.itineraryItem.create({
          data: this.itemData(created.id, sort++, it),
        });
      }
      if (index === 0) {
        for (const it of extra) {
          await tx.itineraryItem.create({
            data: {
              planDayId: created.id,
              sortOrder: sort++,
              type: it.type,
              timeSlot: it.timeSlot,
              exactStartTime: it.exactStartTime,
              exactEndTime: it.exactEndTime,
              name: it.name,
              photoUrl: it.photoUrl,
              latitude: it.latitude ?? undefined,
              longitude: it.longitude ?? undefined,
              poiId: it.poiId,
              details: it.details ?? undefined,
            },
          });
        }
      }
    }
  }

  private itemData(
    planDayId: bigint,
    sortOrder: number,
    it: NonNullable<NonNullable<SnapshotPayload['days']>[number]['items']>[number],
  ): Prisma.ItineraryItemUncheckedCreateInput {
    return {
      planDayId,
      sortOrder,
      type: it.type ?? null,
      timeSlot: it.timeSlot ?? null,
      exactStartTime: it.exactStartTime ? new Date(it.exactStartTime) : null,
      exactEndTime: it.exactEndTime ? new Date(it.exactEndTime) : null,
      name: it.name ?? null,
      photoUrl: it.photoUrl ?? null,
      latitude: it.latitude ?? null,
      longitude: it.longitude ?? null,
      poiId: it.poiId != null ? BigInt(it.poiId) : null,
      details: (it.details as Prisma.InputJsonValue) ?? undefined,
    };
  }
}

type SnapshotPayload = {
  days?: Array<{
    dayNumber?: number | null;
    date?: string | null;
    weather?: unknown;
    items?: Array<{
      type?: string | null;
      timeSlot?: number | null;
      exactStartTime?: string | null;
      exactEndTime?: string | null;
      name?: string | null;
      photoUrl?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      poiId?: number | null;
      details?: unknown;
    }>;
  }>;
};
