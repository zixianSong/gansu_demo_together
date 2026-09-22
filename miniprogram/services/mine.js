const { BASE_URL, ENABLE_REMOTE_API, MINE_USE_MOCK, MINE_AUTH_REMOTE, MINE_ORDERS_REMOTE, MINE_REVIEWS_REMOTE, MINE_TRAVELERS_REMOTE, MINE_EXPLORE_REMOTE, MINE_LEGAL_REMOTE } = require('../api/config')

function request(options) {
  const { url, method = 'GET', data, auth = true } = options
  const token = wx.getStorageSync('accessToken') || ''
  const header = { 'Content-Type': 'application/json' }
  if (auth && token) header.Authorization = `Bearer ${token}`
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success: (res) => {
        const body = res.data || {}
        if (res.statusCode === 401 || body.code === 401) {
          wx.removeStorageSync('accessToken')
          wx.removeStorageSync('userProfile')
          reject(new Error(body.message || '未登录或登录已过期'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data)
          return
        }
        reject(new Error(body.message || `请求失败(${res.statusCode})`))
      },
      fail: (err) => reject(new Error((err && err.errMsg) || '网络错误')),
    })
  })
}

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

const DEFAULT_AVATAR =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const ACTION_LABEL = {
  cancel: '取消',
  rebook: '再次预定',
  pay: '去支付',
  voucher: '使用凭证',
  review: '点评',
  delete: '删除订单',
}

const PRIMARY_ACTIONS = { pay: 1, voucher: 1, review: 1 }

const GENDER_TEXT = { 0: '保密', 1: '男', 2: '女' }
const GENDER_VALUE = { 保密: 0, 男: 1, 女: 2 }

const STORE_USER = 'userProfile'
const STORE_TOKEN = 'accessToken'
const STORE_HIDDEN = 'mineHiddenOrderIds'
const STORE_TRAVELERS = 'mineTravelers'
const STORE_REVIEWS = 'mineReviewState'
const STORE_FOOTPRINTS = 'mineFootprintsExtra'

function toast(title) {
  wx.showToast({ title, icon: 'none' })
}

function readJson(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined ? fallback : value
  } catch (e) {
    return fallback
  }
}

