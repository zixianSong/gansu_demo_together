# 接口文档 — 环甘肃游小程序 · 个人中心

> **文档状态**：可指导前后端联调  
> **依据**：`docs/PRD-个人中心.md` + `docs/gansu_travel3.sql`  
> **技术栈**：TypeScript + NestJS + MySQL（后续部署云服务器）  
> **版本**：个人中心 v1.1  
> **更新日期**：2026-09-18

**不包含**：购票下单、首页发现、行程规划。订单由购票模块写入 `orders` 后，本模块只读与履约操作。

**不改表**：个人中心一期 **不 ALTER、不增列、不新建表**。缺口一律用现有字段（如 `orders.snapshot` JSON、`feedback.content` 文本、接口层合成字段）消化。

---

## 1. 文档约定

| 项 | 约定 |
|----|------|
| Base URL | 本地 `http://localhost:3000/api/v1`；云上 `https://{host}/api/v1` |
| 协议 | HTTPS（云上）+ JSON（`Content-Type: application/json`） |
| 鉴权 | 除登录、支付回调、合规静态页外，均需登录：`Authorization: Bearer {accessToken}` |
| 时间格式 | ISO 8601，如 `2026-09-18T12:00:00+08:00`；日期 `YYYY-MM-DD` |
| ID 类型 | `number`（对应 MySQL `bigint`） |
| 金额 | `number`，单位元，保留两位小数 |
| 分页 | `page` 从 1 起；`pageSize` 默认 `10`，最大 `50` |
| 字段命名 | 响应 **camelCase**；库表 snake_case 由后端映射 |
| 软删 | 用户侧列表默认 `deleted_at IS NULL` |
| 脱敏 | 证件号、手机号响应中脱敏，不返回明文 |

### 1.1 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录或 Token 无效/过期 |
| 403 | 无权操作（非本人订单等） |
| 404 | 资源不存在 |
| 409 | 状态不允许（如已支付订单再支付） |
| 500 | 服务器错误 |

### 1.2 分页结构

```json
{
  "list": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100
  }
}
```

### 1.3 Token

登录成功返回 `accessToken`（建议 JWT，有效期 ≥ 7 天，可另发 `expiresIn` 秒）。后续请求：

```http
Authorization: Bearer {accessToken}
```

### 1.4 枚举

**订单主状态 `orders.status` ↔ 列表 Tab**

| status | 文案 | tab |
|--------|------|-----|
| 1 | 待支付 | `unpaid` |
| 2 | 待出行 | `togo` |
| 3 | 待出行（履约中，仍归待出行 Tab） | `togo` |
| 4 | 待评价 | `review` |
| 5 | 已完成 | 仅 `all` |
| 6 | 退款/售后 | `refund` |
| 7 | 已取消 | 仅 `all` |

`refund` Tab 额外包含：`status=6` **或** `refund_status > 0`。

**退款细态 `orders.refund_status`**：`0` 无 / `1` 退款中 / `2` 已退款 / `3` 部分退款。

**商品类型 `orders.product_type`**：`1` 门票 / `2` 线路 / `3` 美食 / `4` 其他 / `5` 包车 / `6` 拼车。个人中心一期列表以门票为主，其它类型同样返回，`categoryLabel` 由后端按类型映射。

**订单操作 `actions[]`**

| 值 | 按钮 | 允许的 status（门票一期） |
|----|------|---------------------------|
| `cancel` | 取消 | 1、2（3 是否可取消见业务，默认否） |
| `rebook` | 再次预定 | 1、2、3、4、6、7 |
| `pay` | 去支付 | 1 |
| `voucher` | 使用凭证 | 2、3、4 |
| `review` | 点评 | 4 |
| `delete` | 删除订单 | 6 或 7（前端仅售后 Tab 展示删除） |

**证件类型 `id_type`**：`1` 身份证 / `2` 护照 / `3` 港澳通行证 / `4` 台湾通行证。

**性别 `users.gender`**：`0` 未知/保密 / `1` 男 / `2` 女。

**收藏 `favorites.target_type`**

| 值 | Tab `tab` | 关联 |
|----|-----------|------|
| 1 | 由 `extra_info.tab` 决定 `spot` 或 `food` | `poi.id` |
| 2 | `route` | `routes.route_id` |
| 3 | `guide` | `guides.guide_id` |
| 4 | `guide` | `article.id` |
| 5 | `route` | `route_template.id` |

列表过滤以 `extra_info.tab` 为准（见 1.5 E、接口 18）。

**足迹 `footprints.type`**：`1` 浏览 / `2` 到访。

**反馈 `feedback.type`**：`1` 反馈 / `2` 投诉 / `3` 咨询。表单页提交默认 `2`。

**票券 `ticket_voucher.status`**：`1` 待使用 / `2` 已使用 / `3` 已退款。

**支付单 `payment.status`**：`1` 待支付 / `2` 成功 / `3` 失败 / `4` 已关闭 / `5` 已退款。

### 1.5 一期已决定（联调按此执行）

#### A. 取消 vs 退款

| 订单状态 | 前端按钮 | 调用 | 后端结果 |
|----------|----------|------|----------|
| `status=1` 待支付 | 取消 | **只调** `POST .../cancel` | `status=7`；支付单 `4` 已关闭；**不写** `refund_record` |
| `status=2` 待出行且凭证均未核销 | 取消 | **只调** `POST .../cancel` | 内部创建 `refund_record`（`status=1` 待审核）；`orders.status=6`，`refund_status=1` |
| `status=3` 履约中 | 无取消 | — | 若误调：`409`，`message`：`履约中不可取消` |
| 任一凭证已核销（`ticket_voucher.status=2`） | 无取消或点了 | `POST .../cancel` | `409`，`message`：`已使用不可取消` |
| `status=4/5/6/7` | 无取消 | 误调 | `409`，`message`：`当前状态不可取消` |

- 列表/详情的「取消」**禁止**直接调 `POST .../refund`。  
- `POST .../refund` 一期 **不对 C 端页面开放**（售后无独立「申请退款」按钮）；与待出行取消共用同一套写库逻辑，仅供 cancel 内部复用或以后后台。  
- 一期 **不自动打款**；原路退回与审核在后台后置。用户侧看到退款/售后即可。  
- 二次确认文案：待支付「确认取消该订单？」；待出行「确认取消？将提交退款申请」。

