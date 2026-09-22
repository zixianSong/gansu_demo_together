const DEFAULT_AVATAR =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const COVER = {
  danxia: 'https://ai-public.mastergo.com/ai/img_res/generated-7710530c-807c-4cad-b38c-4f2c4f4b2f62.jpg',
  mogao: 'https://ai-public.mastergo.com/ai/img_res/generated-45137555-7c78-4a37-b699-0b3c0bdb4637.jpg',
  yueya: 'https://ai-public.mastergo.com/ai/img_res/generated-e1fb356b-9633-462b-a4ad-5a98433c5dd1.jpg',
  jiayuguan: 'https://ai-public.mastergo.com/ai/img_res/generated-a1481a5a-fcea-4f71-a3ef-f799448c7829.jpg',
  labrang: 'https://ai-public.mastergo.com/ai/img_res/generated-620de4de-ee8f-4443-a7de-4cf4b2ff3f7e.jpg',
  maiji: 'https://ai-public.mastergo.com/ai/img_res/generated-44adfb3e-0e39-43ec-aa41-6446ebf10375.jpg',
  route: 'https://ai-public.mastergo.com/ai/img_res/generated-78430dc0-4be6-4c97-92fb-48c9a88e13b2.jpg',
  guide: 'https://ai-public.mastergo.com/ai/img_res/generated-984e2eb9-2c91-4d43-b74e-94affb9f2e28.jpg',
  food: 'https://ai-public.mastergo.com/ai/img_res/generated-ee55c94f-62d8-4984-b4a2-37a8c5fc628c.jpg',
  avatar: 'https://ai-public.mastergo.com/ai/img_res/generated-f8769461-74f6-4081-b04d-a498d08be00a.jpg',
}

const ORDERS = [
  {
    id: '1',
    status: 'unpaid',
    statusText: '待支付',
    category: '门票',
    title: '莫高窟旺季正常参观门票A票',
    validDate: '2026-08-05',
    count: '2张',
    usage: '凭身份证原件入园',
    price: 476,
    payHint: '在线支付',
    travelerName: '李*',
    idType: '身份证',
    idNo: '620***********1234',
    phone: '138****8888',
    orderNo: 'ORD20260805001',
  },
  {
    id: '2',
    status: 'togo',
    statusText: '待出行',
    category: '门票',
    title: '张掖七彩丹霞深度游门票+观光车',
    validDate: '2026-08-08',
    count: '1张',
    usage: '刷二维码入园',
    price: 168,
    payHint: '已付款',
    travelerName: '李*',
    idType: '身份证',
    idNo: '620***********1234',
    phone: '138****8888',
    orderNo: 'ORD20260808001',
  },
  {
    id: '3',
    status: 'review',
    statusText: '待评价',
    category: '门票',
    title: '嘉峪关关城门票',
    validDate: '2026-07-28',
    count: '2张',
    usage: '身份证换票入园',
    price: 220,
    payHint: '已核销',
    travelerName: '李*',
    idType: '身份证',
    idNo: '620***********1234',
    phone: '138****8888',
    orderNo: 'ORD20260728001',
  },
  {
    id: '4',
    status: 'refund',
    statusText: '退款/售后',
    category: '门票',
    title: '鸣沙山月牙泉门票',
    validDate: '2026-07-20',
    count: '1张',
    usage: '凭二维码入园',
    price: 110,
    payHint: '退款中',
    travelerName: '王*',
    idType: '身份证',
    idNo: '620***********5678',
    phone: '139****6666',
    orderNo: 'ORD20260720001',
  },
  {
    id: '5',
    status: 'unpaid',
    statusText: '待支付',
    category: '门票',
    title: '天水麦积山石窟门票',
    validDate: '2026-08-12',
    count: '1张',
    usage: '凭身份证入园',
    price: 88,
    payHint: '在线支付',
    travelerName: '李*',
    idType: '身份证',
    idNo: '620***********1234',
    phone: '138****8888',
    orderNo: 'ORD20260812001',
  },
]

const FAVORITE_SPOTS = [
  { title: '张掖七彩丹霞旅游景区', price: '74', date: '2026-07-15', cover: COVER.danxia },
  { title: '敦煌莫高窟', price: '238', date: '2026-07-12', cover: COVER.mogao },
]

const FAVORITE_ROUTES = [
  { title: '河西走廊·丝路经典6日环线', desc: '6天5晚 · 兰州出发', price: '2680', cover: COVER.route },
  { title: '甘南秘境·草原藏寨4日游', desc: '4天3晚 · 兰州出发', price: '1680', cover: COVER.route },
]