function writeJson(key, value) {
  wx.setStorageSync(key, value)
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

const SEED_USER = {
  userId: 1001,
  nickname: '环甘肃小玩家',
  avatarUrl: COVER.avatar,
  phone: '138****8888',
  email: 't***@example.com',
  gender: 2,
  birthday: '1998-06-15',
  signature: '一程山水一程歌，用脚步丈量甘肃的辽阔。',
  account: 'wx_1001',
  memberLevel: '普通会员',
}

const SEED_ORDERS = [
  {
    orderId: 10001,
    orderNo: 'ORD20260805001',
    productType: 1,
    categoryLabel: '门票',
    productId: 88,
    title: '莫高窟旺季正常参观门票A票',
    status: 1,
    statusText: '待支付',
    validDate: '2026-08-05',
    quantity: 2,
    quantityText: '2张',
    usage: '凭身份证原件入园',
    payAmount: 476,
    payHint: '在线支付',
    actions: ['cancel', 'rebook', 'pay'],
    refundStatus: 0,
    travelers: [{ name: '李*', idType: 1, idTypeText: '身份证', idNumber: '620***********1234', phone: '138****8888' }],
    vouchers: [],
    voucherSummary: { usedCount: 0, totalCount: 0 },
    feeDetail: { totalAmount: 476, discountAmount: 0, payAmount: 476 },
    snapshotNote: '作为本订单交易凭证，与订单具有同等效力',
    refundRule: '未使用可随时退，部分使用不可退',
    statusHint: '请尽快完成支付',
  },
  {
    orderId: 10002,
    orderNo: 'ORD20260808001',
    productType: 1,
    categoryLabel: '门票',
    productId: 90,
    title: '张掖七彩丹霞深度游门票+观光车',
    status: 2,
    statusText: '待出行',
    validDate: '2026-08-08',
    quantity: 1,
    quantityText: '1张',
    usage: '刷二维码入园',
    payAmount: 168,
    payHint: '已付款',
    actions: ['cancel', 'rebook', 'voucher'],
    refundStatus: 0,
    travelers: [{ name: '李*', idType: 1, idTypeText: '身份证', idNumber: '620***********1234', phone: '138****8888' }],
    vouchers: [{ voucherId: 501, source: 'ticket', qrcodeData: 'TV501VERIFY', qrcodeImage: '', status: 1, statusText: '待使用' }],
    voucherSummary: { usedCount: 0, totalCount: 1 },
    feeDetail: { totalAmount: 168, discountAmount: 0, payAmount: 168 },
    snapshotNote: '作为本订单交易凭证，与订单具有同等效力',
    refundRule: '未使用可随时退，部分使用不可退',
    statusHint: '订单已确认，请按时出行',
  },
  {
    orderId: 10003,
    orderNo: 'ORD20260728001',
    productType: 1,
    categoryLabel: '门票',
    productId: 91,
    title: '嘉峪关关城门票',
    status: 4,
    statusText: '待评价',
    validDate: '2026-07-20',
    quantity: 2,
    quantityText: '2张',
    usage: '刷身份证入园',
    payAmount: 110,
    payHint: '已核销',
    actions: ['review', 'rebook', 'voucher'],
    refundStatus: 0,
    placeName: '嘉峪关关城',
    placeAddress: '甘肃省嘉峪关市峪泉镇关城南路421号',
    travelers: [{ name: '李*', idType: 1, idTypeText: '身份证', idNumber: '620***********1234', phone: '138****8888' }],
    vouchers: [{ voucherId: 502, source: 'ticket', qrcodeData: 'USED', qrcodeImage: '', status: 2, statusText: '已使用' }],
    voucherSummary: { usedCount: 1, totalCount: 1 },
    feeDetail: { totalAmount: 110, discountAmount: 0, payAmount: 110 },
    snapshotNote: '作为本订单交易凭证，与订单具有同等效力',
    refundRule: '未使用可随时退，部分使用不可退',
    statusHint: '行程已结束，欢迎点评',
  },
  {
    orderId: 10004,
    orderNo: 'ORD20260720001',
    productType: 1,
    categoryLabel: '门票',
    productId: 92,
    title: '鸣沙山月牙泉门票',
    status: 6,
    statusText: '退款/售后',
    validDate: '2026-07-20',
    quantity: 1,
    quantityText: '1张',
    usage: '凭二维码入园',
    payAmount: 110,
    payHint: '退款中',
    actions: ['delete', 'rebook'],
    refundStatus: 1,
    travelers: [{ name: '王*', idType: 1, idTypeText: '身份证', idNumber: '620***********5678', phone: '139****6666' }],
    vouchers: [],
    voucherSummary: { usedCount: 0, totalCount: 1 },
    feeDetail: { totalAmount: 110, discountAmount: 0, payAmount: 110 },
    snapshotNote: '作为本订单交易凭证，与订单具有同等效力',
    refundRule: '未使用可随时退，部分使用不可退',
    statusHint: '退款处理中，请耐心等待',
  },
  {
    orderId: 10005,
    orderNo: 'ORD20260812001',
    productType: 1,
    categoryLabel: '门票',
    productId: 93,
    title: '天水麦积山石窟门票',
    status: 1,
    statusText: '待支付',
    validDate: '2026-08-12',
    quantity: 1,
    quantityText: '1张',
    usage: '凭身份证入园',
    payAmount: 88,
    payHint: '在线支付',
    actions: ['cancel', 'rebook', 'pay'],
    refundStatus: 0,
    travelers: [{ name: '李*', idType: 1, idTypeText: '身份证', idNumber: '620***********1234', phone: '138****8888' }],
    vouchers: [],
    voucherSummary: { usedCount: 0, totalCount: 0 },
    feeDetail: { totalAmount: 88, discountAmount: 0, payAmount: 88 },
    snapshotNote: '作为本订单交易凭证，与订单具有同等效力',
    refundRule: '未使用可随时退，部分使用不可退',
    statusHint: '请尽快完成支付',
  },
]

const SEED_PENDING = [
  {
    orderId: 10003,
    productType: 1,
    categoryLabel: '门票',
    title: '嘉峪关关城门票',
    validDate: '2026-07-20',
    quantity: 2,
    quantityText: '2张',
    usage: '刷身份证入园',
    payAmount: 110,
    payHint: '已核销',
    placeName: '嘉峪关关城',
    placeAddress: '甘肃省嘉峪关市峪泉镇关城南路421号',
    actions: ['review', 'rebook', 'voucher'],
  },
  {
    orderId: 10006,
    productType: 1,
    categoryLabel: '门票',
    title: '敦煌莫高窟旺季正常参观门票A票',
    validDate: '2026-07-18',
    quantity: 1,
    quantityText: '1张',
    usage: '刷二维码入园',
    payAmount: 238,
    payHint: '已核销',
    placeName: '敦煌莫高窟',
    placeAddress: '甘肃省酒泉市敦煌市莫高镇',
    actions: ['review', 'rebook', 'voucher'],
  },
]

const SEED_POSTED = [
  {
    reviewId: 201,
    orderId: 10010,
    rating: 5,
    ratingLabel: '非常满意',
    content: '七彩丹霞真的名不虚传，日出时分色彩层次特别丰富，观光车安排也很合理，推荐大家一定要看日出！',
    images: [],
    isAnonymous: true,
    reviewTime: '2026-07-22T18:00:00+08:00',
    placeName: '张掖七彩丹霞旅游景区',
    categoryLabel: '门票',
  },
  {
    reviewId: 202,
    orderId: 10011,
    rating: 4,
    ratingLabel: '满意',
    content: '鸣沙山月牙泉风景很震撼，骑骆驼体验也不错，就是夏天太阳太晒了，建议早上去。',
    images: [],
    isAnonymous: true,
    reviewTime: '2026-07-15T10:00:00+08:00',
    placeName: '鸣沙山月牙泉',
    categoryLabel: '门票',
  },
]

const SEED_TRAVELERS = [
  {
    travelerId: 1,
    name: '李晓雅',
    idType: 1,
    idTypeText: '身份证',
    idNumber: '110101********1234',
    idNumberPlain: '110101199001011234',
    phone: '138****8888',
    phonePlain: '13800008888',
    phoneAreaCode: '+86',
    isDefault: true,
  },
  {
    travelerId: 2,
    name: '王建国',
    idType: 1,
    idTypeText: '身份证',
    idNumber: '620102********5678',
    idNumberPlain: '620102198802025678',
    phone: '139****6666',
    phonePlain: '13900006666',
    phoneAreaCode: '+86',
    isDefault: false,
  },
]

const SEED_FAVORITES = {
  spot: [
    { favoriteId: 11, tab: 'spot', targetType: 1, targetId: 101, title: '张掖七彩丹霞旅游景区', coverUrl: COVER.danxia, price: 74, collectedAt: '2026-07-15T10:00:00+08:00', path: '/pages/poi/detail?id=101' },
    { favoriteId: 12, tab: 'spot', targetType: 1, targetId: 12, title: '敦煌莫高窟', coverUrl: COVER.mogao, price: 238, collectedAt: '2026-07-12T10:00:00+08:00', path: '/pages/poi/detail?id=12' },
  ],
  route: [
    { favoriteId: 21, tab: 'route', targetType: 2, targetId: 1, title: '河西走廊·丝路经典6日环线', coverUrl: COVER.route, price: 2680, subtitle: '6天5晚 · 兰州出发', collectedAt: '2026-07-01T10:00:00+08:00', path: '' },
    { favoriteId: 22, tab: 'route', targetType: 2, targetId: 2, title: '甘南秘境·草原藏寨4日游', coverUrl: COVER.route, price: 1680, subtitle: '4天3晚 · 兰州出发', collectedAt: '2026-06-20T10:00:00+08:00', path: '' },
  ],
  guide: [
    { favoriteId: 31, tab: 'guide', targetType: 3, targetId: 1, title: '2026甘肃夏季旅游最全攻略：从河西走廊到甘南草原', coverUrl: COVER.guide, author: '甘肃小玩家', publishTime: '2026-06-28', readCount: '1.2w', likeCount: 892, path: '/pages/article/detail?id=1' },
    { favoriteId: 32, tab: 'guide', targetType: 3, targetId: 2, title: '莫高窟门票预约避坑指南', coverUrl: COVER.guide, author: '敦煌通', publishTime: '2026-06-20', readCount: '8.5k', likeCount: 456, path: '/pages/article/detail?id=2' },
  ],
  food: [
    { favoriteId: 41, tab: 'food', targetType: 1, targetId: 201, title: '马子禄牛肉面（大众巷店）', coverUrl: COVER.food, rating: 4.8, avgCost: 18, address: '兰州市城关区', path: '/pages/poi/detail?id=201' },
    { favoriteId: 42, tab: 'food', targetType: 1, targetId: 202, title: '达记酱驴肉黄面馆', coverUrl: COVER.food, rating: 4.6, avgCost: 65, address: '敦煌市沙州镇', path: '/pages/poi/detail?id=202' },
  ],
}

const SEED_FOOTPRINTS = [
  { footprintId: 1, visitDate: '2026-08-01', visitTime: '09:30:00', type: 1, title: '莫高窟', coverUrl: COVER.mogao, tags: ['世界文化遗产', '佛教艺术'], address: '甘肃省酒泉市敦煌市莫高镇', cityName: '敦煌市', poiId: 12 },
  { footprintId: 2, visitDate: '2026-08-01', visitTime: '14:20:00', type: 1, title: '鸣沙山月牙泉', coverUrl: COVER.yueya, tags: ['沙漠奇观', '5A景区'], address: '甘肃省酒泉市敦煌市鸣山路', cityName: '敦煌市', poiId: 13 },
  { footprintId: 3, visitDate: '2026-07-28', visitTime: '10:15:00', type: 1, title: '嘉峪关关城', coverUrl: COVER.jiayuguan, tags: ['天下第一雄关', '明代长城'], address: '甘肃省嘉峪关市峪泉镇', cityName: '嘉峪关市', poiId: 14 },
  { footprintId: 4, visitDate: '2026-07-25', visitTime: '08:40:00', type: 1, title: '张掖七彩丹霞', coverUrl: COVER.danxia, tags: ['丹霞地貌', '地质公园'], address: '甘肃省张掖市临泽县倪家营镇', cityName: '张掖市', poiId: 101 },
  { footprintId: 5, visitDate: '2026-07-25', visitTime: '16:00:00', type: 1, title: '拉卜楞寺', coverUrl: COVER.labrang, tags: ['藏传佛教', '格鲁派寺院'], address: '甘肃省甘南藏族自治州夏河县', cityName: '夏河县', poiId: 15 },
  { footprintId: 6, visitDate: '2026-07-20', visitTime: '11:10:00', type: 1, title: '麦积山石窟', coverUrl: COVER.maiji, tags: ['东方雕塑馆', '四大石窟'], address: '甘肃省天水市麦积区麦积镇', cityName: '天水市', poiId: 16 },
]

const LEGAL_BRIEF = {
  title: '隐私政策简要版',
  subtitle: '清晰告知提供服务所需收集信息及收集方式',
  collectScenes: [
    { key: 'account', title: '账号注册、登录', desc: '收集证件类型、证件号、姓名、手机号' },
    { key: 'consult', title: '投诉、申诉、咨询', desc: '收集账号、照片、相册中的图片/视频、沟通记录' },
    { key: 'location', title: '定位相关功能', desc: '收集位置信息' },
    { key: 'call', title: '拨打联系人电话', desc: '收集设备通话状态' },
  ],
  permissionScenes: [
    { key: 'location', title: '位置', desc: '用于便捷切换所在城市、按距离排序产品、推荐周边产品、天气查询' },
    { key: 'microphone', title: '麦克风', desc: '用于音视频通话、语音搜索、与智能助手对话' },
    { key: 'camera', title: '相机', desc: '用于扫码、拍摄' },
    { key: 'album', title: '相册', desc: '用于上传照片、保存照片' },
  ],
}

const CS_CONFIG = {
  phone: '0931-0000000',
  enableWxWork: true,
  hint: '工作日 9:00-18:00',
}

const ABOUT = {
  name: '环甘肃游',
  version: '1.0.0',
  intro: '面向甘肃旅行的小程序，提供发现、订票与行程服务。',
}

function tabOfOrder(order) {
  if (order.status === 6 || (order.refundStatus && order.refundStatus > 0)) return 'refund'
  if (order.status === 1) return 'unpaid'
  if (order.status === 2 || order.status === 3) return 'togo'
  if (order.status === 4) return 'review'
  return 'all'
}

function maskPhone(phone) {
  const raw = String(phone || '')
  if (raw.length < 7) return raw || null
  return `${raw.slice(0, 3)}****${raw.slice(-4)}`
}

function maskId(idNumber) {
  const raw = String(idNumber || '')
  if (raw.length < 8) return raw
  return `${raw.slice(0, 6)}${'*'.repeat(Math.max(8, raw.length - 10))}${raw.slice(-4)}`
}

function publicTraveler(item) {
  return {
    travelerId: item.travelerId,
    name: item.name,
    idType: item.idType,
    idTypeText: item.idTypeText || '身份证',
    idNumber: item.idNumber,
    phone: item.phone || '未填写',
    phoneAreaCode: item.phoneAreaCode || '+86',
    isDefault: !!item.isDefault,
    idNo: `${item.idTypeText || '身份证'} ${item.idNumber}`,
    phoneLine: `${item.phoneAreaCode || '+86'} ${item.phone || '未填写'}`,
  }
}

function actionButtons(actions) {
  return (actions || []).map((key) => ({
    key,
    label: ACTION_LABEL[key] || key,
    primary: !!PRIMARY_ACTIONS[key],
  }))
}

function toOrderCard(order) {
  return {
    id: String(order.orderId),
    orderId: order.orderId,
    orderNo: order.orderNo,
    category: order.categoryLabel,
    title: order.title,
    status: tabOfOrder(order),
    statusCode: order.status,
    statusText: order.statusText,
    validDate: order.validDate,
    count: order.quantityText,
    usage: order.usage,
    price: order.payAmount,
    payHint: order.payHint,
    actions: order.actions || [],
    actionButtons: actionButtons(order.actions),
  }
}

function toPendingCard(item) {
  return {
    id: String(item.orderId),
    orderId: item.orderId,
    title: item.title,
    validDate: item.validDate,
    count: item.quantityText,
    usage: item.usage,
    price: item.payAmount,
    place: item.placeName,
    address: item.placeAddress,
    category: item.categoryLabel,
    actionButtons: actionButtons(item.actions),
  }
}

function toPostedCard(item) {
  return {
    reviewId: item.reviewId,
    score: `${Number(item.rating).toFixed(1)}`,
    date: (item.reviewTime || '').slice(0, 10),
    content: item.content,
    place: item.placeName,
    anonymous: !!item.isAnonymous,
  }
}

function matchTab(order, tab) {
  if (tab === 'all' || !tab) return true
  if (tab === 'unpaid') return order.status === 1
  if (tab === 'togo') return order.status === 2 || order.status === 3
  if (tab === 'review') return order.status === 4
  if (tab === 'refund') return order.status === 6 || (order.refundStatus && order.refundStatus > 0)
  return true
}

function getHiddenIds() {
  const ids = readJson(STORE_HIDDEN, [])
  return Array.isArray(ids) ? ids : []
}

function getReviewState() {
  const state = readJson(STORE_REVIEWS, null)
  if (state && Array.isArray(state.pending) && Array.isArray(state.posted)) return state
  return { pending: clone(SEED_PENDING), posted: clone(SEED_POSTED) }
}

function setReviewState(state) {
  writeJson(STORE_REVIEWS, state)
}

function getTravelersRaw() {
  const list = readJson(STORE_TRAVELERS, null)
  return Array.isArray(list) ? list : clone(SEED_TRAVELERS)
}

function liveOrders() {
  const hidden = getHiddenIds()
  return clone(SEED_ORDERS)
    .map((order) => {
      if (hidden.indexOf(order.orderId) >= 0) {
        return null
      }
      const patched = readJson(`mineOrderPatch_${order.orderId}`, null)
      return patched ? Object.assign(order, patched) : order
    })
    .filter(Boolean)
}

function patchOrder(orderId, patch) {
  const current = liveOrders().find((item) => item.orderId === Number(orderId)) || {}
  writeJson(`mineOrderPatch_${orderId}`, Object.assign({}, current, patch, { orderId: Number(orderId) }))
}

function formatFootprintDate(isoDate) {
  const parts = String(isoDate).split('-')
  if (parts.length !== 3) return isoDate
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`
}

function groupFootprints(list) {
  const map = {}
  list.forEach((item) => {
    const key = item.visitDate
    if (!map[key]) map[key] = { date: formatFootprintDate(key), sort: key, items: [] }
    map[key].items.push({
      time: (item.visitTime || '').slice(0, 5),
      title: item.title,
      tags: item.tags || [],
      address: item.address,
      cover: item.coverUrl,
      poiId: item.poiId,
    })
  })
  return Object.keys(map)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => map[key])
}

function footprintStats(list) {
  const pois = {}
  const cities = {}
  const days = {}
  list.forEach((item) => {
    if (item.poiId) pois[item.poiId] = 1
    if (item.cityName) cities[item.cityName] = 1
    if (item.visitDate) days[item.visitDate] = 1
  })
  return {
    poiCount: Object.keys(pois).length,
    cityCount: Object.keys(cities).length,
    travelDays: Object.keys(days).length,
  }
}

function allFootprints() {
  const extra = readJson(STORE_FOOTPRINTS, [])
  return clone(SEED_FOOTPRINTS).concat(Array.isArray(extra) ? extra : [])
}

async function useRemote(fn, mockFn, mode) {
  const useMock =
    mode === true ? !MINE_AUTH_REMOTE :
    mode === 'orders' ? !MINE_ORDERS_REMOTE :
    mode === 'reviews' ? !MINE_REVIEWS_REMOTE :
    mode === 'travelers' ? !MINE_TRAVELERS_REMOTE :
    mode === 'explore' ? !MINE_EXPLORE_REMOTE :
    mode === 'legal' ? !MINE_LEGAL_REMOTE :
    MINE_USE_MOCK
  if (useMock || !ENABLE_REMOTE_API) return mockFn()
  try {
    return await fn()
  } catch (err) {
    if (err && err.message === 'REMOTE_API_DISABLED') return mockFn()
    throw err
  }
}

function isLoggedIn() {
  const token = readJson(STORE_TOKEN, '')
  if (MINE_AUTH_REMOTE) {
    return !!(token && token !== 'mock-token-1001')
  }
  return !!(token || readJson(STORE_USER, null))
}

function getCachedProfile() {
  return readJson(STORE_USER, null)
}

function saveSession(token, user) {
  if (token) writeJson(STORE_TOKEN, token)
  writeJson(STORE_USER, user)
}

function clearSession() {
  wx.removeStorageSync(STORE_TOKEN)
  wx.removeStorageSync(STORE_USER)
}

function mockLogin(partial) {
  const user = Object.assign({}, SEED_USER, partial || {})
  saveSession('mock-token-1001', user)
  return { accessToken: 'mock-token-1001', expiresIn: 604800, user }
}

async function wechatLogin() {
  return useRemote(
    async () => {
      const login = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        })
      })
      const data = await request({
        url: '/auth/wechat-login',
        method: 'POST',
        auth: false,
        data: { code: login.code },
      })
      saveSession(data.accessToken, data.user)
      return data
    },
    () => Promise.resolve(mockLogin()),
    true,
  )
}

function logout() {
  return useRemote(
    () => request({ url: '/auth/logout', method: 'POST' }).finally(clearSession),
    () => {
      clearSession()
      return Promise.resolve(null)
    },
    true,
  )
}

function requireLogin() {
  if (isLoggedIn()) return Promise.resolve(true)
  return new Promise((resolve) => {
    wx.showModal({
      title: '登录',
      content: '该功能需要登录后使用',
      success: (res) => {
        if (!res.confirm) {
          resolve(false)
          return
        }
        wechatLogin()
          .then(() => resolve(true))
          .catch((err) => {
            toast((err && err.message) || '登录失败')
            resolve(false)
          })
      },
    })
  })
}

function getProfile() {
  return useRemote(
    async () => {
      const user = await request({ url: '/me/profile', method: 'GET' })
      writeJson(STORE_USER, user)
      return user
    },
    () => Promise.resolve(clone(getCachedProfile() || SEED_USER)),
    true,
  )
}

function updateProfile(body) {
  return useRemote(
    async () => {
      const user = await request({ url: '/me/profile', method: 'PUT', data: body })
      writeJson(STORE_USER, user)
      return user
    },
    () => {
      const next = Object.assign({}, getCachedProfile() || SEED_USER, body)
      writeJson(STORE_USER, next)
      return Promise.resolve(next)
    },
    true,
  )
}

function fetchOrders({ tab = 'all', keyword = '', page = 1, pageSize = 10 } = {}) {
  return useRemote(
    () =>
      request({ url: '/me/orders', method: 'GET', data: { tab, keyword, page, pageSize } }).then((res) => ({
        list: ((res && res.list) || []).map(toOrderCard),
        pagination: (res && res.pagination) || { page, pageSize, total: 0 },
      })),
    () => {
      const kw = String(keyword || '').trim()
      const list = liveOrders().filter((item) => {
        const hitTab = matchTab(item, tab)
        const hitKw = !kw || item.title.indexOf(kw) >= 0 || item.orderNo.indexOf(kw) >= 0
        return hitTab && hitKw
      })
      return Promise.resolve({
        list: list.map(toOrderCard),
        pagination: { page, pageSize, total: list.length },
      })
    },
    'orders',
  )
}

function fetchOrderDetail(orderId) {
  return useRemote(
    () => request({ url: `/me/orders/${orderId}`, method: 'GET' }),
    () => {
      const order = liveOrders().find((item) => item.orderId === Number(orderId))
      if (!order) return Promise.reject(new Error('订单不存在'))
      return Promise.resolve(order)
    },
    'orders',
  )
}

function cancelOrder(orderId) {
  return useRemote(
    () => request({ url: `/me/orders/${orderId}/cancel`, method: 'POST' }),
    () => {
      const order = liveOrders().find((item) => item.orderId === Number(orderId))
      if (!order) return Promise.reject(new Error('订单不存在'))
      if (order.status === 3) return Promise.reject(new Error('履约中不可取消'))
      if (order.status === 1) {
        patchOrder(orderId, { status: 7, statusText: '已取消', actions: ['rebook'], payHint: '', statusHint: '订单已取消' })
        return Promise.resolve({ orderId: Number(orderId), status: 7, statusText: '已取消' })
      }
      if (order.status === 2) {
        const used = (order.vouchers || []).some((item) => item.status === 2)
        if (used) return Promise.reject(new Error('已使用不可取消'))
        patchOrder(orderId, {
          status: 6,
          statusText: '退款/售后',
          refundStatus: 1,
          actions: ['delete', 'rebook'],
          payHint: '退款中',
          statusHint: '退款处理中，请耐心等待',
        })
        return Promise.resolve({ orderId: Number(orderId), status: 6, statusText: '退款/售后', refundId: 301, refundStatus: 1 })
      }
      return Promise.reject(new Error('当前状态不可取消'))
    },
    'orders',
  )
}

function deleteOrder(orderId) {
  return useRemote(
    () => request({ url: `/me/orders/${orderId}`, method: 'DELETE' }),
    () => {
      const order = liveOrders().find((item) => item.orderId === Number(orderId))
      if (!order) return Promise.reject(new Error('订单不存在'))
      if (order.status !== 6 && order.status !== 7) return Promise.reject(new Error('当前状态不可删除'))
      writeJson(STORE_HIDDEN, getHiddenIds().concat(Number(orderId)))
      return Promise.resolve(null)
    },
    'orders',
  )
}

function rebookOrder(orderId) {
  return useRemote(
    () => request({ url: `/me/orders/${orderId}/rebook`, method: 'GET' }),
    () => {
      const order = liveOrders().find((item) => item.orderId === Number(orderId)) || {}
      return Promise.resolve({
        enabled: false,
        productType: order.productType || 1,
        productId: order.productId || 0,
        path: `/pages/ticket/detail?productId=${order.productId || 0}`,
        message: '购票功能即将上线',
      })
    },
    'orders',
  )
}

function handleRebook(orderId) {
  return rebookOrder(orderId).then((data) => {
    if (!data.enabled) {
      toast(data.message || '购票功能即将上线')
      return data
    }
    wx.navigateTo({ url: data.path })
    return data
  })
}

function payOrder(orderId) {
  return useRemote(
    () => request({ url: `/me/orders/${orderId}/pay`, method: 'POST' }),
    () => Promise.resolve({ mock: true, message: '演示环境不调起微信支付' }),
  )
}

function uploadReviewMedia(filePath) {
  const token = wx.getStorageSync(STORE_TOKEN) || ''
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/me/media`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        let body = {}
        try {
          body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data || {}
        } catch (err) {
          reject(new Error('上传失败'))
          return
        }
        if (res.statusCode === 401 || body.code === 401) {
          reject(new Error(body.message || '未登录或登录已过期'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data)
          return
        }
        reject(new Error(body.message || '上传失败'))
      },
      fail: (err) => reject(new Error((err && err.errMsg) || '网络错误')),
    })
  })
}