#### B. 再次预定

- 购票模块未上线：`GET .../rebook` 返回 `enabled: false` 与 `message`。前端 **只 toast，不 `navigateTo`**。  
- 购票上线后改配置把 `enabled` 改为 `true`，路径固定：门票 `/pages/ticket/detail?productId={productId}`（`productType=1`）。其它 `productType` 一期同样 `enabled: false`（无对应购票页）。  
- 个人中心 **不下单**。

#### C. 评价匿名 + 媒体

- 提交时 `isAnonymous` **缺省 = true**（与设计「已匿名」一致）。写评价页默认勾选匿名，用户可关掉。  
- 图片/视频必须先 `POST /api/v1/me/media`，再把返回的 `url` 放进 `images[]`。**不要**把评价文件打到头像接口。  
- 单次评价：最多 9 个 URL；图片 jpg/png/webp，单文件 ≤ 2MB；视频 mp4，单文件 ≤ 10MB；视频最多 1 个。

#### D. 更新出行人时的证件号

- 列表/详情 **只返回脱敏** `idNumber`（含 `*`）。  
- `PUT`：**省略 `idNumber`** = 不改库中证件号。  
- `PUT` 传入完整明文 = 覆盖存储。  
- 若 `idNumber` 含 `*` 或等于列表脱敏串：`400`，`message`：`请填写完整证件号或不要传证件号`。前端编辑页：用户未改证件则字段不提交。

#### E. 足迹 / 收藏由谁写入

| 数据 | 谁写 | 何时 | 个人中心 |
|------|------|------|----------|
| 足迹 `type=1` 浏览 | 景点详情 `pages/poi/detail`（已登录 `onShow`） | `POST /api/v1/me/footprints` | 只 `GET` 展示 |
| 足迹 `type=2` 到访 | **核销成功**（`ticket_voucher` 变为已使用）由核销/票务服务写同一 POST，`type=2` | 用户点「使用凭证」**不**写到访、**不**改核销状态 | 只展示 |
| 收藏 | 景点/线路/攻略/美食 **详情页** 点收藏 | `POST /api/v1/me/favorites`；取消 `DELETE /api/v1/me/favorites/{favoriteId}` | 一期列表只读，不做取消收藏按钮 |

同一用户同一 `poi_id` + `visit_date`：已有浏览再上报浏览则更新 `visit_time`；上报到访则 `type` 升为 `2`（不降级）。  
写入收藏时 `extra_info.tab` **必填**：`spot` / `food` / `route` / `guide`，列表按该字段过滤（见接口 18、32）。

### 1.6 页面 ↔ 接口对照

未登录：可进「我的」和合规/关于/客服配置；点需登录能力时先 `POST /auth/wechat-login`，再进目标页。  
Token `401`：清本地 token，引导重新登录；写操作失败后重试。

| 小程序页面 | 进入时请求 | 用户操作 → 接口 | 说明 |
|------------|------------|-----------------|------|
| `pages/wode/wode` | 已登录：`GET /me/profile`；未登录：不请求 | 登录 → `POST /auth/wechat-login`；菜单仅跳转 | 不拉订单列表；四个入口带 `tab` 打开订单页 |
| `pages/profile/profile` | `GET /me/profile` | 换头像 → `POST /me/avatar`；保存 → `PUT /me/profile`；退出（若做）→ `POST /auth/logout` | 手机号/邮箱只读 |
| `pages/orders/orders` | `GET /me/orders?tab=&keyword=&page=` | 取消 → `POST .../cancel`；支付 → `POST .../pay` 再 `wx.requestPayment`；凭证 → 详情；点评 → 写评价页；删除 → `DELETE .../orders/{id}`；再次预定 → `GET .../rebook` | 按钮点了不要进详情；一期筛选=Tab，搜索=keyword |
| `pages/order-detail/order-detail` | `GET /me/orders/{orderId}` | 同列表按钮；支付成功后重新 `GET` 详情 | 「使用凭证」只展示码；核销以外边扫码为准 |
| `pages/reviews/reviews` | 待点评 `GET /me/reviews/pending`；已点评 `GET /me/reviews/posted` | 点评 → 写评价；已点评改匿名 → `PUT .../anonymous` | |
| `pages/review-form/review-form` | 可用 pending 项或详情带入场所信息，**不必**再调待评列表 | 每张媒体 → `POST /me/media`；提交 → `POST /me/reviews` | `orderId` 从路由传入 |
| `pages/favorites/favorites` | `GET /me/favorites?tab=` | 点卡片 `navigateTo` 条目 `path` | 不写收藏 |
| `pages/footprint/footprint` | `GET /me/footprints` | 点条目可去 `pages/poi/detail` | 本页不打点 |
| `pages/travelers/travelers` | `GET /me/travelers` | 新增 `POST`；编辑 `PUT`（证件号规则见 1.5 D）；删除 `DELETE` | |
| 反馈投诉（建议 `pages/feedback/feedback`，若尚未建页则先占位） | 无 | `POST /me/feedback` | |
| `pages/privacy/privacy` | `GET /legal/privacy-brief`；完整版链 `GET /legal/privacy` | — | 也可先静态，与接口字段对齐即可 |
| `pages/mine-doc/mine-doc?type=collect` | `GET /legal/collect-list` | — | |
| `pages/mine-doc/mine-doc?type=permissions` | `GET /legal/permissions` | — | |
| `pages/mine-doc/mine-doc?type=about` | `GET /config/about` | — | |
| 在线客服（弹层/双按钮） | `GET /config/customer-service` | 电话 `wx.makePhoneCall`；微信客服用小程序官方客服 | 配置接口可不登录 |

支付：`wx.requestPayment` 成功/失败/`onShow` 回列表或详情时再 `GET` 订单，**不要**把客户端成功当作已支付；以回调改库为准。可每 2 秒 `GET` 详情最多 5 次。

### 1.7 订单状态机

个人中心 **不能**把凭证展示做成核销。核销只由景区扫码/票务服务改 `ticket_voucher` 与订单主态。

