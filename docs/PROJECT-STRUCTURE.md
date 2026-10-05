# 项目结构

甘肃旅行小程序当前仓库。小程序端为微信小程序 TypeScript 工程，服务端为 NestJS + Prisma。

未列入：`node_modules`、`server/dist`、`server/uploads`、`.git`、编译缓存。`server/.env` 为本地环境变量，勿提交。

```
gansu_demo_together/
├── .cursor/
│   └── rules/
│       └── miniprogram-design-system.mdc
├── docs/
│   ├── charter/
│   │   ├── banner-link-type.md
│   │   └── PROJECT-STRUCTURE.md
│   ├── API-MVP.md
│   ├── gansu_travel3.sql
│   ├── miniprogram-design-system.md
│   ├── PRD-MVP.md
│   ├── PROJECT-STRUCTURE.md
│   ├── wireframe-poi-detail.html
│   └── 页面目录结构.md
├── miniprogram/
│   ├── api/
│   │   ├── modules/
│   │   │   ├── charter.ts
│   │   │   ├── content.ts
│   │   │   └── trip-manage.ts
│   │   ├── types/
│   │   │   └── user.ts
│   │   ├── amap.ts
│   │   ├── base.ts
│   │   └── request.ts
│   ├── components/
│   │   ├── tab-bar/
│   │   │   ├── tab-bar.json
│   │   │   ├── tab-bar.ts
│   │   │   ├── tab-bar.wxml
│   │   │   └── tab-bar.wxss
│   │   └── trip-manage-chrome/
│   │       ├── trip-manage.wxss
│   │       ├── trip-manage-chrome.json
│   │       ├── trip-manage-chrome.ts
│   │       ├── trip-manage-chrome.wxml
│   │       └── trip-manage-chrome.wxss
│   ├── pages/
│   │   ├── car-charter/
│   │   │   └── charter-index/
│   │   │       ├── charter-index.json
│   │   │       ├── charter-index.ts
│   │   │       ├── charter-index.wxml
│   │   │       └── charter-index.wxss
│   │   ├── discovery/
│   │   │   └── attraction/
│   │   │       ├── attraction-detail.json
│   │   │       ├── attraction-detail.ts
│   │   │       ├── attraction-detail.wxml
│   │   │       └── attraction-detail.wxss
│   │   ├── home/
│   │   │   ├── article-detail/
│   │   │   │   ├── article-detail.json
│   │   │   │   ├── article-detail.ts
│   │   │   │   ├── article-detail.wxml
│   │   │   │   └── article-detail.wxss
│   │   │   └── home-index/
│   │   │       ├── home-index.json
│   │   │       ├── home-index.ts
│   │   │       ├── home-index.wxml
│   │   │       └── home-index.wxss
│   │   ├── plan/
│   │   │   ├── plan-create/
│   │   │   │   ├── plan-create.json
│   │   │   │   ├── plan-create.ts
│   │   │   │   ├── plan-create.wxml
│   │   │   │   └── plan-create.wxss
│   │   │   ├── plan-index/
│   │   │   │   ├── plan-index.json
│   │   │   │   ├── plan-index.ts
│   │   │   │   ├── plan-index.wxml
│   │   │   │   └── plan-index.wxss
│   │   │   └── plan-switch/
│   │   │       ├── plan-switch.json
│   │   │       ├── plan-switch.ts
│   │   │       ├── plan-switch.wxml
│   │   │       └── plan-switch.wxss
│   │   ├── trip-manage/
│   │   │   ├── map/
│   │   │   │   ├── map.json
│   │   │   │   ├── map.ts
│   │   │   │   ├── map.wxml
│   │   │   │   └── map.wxss
│   │   │   ├── multi-day/
│   │   │   │   ├── multi-day.json
│   │   │   │   ├── multi-day.ts
│   │   │   │   ├── multi-day.wxml
│   │   │   │   └── multi-day.wxss
│   │   │   ├── overview/
│   │   │   │   ├── overview.json
│   │   │   │   ├── overview.ts
│   │   │   │   ├── overview.wxml
│   │   │   │   └── overview.wxss
│   │   │   ├── single-day/
│   │   │   │   ├── single-day.json
│   │   │   │   ├── single-day.ts
│   │   │   │   ├── single-day.wxml
│   │   │   │   └── single-day.wxss
│   │   │   └── summary/
│   │   │       ├── summary.json
│   │   │       ├── summary.ts
│   │   │       ├── summary.wxml
│   │   │       └── summary.wxss
│   │   └── trip-plan/
│   │       ├── chat/
│   │       │   ├── chat.json
│   │       │   ├── chat.ts
│   │       │   ├── chat.wxml
│   │       │   └── chat.wxss
│   │       └── plan-detail/
│   │           ├── plan-detail.json
│   │           ├── plan-detail.ts
│   │           ├── plan-detail.wxml
│   │           └── plan-detail.wxss
│   ├── static/
│   │   └── images/
│   │       ├── banner/
│   │       │   ├── 1.jpg
│   │       │   ├── 2.jpg
│   │       │   └── 3.jpg
│   │       ├── category/
│   │       │   ├── creative.jpg
│   │       │   ├── food.jpg
│   │       │   ├── food.png
│   │       │   ├── museum.jpg
│   │       │   ├── museum.png
│   │       │   ├── route.jpg
│   │       │   ├── route.png
│   │       │   ├── scenic.jpg
│   │       │   └── scenic.png
│   │       ├── charter/
│   │       │   ├── qinghaihu.jpg
│   │       │   └── taersi.jpg
│   │       ├── dest/
│   │       │   ├── dunhuang.jpg
│   │       │   ├── lanzhou.jpg
│   │       │   ├── tianshui.jpg
│   │       │   └── zhangye.jpg
│   │       ├── feed/
│   │       │   ├── gannan.jpg
│   │       │   ├── homestay.jpg
│   │       │   ├── jiayuguan.jpg
│   │       │   ├── mogao.jpg
│   │       │   ├── nightmarket.jpg
│   │       │   └── silkroad.jpg
│   │       ├── icon/
│   │       │   ├── ai.png
│   │       │   ├── close-line.svg
│   │       │   ├── image.png
│   │       │   ├── image.svg
│   │       │   ├── location-pin.svg
│   │       │   ├── route-line.png
│   │       │   ├── route-line.svg
│   │       │   ├── search.png
│   │       │   ├── search.svg
│   │       │   ├── tab-home.png
│   │       │   ├── tab-home.svg
│   │       │   ├── tab-home-active.png
│   │       │   ├── tab-home-active.svg
│   │       │   ├── tab-mine.png
│   │       │   ├── tab-mine.svg
│   │       │   ├── tab-mine-active.png
│   │       │   ├── tab-order.png
│   │       │   ├── tab-order-active.png
│   │       │   ├── tab-scenic.png
│   │       │   ├── tab-scenic.svg
│   │       │   ├── tab-scenic-active.png
│   │       │   ├── tab-trip.png
│   │       │   ├── tab-trip.svg
│   │       │   └── tab-trip-active.png
│   │       └── route/
│   │           ├── ganlong.jpg
│   │           ├── hexi.jpg
│   │           ├── huanghe.jpg
│   │           ├── panel-bg.jpg
│   │           └── silu.jpg
│   ├── utils/
│   │   ├── trip-manage-format.ts
│   │   ├── user-id.ts
│   │   └── util.ts
│   ├── app.json
│   ├── app.ts
│   ├── app.wxss
│   └── sitemap.json
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20260911080215_init/
│   │   │   │   └── migration.sql
│   │   │   ├── 20260920120000_itinerary/
│   │   │   │   └── migration.sql
│   │   │   ├── 20260920150000_add_charter_tables/
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── seed/
│   │   │   └── trip-manage.ts
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts/
│   │   ├── _probe-wx-html.js
│   │   ├── _wx-article.html
│   │   ├── import-wx-article.js
│   │   ├── import-wx-article-images.js
│   │   └── insert-test-article.js
│   ├── src/
│   │   ├── articles/
│   │   │   ├── articles.controller.ts
│   │   │   ├── articles.module.ts
│   │   │   └── articles.service.ts
│   │   ├── charter/
│   │   │   ├── charter.controller.ts
│   │   │   ├── charter.dto.ts
│   │   │   ├── charter.module.ts
│   │   │   └── charter.service.ts
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   └── response.interceptor.ts
│   │   │   └── utils/
│   │   │       └── serialize.ts
│   │   ├── health/
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   ├── home/
│   │   │   ├── home.controller.ts
│   │   │   ├── home.module.ts
│   │   │   └── home.service.ts
│   │   ├── mine/
│   │   │   ├── header-mine-user.adapter.ts
│   │   │   ├── mine.module.ts
│   │   │   └── mine-user.port.ts
│   │   ├── pois/
│   │   │   ├── pois.controller.ts
│   │   │   ├── pois.module.ts
│   │   │   └── pois.service.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── redis/
│   │   │   ├── redis.module.ts
│   │   │   └── redis.service.ts
│   │   ├── routes/
│   │   │   ├── routes.controller.ts
│   │   │   ├── routes.module.ts
│   │   │   └── routes.service.ts
│   │   ├── search/
│   │   │   ├── search.controller.ts
│   │   │   ├── search.module.ts
│   │   │   └── search.service.ts
│   │   ├── trip-manage/
│   │   │   ├── dto/
│   │   │   │   └── trip-manage.dto.ts
│   │   │   ├── trip-manage.controller.ts
│   │   │   ├── trip-manage.mapper.ts
│   │   │   ├── trip-manage.module.ts
│   │   │   └── trip-manage.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── .env.example
│   ├── .gitignore
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── typings/
│   ├── types/
│   │   ├── wx/
│   │   │   ├── index.d.ts
│   │   │   ├── lib.wx.api.d.ts
│   │   │   ├── lib.wx.app.d.ts
│   │   │   ├── lib.wx.behavior.d.ts
│   │   │   ├── lib.wx.cloud.d.ts
│   │   │   ├── lib.wx.component.d.ts
│   │   │   ├── lib.wx.event.d.ts
│   │   │   └── lib.wx.page.d.ts
│   │   └── index.d.ts
│   └── index.d.ts
├── .gitignore
├── docker-compose.yml
├── package.json
├── project.config.json
├── project.private.config.json
└── tsconfig.json
```