const FAVORITE_GUIDES = [
  {
    title: '2026甘肃夏季旅游最全攻略：从河西走廊到甘南草原',
    author: '甘肃小玩家',
    date: '2026-06-28',
    reads: '阅读 1.2w',
    likes: '点赞 892',
    cover: COVER.guide,
  },
  {
    title: '莫高窟门票预约避坑指南',
    author: '敦煌通',
    date: '2026-06-20',
    reads: '阅读 8.5k',
    likes: '点赞 456',
    cover: COVER.guide,
  },
]

const FAVORITE_FOODS = [
  { title: '马子禄牛肉面（大众巷店）', rating: '4.8', avg: '人均 ¥18', address: '兰州市城关区', cover: COVER.food },
  { title: '达记酱驴肉黄面馆', rating: '4.6', avg: '人均 ¥65', address: '敦煌市沙州镇', cover: COVER.food },
]

const FOOTPRINT_GROUPS = [
  {
    date: '2026年8月1日',
    items: [
      {
        time: '09:30',
        title: '莫高窟',
        tags: ['世界文化遗产', '佛教艺术'],
        address: '甘肃省酒泉市敦煌市莫高镇',
        cover: COVER.mogao,
      },
      {
        time: '14:20',
        title: '鸣沙山月牙泉',
        tags: ['沙漠奇观', '5A景区'],
        address: '甘肃省酒泉市敦煌市鸣山路',
        cover: COVER.yueya,
      },
    ],
  },
  {
    date: '2026年7月28日',
    items: [
      {
        time: '10:15',
        title: '嘉峪关关城',
        tags: ['天下第一雄关', '明代长城'],
        address: '甘肃省嘉峪关市峪泉镇',
        cover: COVER.jiayuguan,
      },
    ],
  },
  {
    date: '2026年7月25日',
    items: [
      {
        time: '08:40',
        title: '张掖七彩丹霞',
        tags: ['丹霞地貌', '地质公园'],
        address: '甘肃省张掖市临泽县倪家营镇',
        cover: COVER.danxia,
      },
      {
        time: '16:00',
        title: '拉卜楞寺',
        tags: ['藏传佛教', '格鲁派寺院'],
        address: '甘肃省甘南藏族自治州夏河县',
        cover: COVER.labrang,
      },
    ],
  },
  {
    date: '2026年7月20日',
    items: [
      {
        time: '11:10',
        title: '麦积山石窟',
        tags: ['东方雕塑馆', '四大石窟'],
        address: '甘肃省天水市麦积区麦积镇',
        cover: COVER.maiji,
      },
    ],
  },
]

const PENDING_REVIEWS = [
  {
    id: '3',
    title: '嘉峪关关城门票',
    validDate: '2026-07-20',
    count: '2张',
    usage: '刷身份证入园',
    price: 110,
    place: '嘉峪关关城',
    address: '甘肃省嘉峪关市峪泉镇关城南路421号',
  },
  {
    id: '6',
    title: '敦煌莫高窟旺季正常参观门票A票',
    validDate: '2026-07-18',
    count: '1张',
    usage: '刷二维码入园',
    price: 238,
    place: '敦煌莫高窟',
    address: '甘肃省酒泉市敦煌市莫高镇',
  },
]

const POSTED_REVIEWS = [
  {
    score: '5.0',
    date: '2026-07-22',
    content: '七彩丹霞真的名不虚传，日出时分色彩层次特别丰富，观光车安排也很合理，推荐大家一定要看日出！',
    place: '张掖七彩丹霞旅游景区',
    anonymous: true,
  },
  {
    score: '4.0',
    date: '2026-07-15',
    content: '鸣沙山月牙泉风景很震撼，骑骆驼体验也不错，就是夏天太阳太晒了，建议早上去。',
    place: '鸣沙山月牙泉',
    anonymous: true,
  },
]

const DEFAULT_TRAVELERS = [
  { id: '1', name: '李晓雅', idNo: '身份证 110101********1234', phone: '+86 138****8888' },
  { id: '2', name: '王建国', idNo: '身份证 620102********5678', phone: '+86 139****6666' },
]

const getOrderById = (id) => ORDERS.find((item) => item.id === id) || ORDERS[1]

module.exports = {
  DEFAULT_AVATAR,
  COVER,
  ORDERS,
  FAVORITE_SPOTS,
  FAVORITE_ROUTES,
  FAVORITE_GUIDES,
  FAVORITE_FOODS,
  FOOTPRINT_GROUPS,
  PENDING_REVIEWS,
  POSTED_REVIEWS,
  DEFAULT_TRAVELERS,
  getOrderById,
}