```
创建订单（购票模块）
        │
        ▼
   [1 待支付]
     │           └── 用户取消 / 超时关单 ──► [7 已取消]
     │ 微信支付回调成功
     ▼
   [2 待出行]  （凭证可展示）
     │           └── 用户取消（未核销）──► 写退款单 ──► [6 退款/售后]
     │ 开始履约（可选）
     ▼
   [3 履约中]  （仍归 Tab 待出行；不可取消）
     │
     │ 全部应核销凭证已使用（票务写入）
     ▼
   [4 待评价]
     │           └── 用户提交评价 ──► [5 已完成]
     │
     └── 用户删除（仅 6/7）：不改 status，snapshot.userHidden=true，列表消失
```

| 流转 | 触发方 | 接口或来源 |
|------|--------|------------|
| 1→2 | 微信回调 | `POST /payments/wx-notify` |
| 1→7 | 用户 | `POST /me/orders/{id}/cancel` |
| 2→6 | 用户取消 | 同上 cancel（内部退款单） |
| 2→3 | 票务（可选） | **非**个人中心 |
| 2/3→4 | 核销完成 | **非**个人中心 |
| 4→5 | 用户 | `POST /me/reviews` |
| 列表隐藏 6/7 | 用户 | `DELETE /me/orders/{id}` |

### 1.8 `orders.snapshot` JSON 键（不改表，只约定键名）

与购票下单已有字段 **合并写入**，禁止整对象覆盖导致丢规则。

| 键 | 类型 | 说明 |
|----|------|------|
| `usage` | string | 使用方式文案 |
| `refundRule` | string | 退订规则 |
| `snapshotNote` | string | 交易凭证说明 |
| `feeDetail` | object | `{ totalAmount, discountAmount, payAmount }`，可与订单列冗余 |
| `userHidden` | boolean | 用户「删除订单」后为 `true` |

缺省：`usage` = `凭身份证或二维码入园`；`snapshotNote` = `作为本订单交易凭证，与订单具有同等效力`。

---

## 2. 接口一览

| 序号 | 接口名称 | 方法 | 路径 | 登录 |
|------|----------|------|------|------|
| 1 | 微信授权登录 | POST | `/api/v1/auth/wechat-login` | 否 |
| 2 | 退出登录 | POST | `/api/v1/auth/logout` | 是 |
| 3 | 获取「我的」摘要 | GET | `/api/v1/me/profile` | 是 |
| 4 | 更新个人资料 | PUT | `/api/v1/me/profile` | 是 |
| 5 | 上传头像 | POST | `/api/v1/me/avatar` | 是 |
| 6 | 获取我的订单列表 | GET | `/api/v1/me/orders` | 是 |
| 7 | 获取订单详情 | GET | `/api/v1/me/orders/{orderId}` | 是 |
| 8 | 预下单支付（微信支付） | POST | `/api/v1/me/orders/{orderId}/pay` | 是 |
| 9 | 微信支付回调 | POST | `/api/v1/payments/wx-notify` | 否（微信服务器） |
| 10 | 取消订单 | POST | `/api/v1/me/orders/{orderId}/cancel` | 是 |
| 11 | 申请退款 | POST | `/api/v1/me/orders/{orderId}/refund` | 是 |
| 12 | 删除订单 | DELETE | `/api/v1/me/orders/{orderId}` | 是 |
| 13 | 再次预定信息 | GET | `/api/v1/me/orders/{orderId}/rebook` | 是 |
| 14 | 待点评列表 | GET | `/api/v1/me/reviews/pending` | 是 |
| 15 | 已点评列表 | GET | `/api/v1/me/reviews/posted` | 是 |
| 16 | 提交评价 | POST | `/api/v1/me/reviews` | 是 |
| 17 | 切换评价匿名 | PUT | `/api/v1/me/reviews/{reviewId}/anonymous` | 是 |
| 18 | 我的收藏列表 | GET | `/api/v1/me/favorites` | 是 |
| 19 | 我的足迹 | GET | `/api/v1/me/footprints` | 是 |
| 19b | 上报足迹 | POST | `/api/v1/me/footprints` | 是 |
| 20 | 出行人列表 | GET | `/api/v1/me/travelers` | 是 |
| 21 | 新增出行人 | POST | `/api/v1/me/travelers` | 是 |
| 22 | 更新出行人 | PUT | `/api/v1/me/travelers/{travelerId}` | 是 |
| 23 | 删除出行人 | DELETE | `/api/v1/me/travelers/{travelerId}` | 是 |
| 24 | 提交反馈投诉 | POST | `/api/v1/me/feedback` | 是 |
| 25 | 客服配置 | GET | `/api/v1/config/customer-service` | 否 |
| 26 | 关于我们 | GET | `/api/v1/config/about` | 否 |
| 27 | 隐私政策简要版 | GET | `/api/v1/legal/privacy-brief` | 否 |
| 28 | 个人信息收集清单 | GET | `/api/v1/legal/collect-list` | 否 |
| 29 | 应用权限说明 | GET | `/api/v1/legal/permissions` | 否 |
| 30 | 完整隐私政策 | GET | `/api/v1/legal/privacy` | 否 |
| 31 | 上传评价媒体 | POST | `/api/v1/me/media` | 是 |
| 32 | 添加收藏 | POST | `/api/v1/me/favorites` | 是 |
| 33 | 取消收藏 | DELETE | `/api/v1/me/favorites/{favoriteId}` | 是 |

---

## 3. 接口详情

### 1. 微信授权登录

| 项 | 内容 |
|----|------|
| **接口名称** | 微信授权登录 |
| **接口说明** | 小程序 `wx.login` 得 `code`，后端换 `openid`；可选带上头像昵称写入 `users`。不采集证件号。 |
| **方法** | `POST` |
| **路径** | `/api/v1/auth/wechat-login` |
| **是否登录** | 否 |
| **对应表** | `users` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | `wx.login` 返回的 code |
| nickname | string | 否 | 微信昵称 |
| avatarUrl | string | 否 | 微信头像 URL |

#### 请求示例

```http
POST /api/v1/auth/wechat-login
Content-Type: application/json

{
  "code": "081xXx",
  "nickname": "环甘肃小玩家",
  "avatarUrl": "https://wx.qlogo.cn/..."
}
```

