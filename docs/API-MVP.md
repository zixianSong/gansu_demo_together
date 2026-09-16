# 接口文档 — 甘肃旅游微信小程序（MVP）

> **文档状态**：可指导前后端联调  
> **依据**：`docs/PRD-MVP.md` + `gansu_travel3.sql`  
> **技术栈**：TypeScript + NestJS + MySQL（云服务器部署）  
> **版本**：MVP v1.1  
> **更新日期**：2026-09-08

---

## 1. 文档约定

| 项 | 约定 |
|----|------|
| Base URL | `https://{host}/api/v1` |
| 协议 | HTTPS + JSON（`Content-Type: application/json`） |
| 鉴权（MVP） | 下列接口**均不强制登录** |
| 时间格式 | ISO 8601，如 `2026-09-08T12:00:00+08:00` |
| ID 类型 | `number`（对应 MySQL `bigint`） |
| 分页 | `page` 从 1 起；`pageSize` 默认 `10`，最大 `50` |
| 数据可见性 | 仅返回 `deleted_at IS NULL` 且业务 `status = 1`（上架/展示）的数据 |
| 字段命名 | 响应体使用 **camelCase**；库表为 snake_case，由后端映射 |
| MVP 范围 | 仅 C 端「发现 + 内容」；行程 / AI / 订单 / 司机 / 运营后台接口不在本文档 |

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
| 404 | 资源不存在或已下架 |
| 500 | 服务器错误 |

### 1.2 分页结构（列表类 `data`）

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

### 1.3 枚举速查

**文章 `contentType`（`article.content_type`）**

| 值 | 说明 | MVP 瀑布流 |
|----|------|------------|
| `guide` | 攻略 | ✅ 展示 |
| `travelogue` | 游记 | ✅ 展示 |
| 其他（如 `destination_intro` / `food` 等） | 库表预留 | ❌ 瀑布流不返回；搜索文章时可按实现决定是否纳入（建议 MVP 搜索文章也仅 `guide`/`travelogue`） |

**POI `category`（`poi.category`）**

| 值 | 说明 | 搜索类型标签 |
|----|------|----------------|
| `scenic` | 景区 | 景点 |
| `museum` | 文博场馆 | 景点（或单独「文博」，MVP 建议归入「景点」标签文案由前端映射） |
| `food` | 美食 | 美食 |

**轮播 `linkType`（`banner.link_type`）— MVP 支持范围**

| 值 | 前端行为 | MVP |
|----|----------|-----|
| `none` | 不可跳转 | ✅ |
| `article` | 站内文章详情，`linkId` = `article.id` | ✅ |
| `poi` | 地点基础详情，`linkId` = `poi.id` | ✅ |
| `route` | 线路模板详情，`linkId` = `route_template.id` | ✅ |
| `webview` | 小程序内 web-view 打开 `linkPath`（https H5） | ✅ 外链**仅此** |
| `destination` | — | ❌ 不支持；若库中误配，前端当 `none` / 忽略 |
| `mini_page` | 跳转其他小程序 | ❌ **二期**；若库中误配，前端当 `none` / 忽略 |

**搜索结果 `type`**

| 值 | 含义 | 前端标签文案 | 跳转 |
|----|------|--------------|------|
| `poi` | 景点（含 scenic/museum） | 景点 | 地点详情页 |
| `food` | 美食（`poi.category = food`） | 美食 | 地点详情页 |
| `route` | 线路模板 | 线路 | 线路详情页 |
| `article` | 攻略/游记 | 文章 | 文章详情页 |

---

## 2. 接口一览

| 序号 | 接口名称 | 方法 | 路径 |
|------|----------|------|------|
| 0 | 健康检查 | GET | `/api/v1/health` |
| 1 | 首页轮播列表 | GET | `/api/v1/home/banners` |
| 2 | 首页热门目的地列表 | GET | `/api/v1/home/hot-destinations` |
| 3 | 首页热门线路列表 | GET | `/api/v1/home/hot-routes` |
| 4 | 瀑布流文章列表 | GET | `/api/v1/home/feed` |
| 5 | 获取文章详情 | GET | `/api/v1/articles/{id}` |
| 6 | 文章关联地点列表 | GET | `/api/v1/articles/{id}/pois` |
| 7 | 文章关联线路列表 | GET | `/api/v1/articles/{id}/routes` |
| 8 | 地点（POI）基础详情 | GET | `/api/v1/pois/{id}` |
| 9 | 线路模板基础详情 | GET | `/api/v1/routes/{id}` |
| 10 | 综合搜索 | GET | `/api/v1/search` |

