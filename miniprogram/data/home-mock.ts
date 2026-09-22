import type { BannerItem, FeedItem } from '../api/modules/content'

const mogao = 'https://ai-public.mastergo.com/ai/img_res/generated-45137555-7c78-4a37-b699-0b3c0bdb4637.jpg'
const danxia = 'https://ai-public.mastergo.com/ai/img_res/generated-7710530c-807c-4cad-b38c-4f2c4f4b2f62.jpg'
const yueya = 'https://ai-public.mastergo.com/ai/img_res/generated-e1fb356b-9633-462b-a4ad-5a98433c5dd1.jpg'
const jiayuguan = 'https://ai-public.mastergo.com/ai/img_res/generated-a1481a5a-fcea-4f71-a3ef-f799448c7829.jpg'
const route = 'https://ai-public.mastergo.com/ai/img_res/generated-78430dc0-4be6-4c97-92fb-48c9a88e13b2.jpg'

export const MOCK_BANNERS: BannerItem[] = [
  { id: 1, title: '敦煌莫高窟', imageUrl: mogao, linkType: 'poi', linkId: null, linkPath: null, sortOrder: 1 },
  { id: 2, title: '张掖七彩丹霞', imageUrl: danxia, linkType: 'poi', linkId: null, linkPath: null, sortOrder: 2 },
]

export const MOCK_FEED: FeedItem[] = [
  { id: 1, title: '莫高窟门票预约避坑指南', coverUrl: mogao, contentType: 'guide', author: '敦煌通', publishedAt: '2026-06-20', tags: ['敦煌', '预约'] },
  { id: 2, title: '河西走廊6日环线怎么玩', coverUrl: danxia, contentType: 'guide', author: '甘肃小玩家', publishedAt: '2026-06-28', tags: ['线路'] },
  { id: 3, title: '鸣沙山月牙泉日出攻略', coverUrl: yueya, contentType: 'guide', author: '沙州行', publishedAt: '2026-07-02', tags: ['敦煌'] },
  { id: 4, title: '嘉峪关关城半日游', coverUrl: jiayuguan, contentType: 'guide', author: '关城记', publishedAt: '2026-07-08', tags: ['嘉峪关'] },
]

export const MOCK_DESTINATIONS = [
  { name: '敦煌', cover: mogao },
  { name: '张掖', cover: danxia },
  { name: '嘉峪关', cover: jiayuguan },
  { name: '兰州', cover: route },
]

export const MOCK_ROUTES = [
  { name: '河西走廊·丝路经典', cover: route },
  { name: '甘南秘境·草原藏寨', cover: danxia },
]