#### 成功响应 `data`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "user": {
    "userId": 1001,
    "nickname": "环甘肃小玩家",
    "avatarUrl": "https://wx.qlogo.cn/...",
    "phone": null,
    "email": null,
    "gender": 0,
    "birthday": null,
    "signature": null,
    "account": "wx_1001",
    "memberLevel": "普通会员"
  }
}
```

`account`：无独立账号字段时可用 `wx_{userId}` 或脱敏 openid 展示，禁止把完整 openid 给前端。  
`memberLevel`：库表无等级字段，一期固定 `"普通会员"`。

---

### 2. 退出登录

| 项 | 内容 |
|----|------|
| **接口名称** | 退出登录 |
| **接口说明** | 客户端丢弃 Token；若使用服务端黑名单则在此失效。 |
| **方法** | `POST` |
| **路径** | `/api/v1/auth/logout` |
| **是否登录** | 是 |

#### Body

无

#### 成功响应 `data`

`null`

---

### 3. 获取「我的」摘要 / 个人主页回填

| 项 | 内容 |
|----|------|
| **接口名称** | 获取当前用户资料 |
| **接口说明** | 「我的」顶栏与个人主页共用。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/profile` |
| **是否登录** | 是 |
| **对应表** | `users` |

#### Query

无

#### 成功响应 `data`

```json
{
  "userId": 1001,
  "nickname": "环甘肃小玩家",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "phone": "138****8888",
  "email": "t***@example.com",
  "gender": 2,
  "birthday": "1998-06-15",
  "signature": "一程山水一程歌，用脚步丈量甘肃的辽阔。",
  "account": "wx_1001",
  "memberLevel": "普通会员"
}
```

手机号、邮箱仅脱敏展示；无值则为 `null`。

---

### 4. 更新个人资料

| 项 | 内容 |
|----|------|
| **接口名称** | 更新个人资料 |
| **接口说明** | 对应个人主页「保存修改」。不可改证件号、手机号、邮箱（只读）。 |
| **方法** | `PUT` |
| **路径** | `/api/v1/me/profile` |
| **是否登录** | 是 |
| **对应表** | `users` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称，最长 100 |
| avatarUrl | string | 否 | 头像 URL（也可只走上传接口） |
| gender | number | 否 | 0 / 1 / 2 |
| birthday | string | 否 | `YYYY-MM-DD` |
| signature | string | 否 | 个性签名，最长 255 |

#### 成功响应 `data`

同接口 3。

---

### 5. 上传头像

| 项 | 内容 |
|----|------|
| **接口名称** | 上传头像 |
| **接口说明** | `multipart/form-data` 上传图片，写入存储后更新 `users.avatar_url`。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/avatar` |
| **是否登录** | 是 |
| **对应表** | `users` |
| **Content-Type** | `multipart/form-data` |

#### 表单字段

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 图片，建议 ≤ 2MB，jpg/png/webp |

#### 成功响应 `data`

```json
{
  "avatarUrl": "https://cdn.example.com/u/1001.jpg"
}
```

---

### 6. 获取我的订单列表

| 项 | 内容 |
|----|------|
| **接口名称** | 获取我的订单列表 |
| **接口说明** | 当前用户订单。`tab` 对应「全部 / 待支付 / 待出行 / 待评价 / 退款售后」。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/orders` |
| **是否登录** | 是 |
| **对应表** | `orders`，`order_item`，`order_ticket_ext` |

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tab | string | 否 | 默认 `all`。`all` / `unpaid` / `togo` / `review` / `refund` |
| keyword | string | 否 | 匹配 `product_name` 或 `order_no` |
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10，最大 50 |

#### 请求示例

```http
GET /api/v1/me/orders?tab=unpaid&keyword=莫高窟&page=1&pageSize=10
Authorization: Bearer eyJhbGciOi...
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "orderId": 10001,
      "orderNo": "ORD20260805001",
      "productType": 1,
      "categoryLabel": "门票",
      "productId": 88,
      "title": "莫高窟旺季正常参观门票A票",
      "status": 1,
      "statusText": "待支付",
      "validDate": "2026-08-05",
      "quantity": 2,
      "quantityText": "2张",
      "usage": "凭身份证原件入园",
      "payAmount": 476.00,
      "payHint": "在线支付",
      "actions": ["cancel", "rebook", "pay"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

| 字段 | 来源 / 规则 |
|------|-------------|
| `validDate` | `orders.travel_date`，空则 `order_ticket_ext.booking_date` |
| `quantity` | `orders.quantity` |
| `usage` | `orders.snapshot.usage`，默认「凭身份证或二维码入园」 |
| `payHint` | `status=1`「在线支付」；2/3「已付款」；4「已核销」；`refund_status=1`「退款中」；其余可空或「已退款」 |
| `actions` | 见 1.4 |

---

### 7. 获取订单详情

| 项 | 内容 |
|----|------|
| **接口名称** | 获取订单详情 |
| **接口说明** | 商品、出行人（脱敏）、凭证、费用与退订规则。仅本人。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/orders/{orderId}` |
| **是否登录** | 是 |
| **对应表** | `orders`，`order_item`，`order_ticket_ext`，`order_travelers`，`ticket_voucher`，`order_vouchers`，`payment` |

#### Path

| 参数 | 类型 | 说明 |
|------|------|------|
| orderId | number | `orders.order_id` |

#### 成功响应 `data`

```json
{
  "orderId": 10002,
  "orderNo": "ORD20260808001",
  "status": 2,
  "statusText": "待出行",
  "statusHint": "订单已确认，请按时出行",
  "productType": 1,
  "categoryLabel": "门票",
  "productId": 90,
  "title": "张掖七彩丹霞深度游门票+观光车",
  "validDate": "2026-08-08",
  "quantity": 1,
  "quantityText": "1张",
  "usage": "刷二维码入园",
  "travelers": [
    {
      "name": "李*",
      "idType": 1,
      "idTypeText": "身份证",
      "idNumber": "620***********1234",
      "phone": "138****8888"
    }
  ],
  "vouchers": [
    {
      "voucherId": 501,
      "source": "ticket",
      "qrcodeData": "TV501VERIFY",
      "qrcodeImage": "https://cdn.example.com/qr/501.png",
      "status": 1,
      "statusText": "待使用"
    }
  ],
  "voucherSummary": {
    "usedCount": 0,
    "totalCount": 1
  },
  "payAmount": 168.00,
  "feeDetail": {
    "totalAmount": 168.00,
    "discountAmount": 0.00,
    "payAmount": 168.00
  },
  "snapshotNote": "作为本订单交易凭证，与订单具有同等效力",
  "refundRule": "未使用可随时退，部分使用不可退",
  "actions": ["cancel", "rebook"]
}
```

