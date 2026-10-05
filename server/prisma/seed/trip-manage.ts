/** 行程管理测试数据。景点使用首页种子已创建的 poi。 */
import { PrismaClient } from '@prisma/client';

const USER_ID = 1n;

type PoiRef = { id: bigint };

export type HomePois = {
  mogao: PoiRef;
  museum: PoiRef;
  noodle: PoiRef;
};

export async function clearTripManage(prisma: PrismaClient) {
  await prisma.plan.deleteMany();
}

/** 用户 1：当前方案走敦煌与兰州，草稿方案复用莫高窟，便于切换时看到重叠点。 */
export async function seedTripManage(prisma: PrismaClient, pois: HomePois) {
  const { mogao, museum, noodle } = pois;

  const current = await prisma.plan.create({
    data: {
      userId: USER_ID,
      name: '丝路两日：敦煌与兰州',
      attractionSummary: '敦煌莫高窟 · 甘肃省博物馆 · 兰州牛肉面',
      planStatus: 'current',
      startDate: new Date('2026-10-05T00:00:00.000Z'),
      endDate: new Date('2026-10-06T00:00:00.000Z'),
      cities: ['敦煌', '兰州'],
      days: {
        create: [
          {
            dayNumber: 1,
            date: new Date('2026-10-05'),
            weather: { text: '晴', temp: 24 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '景点',
                  timeSlot: 0,
                  exactStartTime: new Date('2026-10-05T02:00:00.000Z'),
                  exactEndTime: new Date('2026-10-05T05:00:00.000Z'),
                  name: '敦煌莫高窟',
                  latitude: 40.0372,
                  longitude: 94.8097,
                  poiId: mogao.id,
                },
                {
                  sortOrder: 1,
                  type: '住宿',
                  timeSlot: 3,
                  exactStartTime: new Date('2026-10-05T14:00:00.000Z'),
                  name: '敦煌市区住宿',
                  latitude: 40.1421,
                  longitude: 94.6623,
                },
              ],
            },
          },
          {
            dayNumber: 2,
            date: new Date('2026-10-06'),
            weather: { text: '多云', temp: 21 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '交通',
                  timeSlot: 0,
                  exactStartTime: new Date('2026-10-06T01:00:00.000Z'),
                  name: '敦煌前往兰州',
                  latitude: 36.0611,
                  longitude: 103.8343,
                },
                {
                  sortOrder: 1,
                  type: '景点',
                  timeSlot: 1,
                  exactStartTime: new Date('2026-10-06T04:00:00.000Z'),
                  exactEndTime: new Date('2026-10-06T07:00:00.000Z'),
                  name: '甘肃省博物馆',
                  latitude: 36.0686,
                  longitude: 103.7686,
                  poiId: museum.id,
                },
                {
                  sortOrder: 2,
                  type: '美食',
                  timeSlot: 2,
                  exactStartTime: new Date('2026-10-06T08:00:00.000Z'),
                  exactEndTime: new Date('2026-10-06T09:00:00.000Z'),
                  name: '兰州牛肉面',
                  latitude: 36.0617,
                  longitude: 103.8318,
                  poiId: noodle.id,
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
      name: '兰州城市半日',
      attractionSummary: '甘肃省博物馆 · 兰州牛肉面',
      planStatus: 'draft',
      startDate: new Date('2026-10-12T00:00:00.000Z'),
      endDate: new Date('2026-10-12T00:00:00.000Z'),
      cities: ['兰州'],
      days: {
        create: [
          {
            dayNumber: 1,
            date: new Date('2026-10-12'),
            weather: { text: '晴', temp: 18 },
            items: {
              create: [
                {
                  sortOrder: 0,
                  type: '景点',
                  timeSlot: 0,
                  exactStartTime: new Date('2026-10-12T02:00:00.000Z'),
                  exactEndTime: new Date('2026-10-12T05:00:00.000Z'),
                  name: '甘肃省博物馆',
                  latitude: 36.0686,
                  longitude: 103.7686,
                  poiId: museum.id,
                },
                {
                  sortOrder: 1,
                  type: '美食',
                  timeSlot: 1,
                  exactStartTime: new Date('2026-10-12T06:00:00.000Z'),
                  name: '兰州牛肉面',
                  latitude: 36.0617,
                  longitude: 103.8318,
                  poiId: noodle.id,
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