function fetchPendingReviews() {
  return useRemote(
    () =>
      request({ url: '/me/reviews/pending', method: 'GET' }).then((res) => ({
        list: ((res && res.list) || []).map(toPendingCard),
        pagination: (res && res.pagination) || { page: 1, pageSize: 10, total: 0 },
      })),
    () => {
      const list = getReviewState().pending.map(toPendingCard)
      return Promise.resolve({ list, pagination: { page: 1, pageSize: 10, total: list.length } })
    },
    'reviews',
  )
}

function fetchPostedReviews() {
  return useRemote(
    () =>
      request({ url: '/me/reviews/posted', method: 'GET' }).then((res) => ({
        list: ((res && res.list) || []).map(toPostedCard),
        pagination: (res && res.pagination) || { page: 1, pageSize: 10, total: 0 },
      })),
    () => {
      const list = getReviewState().posted.map(toPostedCard)
      return Promise.resolve({ list, pagination: { page: 1, pageSize: 10, total: list.length } })
    },
    'reviews',
  )
}

function submitReview(payload) {
  return useRemote(
    async () => {
      const raw = payload.images || []
      const images = []
      for (let i = 0; i < raw.length; i += 1) {
        const item = raw[i]
        if (item && String(item).indexOf('/uploads/reviews/') >= 0) {
          images.push(item)
        } else if (item) {
          const uploaded = await uploadReviewMedia(item)
          images.push(uploaded.url)
        }
      }
      return request({
        url: '/me/reviews',
        method: 'POST',
        data: {
          orderId: Number(payload.orderId),
          rating: payload.rating,
          ratingLabel: payload.ratingLabel,
          content: payload.content,
          images,
          isAnonymous: payload.isAnonymous !== false,
        },
      })
    },
    () => {
      const state = getReviewState()
      const pending = state.pending.filter((item) => item.orderId !== Number(payload.orderId))
      const source = state.pending.find((item) => item.orderId === Number(payload.orderId))
      const review = {
        reviewId: Date.now(),
        orderId: Number(payload.orderId),
        rating: payload.rating,
        ratingLabel: payload.ratingLabel,
        content: payload.content,
        images: payload.images || [],
        isAnonymous: payload.isAnonymous !== false,
        reviewTime: new Date().toISOString(),
        placeName: (source && source.placeName) || '',
        categoryLabel: '门票',
      }
      setReviewState({ pending, posted: [review].concat(state.posted) })
      patchOrder(payload.orderId, { status: 5, statusText: '已完成', actions: ['rebook'] })
      return Promise.resolve({ reviewId: review.reviewId, orderId: review.orderId })
    },
    'reviews',
  )
}