门票凭证优先 `ticket_voucher`（经 `order_item`）；无则回退 `order_vouchers`。`qrcodeData` 供前端生成码；有 `qrcodeImage` 则直接展示。  
`refundRule` / `usage` / `snapshotNote` 来自 `orders.snapshot` JSON，缺省用上文默认文案。

`statusHint` 建议：1「请尽快完成支付」；2/3「订单已确认，请按时出行」；4「行程已结束，欢迎点评」；6「退款处理中，请耐心等待」。

---

### 8. 预下单支付（微信支付）

| 项 | 内容 |
|----|------|
| **接口名称** | 预下单支付 |
| **接口说明** | 仅 `status=1`。创建/复用 `payment` 记录，调微信统一下单，返回小程序 `wx.requestPayment` 参数。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/orders/{orderId}/pay` |
| **是否登录** | 是 |
| **对应表** | `orders`，`payment` |

#### Body

无（或预留 `{}`）

#### 成功响应 `data`

```json
{
  "paymentId": 9001,
  "paymentNo": "PAY20260808001",
  "timeStamp": "1726660000",
  "nonceStr": "abc",
  "package": "prepay_id=wx201...",
  "signType": "RSA",
  "paySign": "..."
}
```

前端用 `timeStamp, nonceStr, package, signType, paySign` 调起支付。成功后以回调为准，客户端可轮询详情 `status`。

#### 错误

| code | 场景 |
|------|------|
| 409 | 非待支付 |
| 403 | 非本人订单 |

---

### 9. 微信支付回调

| 项 | 内容 |
|----|------|
| **接口名称** | 微信支付结果通知 |
| **接口说明** | 微信服务器调用。验签后更新 `payment`、`orders.status`（1→2）、`pay_time`。响应须符合微信回调格式，不是本文统一 JSON。 |
| **方法** | `POST` |
| **路径** | `/api/v1/payments/wx-notify` |
| **是否登录** | 否 |
| **对应表** | `payment`，`orders`，`order_status_logs` |

实现时按微信支付 APIv3 文档返回；本处不展开 XML/JSON 报文。

---

### 10. 取消订单

| 项 | 内容 |
|----|------|
| **接口名称** | 取消订单 |
| **接口说明** | 规则见 **1.5 A**。待支付关单为 7；待出行未核销则内部生成退款申请，主态改为 6。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/orders/{orderId}/cancel` |
| **是否登录** | 是 |
| **对应表** | `orders`，`payment`，`refund_record`，`order_status_logs` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | 否 | 取消原因 |

#### 成功响应 `data`（待支付）

```json
{
  "orderId": 10001,
  "status": 7,
  "statusText": "已取消"
}
```

#### 成功响应 `data`（待出行取消 → 退款申请）

```json
{
  "orderId": 10002,
  "status": 6,
  "statusText": "退款/售后",
  "refundId": 301,
  "refundStatus": 1
}
```

不可取消时 `409`，`message` 用 1.5 A 中的固定句。

---

### 11. 申请退款

| 项 | 内容 |
|----|------|
| **接口名称** | 申请退款 |
| **接口说明** | 与待出行 `cancel` 写库相同。**一期 C 端页面不调用**（见 1.5 A）。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/orders/{orderId}/refund` |
| **是否登录** | 是 |
| **对应表** | `refund_record`，`orders` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | 否 | 退款原因 |

#### 成功响应 `data`

```json
{
  "refundId": 301,
  "orderId": 10004,
  "status": 1,
  "statusText": "待审核",
  "refundAmount": 110.00
}
```

---

### 12. 删除订单

| 项 | 内容 |
|----|------|
| **接口名称** | 删除订单 |
| **接口说明** | 仅 `status` 为 6 或 7 时允许。**不物理删行、不加列。** 在现有 `orders.snapshot` JSON 写入 `"userHidden": true`（与原有费用/规则字段合并，不覆盖其它键）。列表/详情查询忽略 `snapshot.userHidden === true` 的订单。 |
| **方法** | `DELETE` |
| **路径** | `/api/v1/me/orders/{orderId}` |
| **是否登录** | 是 |
| **对应表** | `orders.snapshot` |

#### 成功响应 `data`

`null`

非 6/7 状态返回 `409`。

---

### 13. 再次预定信息

| 项 | 内容 |
|----|------|
| **接口名称** | 再次预定跳转信息 |
| **接口说明** | 见 **1.5 B**。不在本模块下单。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/orders/{orderId}/rebook` |
| **是否登录** | 是 |
| **对应表** | `orders` |

#### 成功响应 `data`（购票未上线，一期默认）

```json
{
  "enabled": false,
  "productType": 1,
  "productId": 88,
  "path": "/pages/ticket/detail?productId=88",
  "message": "购票功能即将上线"
}
```

`enabled === true` 时前端 `navigateTo({ url: path })`；否则 `wx.showToast({ title: message })`。

---

### 14. 待点评列表

