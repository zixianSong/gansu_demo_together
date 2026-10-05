/** 行程管理测试数据。依赖发现种子返回的景点，合入时接在对方景点写入之后调用。 */
import { PrismaClient } from '@prisma/client';
import type { seedDiscovery } from './discovery';

type DiscoverySeed = Awaited<ReturnType<typeof seedDiscovery>>;

const USER_ID = 1n;

export async function clearTripManage(prisma: PrismaClient) {
  await prisma.plan.deleteMany();
}

/** 行程管理：用户 1 的当前方案与草稿方案。景点记录由 discovery 种子提供。 */
export async function seedTripManage(prisma: PrismaClient, discovery: DiscoverySeed) {
  const { planMogao, crescent, jiayuguan, labrang } = discovery.pois;

  const current = await prisma.plan.create({
    data: {
      userId: USER_ID,
      name: '河西走廊丝路文化深度游',
      attractionSummary: '敦煌 · 嘉峪关 · 7月丝路节点',
      planStatus: 'current',
      startDate: new Date('2026-09-22T00:00:00.000Z'),
      endDate: new Date('2026-09-23T00:00:00.000Z'),
      cities: ['敦煌', '嘉峪关'],
      days: {
        create: [
          {
            dayNumber: 1,
            date: new Date('2026-09-22'),
            weather: { text: '晴', temp: 24 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '景点',
                  timeSlot: 0,
                  exactStartTime: new Date('2026-09-22T02:00:00.000Z'),
                  exactEndTime: new Date('2026-09-22T05:00:00.000Z'),
                  name: '莫高窟',
                  latitude: 40.0372,
                  longitude: 94.8097,
                  poiId: planMogao.id,
                },
                {
                  sortOrder: 1,
                  type: '景点',
                  timeSlot: 2,
                  exactStartTime: new Date('2026-09-22T07:00:00.000Z'),
                  exactEndTime: new Date('2026-09-22T10:00:00.000Z'),
                  name: '鸣沙山月牙泉',
                  latitude: 40.0926,
                  longitude: 94.6697,
                  poiId: crescent.id,
                },
                {
                  sortOrder: 2,
                  type: '住宿',
                  timeSlot: 3,
                  exactStartTime: new Date('2026-09-22T14:00:00.000Z'),
                  name: '敦煌市区住宿',
                  latitude: 40.1421,
                  longitude: 94.6623,
                },
              ],
            },
          },
          {
            dayNumber: 2,
            date: new Date('2026-09-23'),
            weather: { text: '多云', temp: 21 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '交通',
                  timeSlot: 0,
                  exactStartTime: new Date('2026-09-23T01:00:00.000Z'),
                  name: '敦煌前往嘉峪关',
                  latitude: 39.8035,
                  longitude: 98.2203,
                },
                {
                  sortOrder: 1,
                  type: '景点',
                  timeSlot: 2,
                  exactStartTime: new Date('2026-09-23T04:00:00.000Z'),
                  exactEndTime: new Date('2026-09-23T08:00:00.000Z'),
                  name: '嘉峪关关城',
                  latitude: 39.8035,
                  longitude: 98.2203,
                  poiId: jiayuguan.id,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const draft = await prisma.plan.create({
    data: {
      userId: USER_ID,
      name: '甘南藏区草原风情之旅',
      attractionSummary: '夏河 · 拉卜楞寺 · 含莫高窟重叠点',
      planStatus: 'draft',
      startDate: new Date('2026-10-05T00:00:00.000Z'),
      endDate: new Date('2026-10-06T00:00:00.000Z'),
      cities: ['夏河', '敦煌'],
      days: {
        create: [
          {
            dayNumber: 1,
            date: new Date('2026-10-05'),
            weather: { text: '小雨', temp: 12 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '景点',
                  timeSlot: 0,
                  exactStartTime: new Date('2026-10-05T02:30:00.000Z'),
                  name: '拉卜楞寺',
                  latitude: 35.1994,
                  longitude: 102.5078,
                  poiId: labrang.id,
                },
                {
                  sortOrder: 1,
                  type: '住宿',
                  timeSlot: 3,
                  name: '夏河县城住宿',
                  latitude: 35.2022,
                  longitude: 102.5217,
                },
              ],
            },
          },
          {
            dayNumber: 2,
            date: new Date('2026-10-06'),
            weather: { text: '晴', temp: 16 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '景点',
                  timeSlot: 2,
                  exactStartTime: new Date('2026-10-06T03:00:00.000Z'),
                  name: '莫高窟',
                  latitude: 40.0372,
                  longitude: 94.8097,
                  poiId: planMogao.id,
                },
              ],
            },
          },
        ],
      },
    },
  });

  return {
    currentId: Number(current.id),
    draftId: Number(draft.id),
    userId: 1,
  };
}