function toggleReviewAnonymous(reviewId, isAnonymous) {
  return useRemote(
    () => request({ url: `/me/reviews/${reviewId}/anonymous`, method: 'PUT', data: { isAnonymous } }),
    () => {
      const state = getReviewState()
      state.posted = state.posted.map((item) => (item.reviewId === Number(reviewId) ? Object.assign({}, item, { isAnonymous }) : item))
      setReviewState(state)
      return Promise.resolve({ reviewId: Number(reviewId), isAnonymous })
    },
    'reviews',
  )
}

function fetchFavorites(tab = 'spot') {
  return useRemote(
    () =>
      request({ url: '/me/favorites', method: 'GET', data: { tab } }).then((res) => ({
        list: ((res && res.list) || []).map((item) => {
          const next = Object.assign({}, item)
          if (next.collectedAt) next.collectedAt = String(next.collectedAt).slice(0, 10)
          return next
        }),
        pagination: (res && res.pagination) || { page: 1, pageSize: 10, total: 0 },
      })),
    () => {
      const list = clone(SEED_FAVORITES[tab] || []).map((item) => {
        const next = Object.assign({}, item)
        if (next.collectedAt) next.collectedAt = String(next.collectedAt).slice(0, 10)
        return next
      })
      return Promise.resolve({ list, pagination: { page: 1, pageSize: 10, total: list.length } })
    },
    'explore',
  )
}