| 项 | 内容 |
|----|------|
| **接口名称** | 待点评订单列表 |
| **接口说明** | `orders.status=4` 且无 `reviews` 记录。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/reviews/pending` |
| **是否登录** | 是 |
| **对应表** | `orders`，`order_ticket_ext`，`scenic_spot`，`poi` |

#### Query

`page`，`pageSize`

#### 成功响应 `data`

```json
{
  "list": [
    {
      "orderId": 10003,
      "productType": 1,
      "categoryLabel": "门票",
      "title": "嘉峪关关城门票",
      "validDate": "2026-07-20",
      "quantity": 2,
      "quantityText": "2张",
      "usage": "刷身份证入园",
      "payAmount": 110.00,
      "payHint": "已核销",
      "placeName": "嘉峪关关城",
      "placeAddress": "甘肃省嘉峪关市峪泉镇关城南路421号",
      "actions": ["review", "rebook", "voucher"]
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "total": 1 }
}
```

场所名/地址：`scenic_spot` / `poi`，无则用 `orders.product_name`。

---

### 15. 已点评列表

| 项 | 内容 |
|----|------|
| **接口名称** | 已发表评价列表 |
| **接口说明** | 当前用户 `reviews.deleted_at IS NULL`。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/reviews/posted` |
| **是否登录** | 是 |
| **对应表** | `reviews` |

#### Query

`page`，`pageSize`

#### 成功响应 `data`

```json
{
  "list": [
    {
      "reviewId": 201,
      "orderId": 10010,
      "rating": 5,
      "ratingLabel": "非常满意",
      "content": "七彩丹霞真的名不虚传……",
      "images": [],
      "isAnonymous": true,
      "reviewTime": "2026-07-22T18:00:00+08:00",
      "placeName": "张掖七彩丹霞旅游景区",
      "categoryLabel": "门票"
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "total": 1 }
}
```

---

### 16. 提交评价

| 项 | 内容 |
|----|------|
| **接口名称** | 提交评价 |
| **接口说明** | 一单一评（`uk_order_id`）。成功后订单 `status`：4→5。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/reviews` |
| **是否登录** | 是 |
| **对应表** | `reviews`，`orders` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | number | 是 | 待评价订单 |
| rating | number | 是 | 1–5 |
| ratingLabel | string | 否 | 如「非常满意」 |
| content | string | 否 | 最长 200 |
| images | string[] | 否 | 已上传的图片/视频 URL |
| isAnonymous | boolean | 否 | **缺省 true**（1.5 C） |

`images` 必须是接口 31 返回的 URL，禁止未上传的本地路径。

#### 成功响应 `data`

```json
{
  "reviewId": 202,
  "orderId": 10003
}
```

订单非待评价或已评：`409`。

---

### 17. 切换评价匿名

| 项 | 内容 |
|----|------|
| **接口名称** | 切换评价匿名 |
| **接口说明** | 已点评卡片「已匿名」下拉。 |
| **方法** | `PUT` |
| **路径** | `/api/v1/me/reviews/{reviewId}/anonymous` |
| **是否登录** | 是 |
| **对应表** | `reviews` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isAnonymous | boolean | 是 | |

#### 成功响应 `data`

```json
{ "reviewId": 201, "isAnonymous": false }
```

---

### 18. 我的收藏列表

| 项 | 内容 |
|----|------|
| **接口名称** | 我的收藏列表 |
| **接口说明** | 按 Tab 过滤 `favorites`，拼目标展示字段。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/favorites` |
| **是否登录** | 是 |
| **对应表** | `favorites`，`poi`，`routes`，`guides`，`article`，`foods` |

#### Query

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tab | string | 否 | 默认 `spot`。`spot` / `route` / `guide` / `food`。过滤：`deleted_at IS NULL` 且 `extra_info.tab` 等于该值。历史数据无 `tab` 时：`target_type=1` 且 `poi.category=food` 视为 `food`，其余 `target_type=1` 视为 `spot`；`2`/`5`→`route`；`3`/`4`→`guide`。 |
| page | number | 否 | |
| pageSize | number | 否 | |

#### 成功响应 `data`（景点示例）

```json
{
  "list": [
    {
      "favoriteId": 11,
      "tab": "spot",
      "targetType": 1,
      "targetId": 101,
      "title": "张掖七彩丹霞旅游景区",
      "coverUrl": "https://cdn.example.com/danxia.jpg",
      "price": 74.00,
      "collectedAt": "2026-07-15T10:00:00+08:00",
      "path": "/pages/poi/detail?id=101"
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "total": 2 }
}
```

线路补充 `subtitle`（如 `6天5晚 · 兰州出发`：`routes.days` + `departure`）。  
攻略补充 `author`、`publishTime`、`readCount`、`likeCount`。  
美食补充 `rating`、`avgCost`、`address`。  
`price` 等优先 `extra_info`，否则查目标表。

---

### 19. 我的足迹

| 项 | 内容 |
|----|------|
| **接口名称** | 我的足迹（统计 + 时间轴） |
| **接口说明** | 统计三项 + 按日分组记录。写入由景点详情等模块调用（可另提供内部打点接口，见文末）。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/footprints` |
| **是否登录** | 是 |
| **对应表** | `footprints` |

#### Query

`page`，`pageSize`（按「日期组」或按记录分页，推荐按记录分页，前端再分组）

#### 成功响应 `data`

```json
{
  "stats": {
    "poiCount": 28,
    "cityCount": 12,
    "travelDays": 36
  },
  "list": [
    {
      "footprintId": 1,
      "visitDate": "2026-08-01",
      "visitTime": "09:30:00",
      "type": 1,
      "title": "莫高窟",
      "coverUrl": "https://cdn.example.com/mogao.jpg",
      "tags": ["世界文化遗产", "佛教艺术"],
      "address": "甘肃省酒泉市敦煌市莫高镇",
      "cityName": "敦煌市",
      "poiId": 12
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 28 }
}
```

`poiCount`：去重 `poi_id`；`cityCount`：去重 `city_name`；`travelDays`：去重 `visit_date`。  
`tags`：可由 `poi_grade`、`poi_category` 拼数组。

**打点（其它模块调用，个人中心依赖）**

| 项 | 内容 |
|----|------|
| **接口名称** | 上报足迹 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/footprints` |
| **登录** | 是 |

Body：`poiId`（必填）、`type`（1 浏览 / 2 到访，默认 1）。写入 `poi` 快照字段。去重规则见 **1.5 E**。景点详情只传 `type=1`；核销服务才传 `type=2`。

---

### 20. 出行人列表

| 项 | 内容 |
|----|------|
| **接口名称** | 出行人列表 |
| **接口说明** | 当前用户未删除的常用出行人。 |
| **方法** | `GET` |
| **路径** | `/api/v1/me/travelers` |
| **是否登录** | 是 |
| **对应表** | `travelers` |

#### 成功响应 `data`

```json
{
  "list": [
    {
      "travelerId": 1,
      "name": "李晓雅",
      "idType": 1,
      "idTypeText": "身份证",
      "idNumber": "110101********1234",
      "phone": "138****8888",
      "phoneAreaCode": "+86",
      "isDefault": true
    }
  ]
}
```

一期列表量小，可不分页。证件号、手机号脱敏。

---

### 21. 新增出行人

| 项 | 内容 |
|----|------|
| **接口名称** | 新增出行人 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/travelers` |
| **是否登录** | 是 |
| **对应表** | `travelers` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 与证件一致 |
| idType | number | 是 | 默认 1 |
| idNumber | string | 是 | 明文传输 HTTPS，服务端加密存储 |
| phone | string | 否 | |
| phoneAreaCode | string | 否 | 默认 `+86` |
| isDefault | boolean | 否 | |

#### 成功响应 `data`

同列表单项（脱敏）。`400`：证件格式不合法。

---

### 22. 更新出行人

| 项 | 内容 |
|----|------|
| **接口名称** | 更新出行人 |
| **接口说明** | 证件号规则见 **1.5 D**。仅本人。 |
| **方法** | `PUT` |
| **路径** | `/api/v1/me/travelers/{travelerId}` |
| **是否登录** | 是 |

Body 字段均可选，至少一项：`name`、`idType`、`idNumber`、`phone`、`phoneAreaCode`、`isDefault`。

#### 成功响应 `data`

同列表单项。

---

### 23. 删除出行人

| 项 | 内容 |
|----|------|
| **接口名称** | 删除出行人 |
| **接口说明** | 软删 `deleted_at`。 |
| **方法** | `DELETE` |
| **路径** | `/api/v1/me/travelers/{travelerId}` |
| **是否登录** | 是 |

#### 成功响应 `data`

`null`

---

### 24. 提交反馈投诉

| 项 | 内容 |
|----|------|
| **接口名称** | 提交反馈投诉 |
| **接口说明** | 前端传标题 + 正文。表仅有 `content`，**不加 title 列**。入库：`content` = `【{title}】\n{正文}`。`type` 默认 2。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/feedback` |
| **是否登录** | 是 |
| **对应表** | `feedback` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题，最长 80 |
| content | string | 是 | 正文，最长 2000 |
| type | number | 否 | 默认 2（投诉） |
| contact | string | 否 | 联系方式 |

#### 成功响应 `data`

```json
{
  "feedbackId": 88,
  "status": 0
}
```

一期不提供列表查询。

---

### 25. 客服配置

| 项 | 内容 |
|----|------|
| **接口名称** | 客服配置 |
| **接口说明** | 微信客服与电话，便于改号不发版。 |
| **方法** | `GET` |
| **路径** | `/api/v1/config/customer-service` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "phone": "0931-0000000",
  "enableWxWork": true,
  "hint": "工作日 9:00-18:00"
}
```

小程序打开客服会话用微信官方客服能力，不必返回 corpId；`enableWxWork` 控制是否展示「微信客服」按钮。

---

### 26. 关于我们

| 项 | 内容 |
|----|------|
| **接口名称** | 关于我们 |
| **方法** | `GET` |
| **路径** | `/api/v1/config/about` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "name": "环甘肃游",
  "version": "1.0.0",
  "intro": "面向甘肃旅行的小程序，提供发现、订票与行程服务。"
}
```

---

### 27. 隐私政策简要版

| 项 | 内容 |
|----|------|
| **接口名称** | 隐私政策简要版 |
| **方法** | `GET` |
| **路径** | `/api/v1/legal/privacy-brief` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "title": "隐私政策简要版",
  "subtitle": "清晰告知提供服务所需收集信息及收集方式",
  "fullPolicyPath": "/api/v1/legal/privacy",
  "collectScenes": [
    {
      "key": "account",
      "title": "账号注册、登录",
      "desc": "收集证件类型、证件号、姓名、手机号"
    },
    {
      "key": "consult",
      "title": "投诉、申诉、咨询",
      "desc": "收集账号、照片、相册中的图片/视频、沟通记录"
    },
    {
      "key": "location",
      "title": "定位相关功能",
      "desc": "收集位置信息"
    },
    {
      "key": "call",
      "title": "拨打联系人电话",
      "desc": "收集设备通话状态"
    }
  ],
  "permissionScenes": [
    {
      "key": "location",
      "title": "位置",
      "desc": "用于便捷切换所在城市、按距离排序产品、推荐周边产品、天气查询"
    },
    {
      "key": "microphone",
      "title": "麦克风",
      "desc": "用于音视频通话、语音搜索、与智能助手对话"
    },
    {
      "key": "camera",
      "title": "相机",
      "desc": "用于扫码、拍摄"
    },
    {
      "key": "album",
      "title": "相册",
      "desc": "用于上传照片、保存照片"
    }
  ]
}
```

前端也可写死该结构；接口便于法务改文案。

---

### 28. 个人信息收集清单

| 项 | 内容 |
|----|------|
| **接口名称** | 个人信息收集清单 |
| **方法** | `GET` |
| **路径** | `/api/v1/legal/collect-list` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "updatedAt": "2026-09-18",
  "effectiveAt": "2026-09-18",
  "rows": [
    {
      "scene": "账户注册、登录",
      "dataTypes": "证件类型、证件号、姓名、手机号",
      "purpose": "用户注册与登录过程中的认证。",
      "method": "用户输入"
    },
    {
      "scene": "投诉、申诉、咨询",
      "dataTypes": "账号、照片、相册中的图片/视频、沟通记录",
      "purpose": "确保账号与系统安全、提供证明材料、解决咨询并改善客服质量",
      "method": "用户输入、小程序收集"
    },
    {
      "scene": "定位相关功能",
      "dataTypes": "位置信息",
      "purpose": "提供精准位置服务或匹配就近服务",
      "method": "小程序收集"
    },
    {
      "scene": "拨打联系人电话",
      "dataTypes": "设备通话状态",
      "purpose": "提供编辑和电话拨号服务",
      "method": "小程序收集"
    },
    {
      "scene": "小程序使用过程",
      "dataTypes": "页面浏览记录、功能点击记录",
      "purpose": "优化产品服务、提升体验",
      "method": "小程序收集"
    }
  ]
}
```