---

## 3. 接口详情

### 0. 健康检查

| 项 | 内容 |
|----|------|
| **接口名称** | 健康检查 |
| **接口说明** | 探活，便于云服务器 / 网关探活与联调确认服务可用 |
| **方法** | `GET` |
| **路径** | `/api/v1/health` |
| **是否登录** | 否 |

#### 成功响应 `data`

```json
{
  "status": "up",
  "timestamp": "2026-09-08T20:00:00+08:00"
}
```

---

### 1. 首页轮播列表

| 项 | 内容 |
|----|------|
| **接口名称** | 首页轮播列表 |
| **接口说明** | 返回当前可展示的轮播；前端按 `linkType` 分流：**站内** article/poi/route，**外链仅** webview |
| **方法** | `GET` |
| **路径** | `/api/v1/home/banners` |
| **是否登录** | 否 |
| **对应表** | `banner` |

#### Query 参数

无

#### 请求示例

```http
GET /api/v1/home/banners
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "id": 1,
      "title": "丝路攻略推荐",
      "imageUrl": "https://cdn.example.com/banner/1.jpg",
      "linkType": "article",
      "linkId": 1001,
      "linkPath": null,
      "sortOrder": 0
    },
    {
      "id": 2,
      "title": "莫高窟",
      "imageUrl": "https://cdn.example.com/banner/2.jpg",
      "linkType": "poi",
      "linkId": 101,
      "linkPath": null,
      "sortOrder": 1
    },
    {
      "id": 3,
      "title": "活动 H5",
      "imageUrl": "https://cdn.example.com/banner/3.jpg",
      "linkType": "webview",
      "linkId": null,
      "linkPath": "https://example.com/activity",
      "sortOrder": 2
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | 轮播 ID | `banner.id` |
| title | string \| null | 标题 | `banner.title` |
| imageUrl | string | 图片 | `banner.image_url` |
| linkType | string | 见枚举；MVP 有效值：`none`/`article`/`poi`/`route`/`webview` | `banner.link_type` |
| linkId | number \| null | 站内实体 ID（article/poi/route） | `banner.link_id` |
| linkPath | string \| null | 仅 `webview` 时为 https URL | `banner.link_path` |
| sortOrder | number | 排序，越小越靠前 | `banner.sort_order` |

#### 业务规则

1. 过滤条件：`status = 1` 且 `deleted_at IS NULL`；若配置了 `start_at` / `end_at`，仅返回当前时间落在窗口内的记录（`NULL` 表示不限制）。  
2. 排序：`sort_order ASC`，同序按 `id ASC`。  
3. **MVP 支持的跳转**：`article` / `poi` / `route`（站内，依赖 `linkId`）；`webview`（外链 H5，依赖 `linkPath`）；`none`（不可点）。  
4. **MVP 不支持**：`mini_page`、`destination`。后端可过滤不返回，或原样返回由前端按 `none` 处理。  
5. `linkType = webview`：前端打开 web-view 页加载 `linkPath`（须 https；体验版/正式需配置业务域名，本地可先不校验）。  
6. 站内类型若 `linkId` 为空：前端视为不可点。

---

### 2. 首页热门目的地列表

| 项 | 内容 |
|----|------|
| **接口名称** | 首页热门目的地列表 |
| **接口说明** | 供首页「热门目的地」卡片**只读展示**；MVP **不可点击进详情** |
| **方法** | `GET` |
| **路径** | `/api/v1/home/hot-destinations` |
| **是否登录** | 否 |
| **对应表** | `home_hot_destination`、`destination` |

#### Query 参数

| 参数名 | 类型 | 必填 | 默认 | 说明 |
|--------|------|------|------|------|
| limit | number | 否 | 4 | 返回条数，最大 20 |

#### 请求示例

```http
GET /api/v1/home/hot-destinations?limit=4
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "id": 10,
      "destinationId": 1,
      "name": "兰州",
      "coverUrl": "https://cdn.example.com/dest/lanzhou.jpg",
      "sortOrder": 0
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | 配置行 ID | `home_hot_destination.id` |
| destinationId | number | 目的地 ID | `home_hot_destination.destination_id` |
| name | string | 展示名 | `destination.name` |
| coverUrl | string \| null | 封面，优先覆盖图 | `COALESCE(cover_override, destination.cover_url)` |
| sortOrder | number | 排序 | `home_hot_destination.sort_order` |