function fetchFootprints() {
  return useRemote(
    () => request({ url: '/me/footprints', method: 'GET' }),
    () => {
      const list = allFootprints()
      return Promise.resolve({
        stats: footprintStats(list),
        list,
        pagination: { page: 1, pageSize: 20, total: list.length },
      })
    },
    'explore',
  )
}

function reportFootprint(poiId, type = 1, snapshot) {
  if (!isLoggedIn() || !poiId) return Promise.resolve(null)
  return useRemote(
    () => request({ url: '/me/footprints', method: 'POST', data: { poiId, type } }),
    () => {
      const extra = readJson(STORE_FOOTPRINTS, [])
      const today = new Date().toISOString().slice(0, 10)
      extra.push({
        footprintId: Date.now(),
        visitDate: today,
        visitTime: new Date().toTimeString().slice(0, 8),
        type,
        title: (snapshot && snapshot.title) || '浏览地点',
        coverUrl: (snapshot && snapshot.coverUrl) || COVER.danxia,
        tags: (snapshot && snapshot.tags) || [],
        address: (snapshot && snapshot.address) || '',
        cityName: (snapshot && snapshot.cityName) || '',
        poiId,
      })
      writeJson(STORE_FOOTPRINTS, extra)
      return Promise.resolve(null)
    },
    'explore',
  )
}