---

### 29. 应用权限说明

| 项 | 内容 |
|----|------|
| **接口名称** | 应用权限说明 |
| **方法** | `GET` |
| **路径** | `/api/v1/legal/permissions` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "preamble": [
    "为保障小程序产品功能实现与安全运行，我们可能会申请或使用操作系统的相关权限；",
    "为保障您的知情权，我们通过下列列表将产品可能申请、使用的相关操作系统权限进行展示，您可以根据实际需要对相关权限进行管理；",
    "根据产品的升级，申请、使用权限的类型与目的可能会有变动，我们将及时根据这些变动对列表进行调整；",
    "请您知悉，我们为业务与产品的功能与安全需要，可能会使用第三方及关联方 SDK，这些第三方也可能会申请或使用相关操作系统权限；",
    "在使用产品的过程中，您可能会使用第三方开发的 H5 页面或小程序，这些第三方也可能因业务功能所必须而申请或使用相关操作系统权限。"
  ],
  "rows": [
    {
      "permission": "读写设备存储",
      "feature": "在您选择上传或下载文件",
      "purpose": "上传、下载文件",
      "timing": "使用上传、下载文件相关的应用时"
    },
    {
      "permission": "设备信息",
      "feature": "获取应用安装列表、运行中的进程、设备标识、常用设备等",
      "purpose": "关联应用唤起、行为记录、登录设备提醒等",
      "timing": "应用启动时、第三方登录、应用分享时"
    },
    {
      "permission": "读取日志文件",
      "feature": "调试页面打印启动时间",
      "purpose": "优化产品启动时间",
      "timing": "应用启动时"
    },
    {
      "permission": "麦克风",
      "feature": "同意并使用录音",
      "purpose": "音视频通话、语音搜索、与智能助手对话",
      "timing": "使用音视频通话、语音搜索、智能助手对话时"
    },
    {
      "permission": "剪切板",
      "feature": "登录、分享",
      "purpose": "复制、分享剪贴板中的信息，如应用链接、验证码等",
      "timing": "验证码登录、分享时"
    },
    {
      "permission": "相机",
      "feature": "更换头像、扫一扫、上传产品评价",
      "purpose": "获取实景照片，完成更换头像、扫码、上传评价",
      "timing": "使用更换头像、扫一扫、上传评价功能时"
    },
    {
      "permission": "相册",
      "feature": "更换头像、上传产品评价",
      "purpose": "选取相册照片",
      "timing": "使用更换头像、上传评价功能时"
    },
    {
      "permission": "定位",
      "feature": "基于地理位置的服务（LBS），如切换城市",
      "purpose": "自动切换区划、减少用户选择",
      "timing": "使用 LBS 相关功能时"
    }
  ]
}
```

---

### 30. 完整隐私政策

| 项 | 内容 |
|----|------|
| **接口名称** | 完整隐私政策 |
| **方法** | `GET` |
| **路径** | `/api/v1/legal/privacy` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "title": "隐私政策",
  "contentHtml": "<p>……完整正文……</p>"
}
```