#### 业务规则

1. `home_hot_destination.status = 1` 且未删除；关联 `destination.status = 1` 且未删除。  
2. 排序：`home_hot_destination.sort_order ASC`。  
3. MVP 前端仅展示，不调用目的地详情接口。

---

### 3. 首页热门线路列表

| 项 | 内容 |
|----|------|
| **接口名称** | 首页热门线路列表 |
| **接口说明** | 供首页「热门线路」卡片**只读展示**；MVP **不可点击** |
| **方法** | `GET` |
| **路径** | `/api/v1/home/hot-routes` |
| **是否登录** | 否 |
| **对应表** | `home_hot_route`、`route_template` |

#### Query 参数

| 参数名 | 类型 | 必填 | 默认 | 说明 |
|--------|------|------|------|------|
| limit | number | 否 | 4 | 返回条数，最大 20 |

#### 请求示例

```http
GET /api/v1/home/hot-routes?limit=4
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "id": 20,
      "routeId": 5,
      "name": "漫游河西走廊",
      "coverUrl": "https://cdn.example.com/route/hexi.jpg",
      "sortOrder": 0
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | 配置行 ID | `home_hot_route.id` |
| routeId | number | 线路模板 ID | `home_hot_route.route_id` → `route_template.id` |
| name | string | 名称 | `route_template.name` |
| coverUrl | string \| null | 封面 | `COALESCE(cover_override, route_template.cover_url)` |
| sortOrder | number | 排序 | `home_hot_route.sort_order` |

#### 业务规则

1. 配置与模板均需上架且未删除。  
2. 排序：`sort_order ASC`。  
3. MVP 前端仅展示。

---

### 4. 瀑布流文章列表

| 项 | 内容 |
|----|------|
| **接口名称** | 瀑布流文章列表 |
| **接口说明** | 首页瀑布流；**仅**返回攻略/游记（`guide` / `travelogue`） |
| **方法** | `GET` |
| **路径** | `/api/v1/home/feed` |
| **是否登录** | 否 |
| **对应表** | `article` |

#### Query 参数

| 参数名 | 类型 | 必填 | 默认 | 说明 |
|--------|------|------|------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页条数，最大 50 |

#### 请求示例

```http
GET /api/v1/home/feed?page=1&pageSize=10
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "id": 1001,
      "title": "探秘丝绸之路，感受千年文化",
      "coverUrl": "https://cdn.example.com/feed/silkroad.jpg",
      "contentType": "guide",
      "author": "环甘肃游",
      "publishedAt": "2026-09-01T10:00:00+08:00",
      "tags": ["丝路", "攻略"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 26
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | 文章 ID | `article.id` |
| title | string | 标题 | `article.title` |
| coverUrl | string \| null | 封面 | `article.cover_url` |
| contentType | string | `guide` \| `travelogue` | `article.content_type` |
| author | string \| null | 作者 | `article.author` |
| publishedAt | string \| null | 发布时间 | `article.published_at` |
| tags | string[] | 标签 | `article.tags_json` |

#### 业务规则

1. `status = 1` 且 `deleted_at IS NULL`。  
2. `content_type IN ('guide', 'travelogue')`。  
3. **排序（已拍板）**：`published_at DESC`，空发布时间靠后，再按 `id DESC`。  
4. **不返回** `contentHtml`（详情接口再取），减轻列表体积。  
5. 无效/下架文章不出现在列表（对应 PRD「不展示/下架」）。

---

### 5. 获取文章详情

| 项 | 内容 |
|----|------|
| **接口名称** | 获取文章详情 |
| **接口说明** | 文章详情页正文；`hasRelatedPois` / `hasRelatedRoutes` 控制「提及地点/线路」入口显隐 |
| **方法** | `GET` |
| **路径** | `/api/v1/articles/{id}` |
| **是否登录** | 否 |
| **对应表** | `article`（及关联存在性查询 `article_poi` / `article_route`） |

#### Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | `article.id` |

#### 请求示例

```http
GET /api/v1/articles/1001
```

#### 成功响应 `data`

```json
{
  "id": 1001,
  "title": "探秘丝绸之路，感受千年文化",
  "coverUrl": "https://cdn.example.com/feed/silkroad.jpg",
  "contentType": "guide",
  "contentHtml": "<p>正文 HTML…</p>",
  "author": "环甘肃游",
  "publishedAt": "2026-09-01T10:00:00+08:00",
  "tags": ["丝路", "攻略"],
  "hasRelatedPois": true,
  "hasRelatedRoutes": false
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | 文章 ID | `article.id` |
| title | string | 标题 | `article.title` |
| coverUrl | string \| null | 封面 | `article.cover_url` |
| contentType | string | 类型 | `article.content_type` |
| contentHtml | string \| null | 正文 HTML | `article.content_html` |
| author | string \| null | 作者 | `article.author` |
| publishedAt | string \| null | 发布时间 | `article.published_at` |
| tags | string[] | 标签 | `article.tags_json` |
| hasRelatedPois | boolean | 是否有提及地点 | `EXISTS article_poi` |
| hasRelatedRoutes | boolean | 是否有提及线路 | `EXISTS article_route` |

#### 业务规则

1. 仅上架未删除；否则 `404`，`message`: `文章不存在或已下架`。  
2. 关联列表不在本接口全量返回，见接口 6、7。  
3. MVP 可不对 C 端暴露 `wechat_url` / `wechat_msg_id`。

#### 错误示例

```json
{
  "code": 404,
  "message": "文章不存在或已下架",
  "data": null
}
```

---

### 6. 文章关联地点列表

| 项 | 内容 |
|----|------|
| **接口名称** | 文章关联地点列表 |
| **接口说明** | 「提及地点」页内弹层数据；点击单项进 POI 基础详情 |
| **方法** | `GET` |
| **路径** | `/api/v1/articles/{id}/pois` |
| **是否登录** | 否 |
| **对应表** | `article_poi`、`poi` |

#### Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 文章 ID |

#### Query 参数

无（关联数量通常较少；若需分页后续再加）

#### 请求示例

```http
GET /api/v1/articles/1001/pois
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "poiId": 101,
      "name": "敦煌莫高窟",
      "coverUrl": "https://cdn.example.com/poi/mogao.jpg",
      "category": "scenic",
      "city": "敦煌市",
      "address": "甘肃省敦煌市莫高窟",
      "sortOrder": 0
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| poiId | number | 地点 ID | `article_poi.poi_id` |
| name | string | 名称 | `poi.name` |
| coverUrl | string \| null | 封面 | `poi.cover_url` |
| category | string | scenic/museum/food | `poi.category` |
| city | string \| null | 城市 | `poi.city` |
| address | string \| null | 地址 | `poi.address` |
| sortOrder | number | 展示序 | `article_poi.sort_order` |

#### 业务规则

1. 文章须存在且上架；否则 `404`。  
2. 仅返回关联 POI 中 `status = 1` 且未删除的记录。  
3. 排序：`article_poi.sort_order ASC`。  
4. 无关联时返回 `list: []`（HTTP 200，`code: 0`）。

---

### 7. 文章关联线路列表

| 项 | 内容 |
|----|------|
| **接口名称** | 文章关联线路列表 |
| **接口说明** | 「提及线路」页内弹层；点击进线路模板基础详情 |
| **方法** | `GET` |
| **路径** | `/api/v1/articles/{id}/routes` |
| **是否登录** | 否 |
| **对应表** | `article_route`、`route_template` |

#### Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 文章 ID |

#### 请求示例

```http
GET /api/v1/articles/1001/routes
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "routeId": 5,
      "name": "漫游河西走廊",
      "coverUrl": "https://cdn.example.com/route/hexi.jpg",
      "subtitle": "经典河西四日",
      "daysCount": 4,
      "sortOrder": 0
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| routeId | number | 线路模板 ID | `article_route.route_id` |
| name | string | 名称 | `route_template.name` |
| coverUrl | string \| null | 封面 | `route_template.cover_url` |
| subtitle | string \| null | 副标题 | `route_template.subtitle` |
| daysCount | number | 天数 | `route_template.days_count` |
| sortOrder | number | 展示序 | `article_route.sort_order` |

#### 业务规则

1. 文章须上架存在。  
2. 仅上架未删除的 `route_template`。  
3. 排序：`article_route.sort_order ASC`。  
4. 空列表返回 `list: []`。

---

### 8. 地点（POI）基础详情

| 项 | 内容 |
|----|------|
| **接口名称** | 地点（POI）基础详情 |
| **接口说明** | MVP 地点详情仅基础信息：名称、封面、简介、地址（及便于展示的类型/城市） |
| **方法** | `GET` |
| **路径** | `/api/v1/pois/{id}` |
| **是否登录** | 否 |
| **对应表** | `poi` |

#### Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | `poi.id` |

#### 请求示例

```http
GET /api/v1/pois/101
```

#### 成功响应 `data`

```json
{
  "id": 101,
  "name": "敦煌莫高窟",
  "coverUrl": "https://cdn.example.com/poi/mogao.jpg",
  "intro": "世界文化遗产…",
  "address": "甘肃省敦煌市莫高窟",
  "category": "scenic",
  "city": "敦煌市"
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | POI ID | `poi.id` |
| name | string | 名称 | `poi.name` |
| coverUrl | string \| null | 封面 | `poi.cover_url` |
| intro | string \| null | 简介 | `poi.intro` |
| address | string \| null | 地址 | `poi.address` |
| category | string | scenic/museum/food | `poi.category` |
| city | string \| null | 城市 | `poi.city` |

#### 业务规则

1. `status = 1` 且未删除，否则 `404`，`message`: `地点不存在或已下架`。  
2. MVP **不返回**交通指南、推荐矩阵、门票下单字段（即使表中有 `booking_*` / `price` 等，本期可不暴露或前端忽略）。  
3. 美食、景区、文博统一走本接口；前端可用 `category` 展示标签。

---

### 9. 线路模板基础详情

| 项 | 内容 |
|----|------|
| **接口名称** | 线路模板基础详情 |
| **接口说明** | 搜索或文章关联进入的线路基础介绍；**不含**「加入方案集」 |
| **方法** | `GET` |
| **路径** | `/api/v1/routes/{id}` |
| **是否登录** | 否 |
| **对应表** | `route_template` |

> 说明：路径中的 `routes` 对应表 **`route_template`**（行程模板），不是可售精品表 `routes`。

#### Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | `route_template.id` |

#### 请求示例

```http
GET /api/v1/routes/5
```

#### 成功响应 `data`

```json
{
  "id": 5,
  "name": "漫游河西走廊",
  "coverUrl": "https://cdn.example.com/route/hexi.jpg",
  "intro": "串联敦煌、嘉峪关、张掖的经典玩法…",
  "address": null,
  "subtitle": "经典河西四日",
  "daysCount": 4,
  "destinationId": 2
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| id | number | 模板 ID | `route_template.id` |
| name | string | 名称 | `route_template.name` |
| coverUrl | string \| null | 封面 | `route_template.cover_url` |
| intro | string \| null | 简介（对齐 PRD「简介」） | `route_template.intro` |
| address | string \| null | 地址（模板无地址字段，固定 `null`，便于与 POI 详情结构对齐） | — |
| subtitle | string \| null | 副标题 | `route_template.subtitle` |
| daysCount | number | 天数 | `route_template.days_count` |
| destinationId | number \| null | 关联目的地 | `route_template.destination_id` |

#### 业务规则

1. 上架未删除，否则 `404`。  
2. MVP 不返回每日行程明细、地图、加入方案集相关能力。

---

### 10. 综合搜索

| 项 | 内容 |
|----|------|
| **接口名称** | 综合搜索 |
| **接口说明** | 单列表返回景点、线路、美食、文章；每条带 `type` 标签供前端展示与跳转 |
| **方法** | `GET` |
| **路径** | `/api/v1/search` |
| **是否登录** | 否 |
| **对应表** | `poi`、`route_template`、`article` |

#### Query 参数

| 参数名 | 类型 | 必填 | 默认 | 说明 |
|--------|------|------|------|------|
| keyword | string | 是 | — | 关键词；去首尾空格后长度 1–50，否则 `400` |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页条数，最大 50 |
| type | string | 否 | 全部 | 可选过滤：`poi` \| `food` \| `route` \| `article`；不传则四类都搜 |

#### 请求示例

```http
GET /api/v1/search?keyword=敦煌&page=1&pageSize=10
```

#### 成功响应 `data`

```json
{
  "list": [
    {
      "type": "poi",
      "id": 101,
      "title": "敦煌莫高窟",
      "coverUrl": "https://cdn.example.com/poi/mogao.jpg",
      "subtitle": "敦煌市",
      "category": "scenic"
    },
    {
      "type": "food",
      "id": 201,
      "title": "兰州牛肉面",
      "coverUrl": "https://cdn.example.com/poi/beefnoodle.jpg",
      "subtitle": "兰州市",
      "category": "food"
    },
    {
      "type": "route",
      "id": 5,
      "title": "寻迹丝路古道",
      "coverUrl": "https://cdn.example.com/route/silu.jpg",
      "subtitle": "4天",
      "category": null
    },
    {
      "type": "article",
      "id": 1001,
      "title": "探秘丝绸之路，感受千年文化",
      "coverUrl": "https://cdn.example.com/feed/silkroad.jpg",
      "subtitle": "攻略",
      "category": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 4
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | `poi` / `food` / `route` / `article`（前端类型标签） |
| id | number | 对应实体 ID |
| title | string | 主标题（名称或文章标题） |
| coverUrl | string \| null | 封面 |
| subtitle | string \| null | 辅助信息（城市 / 天数 / 文章类型文案等） |
| category | string \| null | POI 时为 `scenic`/`museum`/`food`；其他为 `null` |

#### 匹配与归类规则（MVP）

| type | 数据来源 | 匹配字段 | 备注 |
|------|----------|----------|------|
| `poi` | `poi` 且 `category IN ('scenic','museum')` | `name` **模糊** `LIKE %keyword%` | 标签「景点」 |
| `food` | `poi` 且 `category = 'food'` | `name` **模糊** | 标签「美食」；详情 `/pois/{id}` |
| `route` | `route_template` | `name` **模糊** | 标签「线路」 |
| `article` | `article` 且 `content_type IN ('guide','travelogue')` | `title` **模糊** | 标签「文章」；**不搜** `content_html` |

#### 业务规则

1. 仅上架未删除数据。  
2. `keyword` 为空或超长：`400`，`message`: `请输入有效关键词`。  
3. **混合分页（已拍板）**：对各类型分别查询后，按固定优先级合并：`article` → `poi` → `food` → `route`，再对合并结果做 `page` / `pageSize` 切片；`total` 为合并后的总条数。  
4. 无结果：`list: []`，`total: 0`。  
5. 不使用已标注待废弃的 `foods` 表；美食统一查 `poi`。

#### 前端跳转约定

| type | 跳转 |
|------|------|
| `poi` / `food` | `GET` 详情页对应 `/api/v1/pois/{id}` |
| `route` | `/api/v1/routes/{id}` |
| `article` | `/api/v1/articles/{id}` |

---

## 4. 与 PRD 功能映射

| PRD 需求 ID | 接口 |
|-------------|------|
| F-HOME-01 搜索 | #10 |
| F-HOME-02 轮播 | #1（站内 + webview；无 mini_page） |
| F-HOME-05 热门只读 | #2、#3 |
| F-HOME-06 瀑布流 | #4 |
| F-ART-01～05 文章与关联 | #5、#6、#7 |
| F-POI / F-ROUTE 基础详情 | #8、#9 |
| F-LINK 外链 | #1 的 `webview` + 前端 web-view 页 |
| F-HOME-03/04/07、F-TAB 占位 | 无业务接口；前端 Toast「即将上线」 |
| 行程 / AI / 后台 / mini_page | 不在 MVP |

---

## 5. 页面 — 接口对照与空态约定

> 占位统一文案：**「即将上线」**（`wx.showToast`）。

### 5.1 页面 × 接口矩阵

| 页面 | 模块 / 行为 | 接口 | 备注 |
|------|-------------|------|------|
| 首页 | 轮播 | `GET /home/banners` | 按 linkType 跳转 |
| 首页 | 热门目的地 | `GET /home/hot-destinations` | **只展示，不可点** |
| 首页 | 热门线路 | `GET /home/hot-routes` | **只展示，不可点** |
| 首页 | 瀑布流 | `GET /home/feed` | 点击进文章详情 |
| 首页 | 搜索入口 | — | 跳转搜索页，不调接口 |
| 首页 | 分类导航 | — | 占位；点击 Toast「即将上线」 |
| 首页 | 行程提示区 | — | 占位；可点则 Toast「即将上线」 |
| 首页 | AI 悬浮球 | — | 占位；点击 Toast「即将上线」 |
| 搜索结果页 | 输入关键词搜索 | `GET /search` | |
| 文章详情页 | 正文 | `GET /articles/{id}` | |
| 文章详情页 | 提及地点弹层 | `GET /articles/{id}/pois` | 有 `hasRelatedPois` 才展示入口 |
| 文章详情页 | 提及线路弹层 | `GET /articles/{id}/routes` | 有 `hasRelatedRoutes` 才展示入口 |
| 地点详情页 | 基础信息 | `GET /pois/{id}` | 景点/美食均用此 |
| 线路详情页 | 基础信息 | `GET /routes/{id}` | 可展示天数 |
| web-view 页 | 打开 H5 | — | 入参为轮播下发的 `linkPath` |
| 行程管理 / 服务 / 我的 | 整页 | — | 占位页或进入时 Toast「即将上线」 |

### 5.2 轮播点击路由（前端）

| linkType | 行为 |
|----------|------|
| `article` | 打开文章详情，`id = linkId` |
| `poi` | 打开地点详情，`id = linkId` |
| `route` | 打开线路详情，`id = linkId` |
| `webview` | 打开 web-view 页，`url = linkPath` |
| `none` / 其他 / 缺参 | 不跳转（可选无提示） |

### 5.3 空态 / 错误态

| 场景 | 条件 | 用户侧表现（建议文案） |
|------|------|------------------------|
| 瀑布流为空 | `list.length === 0` | 页内空态：「暂无内容」 |
| 热门目的地/线路为空 | `list.length === 0` | 隐藏该区块，或展示「暂无推荐」 |
| 轮播为空 | `list.length === 0` | 隐藏轮播区域 |
| 搜索无结果 | `list.length === 0` | 「未找到相关结果」 |
| 搜索关键词非法 | `code === 400` | Toast：接口 `message` 或「请输入有效关键词」 |
| 文章不存在/下架 | `code === 404` | Toast「文章不存在或已下架」并返回上一页 |
| 地点/线路不存在 | `code === 404` | Toast「内容不存在或已下架」并返回 |
| 提及地点列表为空 | `list: []` | 弹层内：「暂无关联地点」（一般不展示入口） |
| 提及线路列表为空 | `list: []` | 弹层内：「暂无关联线路」 |
| 网络失败 / 500 | 请求失败或 `code === 500` | Toast「网络异常，请稍后重试」；列表可下拉重试 |
| 占位模块 | 点击 | Toast「即将上线」 |

### 5.4 加载态

| 场景 | 建议 |
|------|------|
| 首页首屏 | 轮播/热门/瀑布流可并行请求；分区 loading 或统一骨架 |
| 瀑布流翻页 | 底部 loading，失败可点重试 |
| 文章详情 | 页内 loading，成功后再渲染正文 |
| 关联弹层 | 打开弹层时请求；弹层内短 loading |

---

## 6. NestJS 模块建议（非强制）

| 模块 | Controller 前缀 | 职责 |
|------|-----------------|------|
| `HealthModule` | `health` | 探活 |
| `HomeModule` | `home` | banners / hot-destinations / hot-routes / feed |
| `ArticleModule` | `articles` | 详情与关联列表 |
| `PoiModule` | `pois` | POI 详情 |
| `RouteModule` | `routes` | route_template 详情 |
| `SearchModule` | `search` | 综合搜索 |

全局：`ValidationPipe`、统一异常过滤器映射为本文 `code/message` 结构。

---

## 7. 联调数据说明（无正式种子 SQL 文档）

本期**不提供**独立种子 SQL 文档。联调时由开发在库中**手工插入**测试数据即可，建议覆盖：

1. `banner`：至少各 1 条 `article` / `poi` / `route` / `webview`  
2. `article`：若干 `guide`/`travelogue`，含 `content_html`  
3. `article_poi` / `article_route`：至少 1 篇文章有关联  
4. `poi`：scenic / museum / food 各若干  
5. `route_template` + `home_hot_route`；`destination` + `home_hot_destination`  

---

## 8. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-09-08 | 首版，覆盖 MVP 发现与内容全部 C 端接口 |
| v1.1 | 2026-09-08 | 轮播外链仅 webview；增加页面对照与空态；固化搜索/排序/分页约定 |
