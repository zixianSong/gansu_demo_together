module.exports = {
  BASE_URL: 'http://localhost:3000/api/v1',
  ENABLE_REMOTE_API: true,
  /** 评价/收藏等未就绪的模块继续 mock */
  MINE_USE_MOCK: true,
  /** 登录与个人资料走真实接口 */
  MINE_AUTH_REMOTE: true,
  /** 订单列表/详情/取消/删除/再次预定走真实接口（支付仍 mock） */
  MINE_ORDERS_REMOTE: true,
  /** 评价列表/提交/匿名/媒体走真实接口 */
  MINE_REVIEWS_REMOTE: true,
  /** 出行人列表/增删改走真实接口 */
  MINE_TRAVELERS_REMOTE: true,
  /** 收藏、足迹走真实接口 */
  MINE_EXPLORE_REMOTE: true,
  /** 反馈、客服、关于、合规文案走真实接口 */
  MINE_LEGAL_REMOTE: true,
}