上线前由法务提供 HTML。简要版「完整版」链接指向本接口内容页。

---

### 31. 上传评价媒体

| 项 | 内容 |
|----|------|
| **接口名称** | 上传评价媒体 |
| **接口说明** | 写评价专用。限制见 **1.5 C**。头像仍走接口 5。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/media` |
| **是否登录** | 是 |
| **Content-Type** | `multipart/form-data` |

#### 表单字段

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 单文件；多次请求拼 `images[]` |

#### 成功响应 `data`

```json
{
  "url": "https://cdn.example.com/review/1001-a.jpg",
  "kind": "image"
}
```

`kind`：`image` 或 `video`。超限或类型不对：`400`。

---

### 32. 添加收藏

| 项 | 内容 |
|----|------|
| **接口名称** | 添加收藏 |
| **接口说明** | 详情页调用，个人中心列表只读。见 **1.5 E**。已存在且未软删则幂等返回原记录；已软删则恢复。 |
| **方法** | `POST` |
| **路径** | `/api/v1/me/favorites` |
| **是否登录** | 是 |
| **对应表** | `favorites` |

#### Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetType | number | 是 | 1 poi / 2 routes / 3 guides / 4 article / 5 route_template |
| targetId | number | 是 | |
| tab | string | 是 | `spot` / `food` / `route` / `guide`，写入 `extra_info.tab` |
| extraInfo | object | 否 | 其它展示冗余（价格、作者等），与 `tab` 合并 |

后端同时写入 `target_name`、`target_image` 快照。

#### 成功响应 `data`

```json
{
  "favoriteId": 11,
  "tab": "spot",
  "targetType": 1,
  "targetId": 101
}
```

---

### 33. 取消收藏

| 项 | 内容 |
|----|------|
| **接口名称** | 取消收藏 |
| **接口说明** | 详情页取消；软删 `deleted_at`。个人中心一期列表可不调。 |
| **方法** | `DELETE` |
| **路径** | `/api/v1/me/favorites/{favoriteId}` |
| **是否登录** | 是 |
| **对应表** | `favorites` |

#### 成功响应 `data`

`null`

---

## 4. 错误响应示例

```json
{
  "code": 401,
  "message": "未登录或登录已过期",
  "data": null
}
```

---

## 5. 不改表时的字段用法

| 缺口 | 做法（现有列即可） |
|------|-------------------|
| `users` 无会员等级、无展示账号 | 接口层固定 `memberLevel: "普通会员"`；`account` 用 `wx_{userId}`，不落库 |
| 用户删除订单 | 写 `orders.snapshot.userHidden = true`，列表过滤该键 |
| `feedback` 无 title | 标题拼进 `content`：`【标题】\n正文` |
| 客服电话、关于我们、合规文案 | 无配置表则写进服务端配置/静态 JSON，不建表 |
| 门票凭证 | 已有 `ticket_voucher`；线路等用 `order_vouchers` |
| 收藏 Tab | 写入 `extra_info.tab`（`spot`/`food`/`route`/`guide`），不改表结构 |
| 证件号 | 不写入 `users`；只用 `travelers` / `order_travelers` |

---

## 6. 云部署提示

- 统一 Base URL 走 HTTPS；支付回调 URL 配为公网 `https://{host}/api/v1/payments/wx-notify`。  
- 头像与评价媒体走对象存储，接口只存 URL。  
- 微信 `appid` / `secret`、商户号、客服电话放环境变量，勿写入仓库。

---

*本文仅覆盖个人中心 C 端接口。购票下单、商家核销扫码、退款审核后台不在范围。*