## 目录说明

| 路径 | 说明 |
| --- | --- |
| `miniprogram/pages/home/` | 首页、文章详情 |
| `miniprogram/pages/trip-manage/` | 行程管理：多日、单日、地图、总览、总结 |
| `miniprogram/pages/plan/` | 我的方案集 |
| `miniprogram/pages/trip-plan/` | 行程规划对话与方案详情 |
| `miniprogram/pages/car-charter/charter-index/` | 包车首页 |
| `miniprogram/pages/discovery/attraction/` | 景点详情 |
| `miniprogram/components/tab-bar/` | 底部导航。首页、行程管理、服务（包车）已接入 |
| `miniprogram/api/` | 小程序请求封装。模块为首页内容、行程、包车 |
| `server/src/home/` 等 | 首页、文章、景点、线路、搜索 |
| `server/src/trip-manage/` | 行程管理接口，路由前缀 `/itinerary` |
| `server/src/charter/` | 包车线路接口，路由前缀 `/charter` |
| `server/src/mine/` | 临时从请求头读取用户，不是「我的」页面 |
| `server/prisma/` | 数据模型、迁移与种子。种子含首页、行程和包车 |
| `docs/页面目录结构.md` | 计划中的完整页面目录，尚未全部落地 |
| `docs/charter/` | 包车模块结构说明，以及轮播 `linkType` 约定 |
| `docker-compose.yml` | 本地 MySQL（3308）与 Redis（6380） |