function fetchTravelers() {
  return useRemote(
    () =>
      request({ url: '/me/travelers', method: 'GET' }).then((res) => ({
        list: ((res && res.list) || []).map(publicTraveler),
      })),
    () => Promise.resolve({ list: getTravelersRaw().map(publicTraveler) }),
    'travelers',
  )
}

function addTraveler(body) {
  return useRemote(
    () => request({ url: '/me/travelers', method: 'POST', data: body }),
    () => {
      const list = getTravelersRaw()
      const idNumberPlain = body.idNumber
      const phonePlain = body.phone || ''
      const item = {
        travelerId: Date.now(),
        name: body.name,
        idType: body.idType || 1,
        idTypeText: '身份证',
        idNumber: maskId(idNumberPlain),
        idNumberPlain,
        phone: maskPhone(phonePlain) || '未填写',
        phonePlain,
        phoneAreaCode: body.phoneAreaCode || '+86',
        isDefault: !!body.isDefault,
      }
      writeJson(STORE_TRAVELERS, list.concat(item))
      return Promise.resolve(publicTraveler(item))
    },
    'travelers',
  )
}

function updateTraveler(travelerId, body) {
  return useRemote(
    () => request({ url: `/me/travelers/${travelerId}`, method: 'PUT', data: body }),
    () => {
      if (body.idNumber && String(body.idNumber).indexOf('*') >= 0) {
        return Promise.reject(new Error('请填写完整证件号或不要传证件号'))
      }
      const list = getTravelersRaw().map((item) => {
        if (item.travelerId !== Number(travelerId)) return item
        const next = Object.assign({}, item)
        if (body.name) next.name = body.name
        if (body.phone) {
          next.phonePlain = body.phone
          next.phone = maskPhone(body.phone)
        }
        if (body.idNumber) {
          next.idNumberPlain = body.idNumber
          next.idNumber = maskId(body.idNumber)
        }
        return next
      })
      writeJson(STORE_TRAVELERS, list)
      const found = list.find((item) => item.travelerId === Number(travelerId))
      return Promise.resolve(publicTraveler(found))
    },
    'travelers',
  )
}

function removeTraveler(travelerId) {
  return useRemote(
    () => request({ url: `/me/travelers/${travelerId}`, method: 'DELETE' }),
    () => {
      writeJson(
        STORE_TRAVELERS,
        getTravelersRaw().filter((item) => item.travelerId !== Number(travelerId)),
      )
      return Promise.resolve(null)
    },
    'travelers',
  )
}

function submitFeedback(body) {
  return useRemote(
    () => request({ url: '/me/feedback', method: 'POST', data: body }),
    () => Promise.resolve({ feedbackId: Date.now(), status: 0 }),
    'legal',
  )
}

function fetchCustomerService() {
  return useRemote(
    () => request({ url: '/config/customer-service', method: 'GET', auth: false }),
    () => Promise.resolve(clone(CS_CONFIG)),
    'legal',
  )
}

function fetchAbout() {
  return useRemote(
    () => request({ url: '/config/about', method: 'GET', auth: false }),
    () => Promise.resolve(clone(ABOUT)),
    'legal',
  )
}

function fetchPrivacyBrief() {
  return useRemote(
    () => request({ url: '/legal/privacy-brief', method: 'GET', auth: false }),
    () => Promise.resolve(clone(LEGAL_BRIEF)),
    'legal',
  )
}

function fetchCollectList() {
  return useRemote(
    () => request({ url: '/legal/collect-list', method: 'GET', auth: false }),
    () => Promise.resolve({ updatedAt: '2026-09-18', effectiveAt: '2026-09-18', rows: [] }),
    'legal',
  )
}

function fetchPermissions() {
  return useRemote(
    () => request({ url: '/legal/permissions', method: 'GET', auth: false }),
    () => Promise.resolve({ preamble: [], rows: [] }),
    'legal',
  )
}

function fetchPrivacy() {
  return useRemote(
    () => request({ url: '/legal/privacy', method: 'GET', auth: false }),
    () => Promise.resolve({ title: '隐私政策', contentHtml: '<p>完整版隐私政策将由法务提供</p>' }),
    'legal',
  )
}

function profileView(user) {
  if (!user) {
    return {
      nickName: '',
      avatarUrl: DEFAULT_AVATAR,
      bio: '',
      account: '未登录',
      memberLevel: '--',
      gender: '保密',
      genderValue: 0,
      birthday: '',
      phone: '',
      email: '',
    }
  }
  return {
    nickName: user.nickname || '微信用户',
    avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
    bio: user.signature || '',
    account: user.account,
    memberLevel: user.memberLevel,
    gender: GENDER_TEXT[user.gender] || '保密',
    genderValue: user.gender,
    birthday: user.birthday || '',
    phone: user.phone || '未绑定',
    email: user.email || '未绑定',
  }
}

function openCustomerService() {
  return fetchCustomerService().then((cfg) => {
    wx.showActionSheet({
      itemList: ['拨打客服电话', '微信客服'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: cfg.phone })
          return
        }
        if (cfg.enableWxWork) {
          toast(cfg.hint || '请使用小程序客服会话')
        }
      },
    })
  })
}

module.exports = {
  COVER,
  DEFAULT_AVATAR,
  GENDER_TEXT,
  GENDER_VALUE,
  ACTION_LABEL,
  isLoggedIn,
  getCachedProfile,
  profileView,
  wechatLogin,
  logout,
  requireLogin,
  getProfile,
  updateProfile,
  fetchOrders,
  fetchOrderDetail,
  cancelOrder,
  deleteOrder,
  handleRebook,
  payOrder,
  fetchPendingReviews,
  fetchPostedReviews,
  submitReview,
  toggleReviewAnonymous,
  fetchFavorites,
  fetchFootprints,
  reportFootprint,
  groupFootprints,
  fetchTravelers,
  addTraveler,
  updateTraveler,
  removeTraveler,
  submitFeedback,
  fetchCustomerService,
  fetchAbout,
  fetchPrivacyBrief,
  fetchCollectList,
  fetchPermissions,
  fetchPrivacy,
  openCustomerService,
  toOrderCard,
}
