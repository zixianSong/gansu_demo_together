# 项目结构

甘肃旅行小程序（包车）仓库。小程序端为微信小程序 TypeScript 工程，服务端为 NestJS + Prisma。

未列入：`node_modules`、`server/dist`、编译缓存。`server/.env` 为本地环境变量，勿提交。

```
gansu-travel - 副本/
├── .cursor/
│   └── rules/
│       └── miniprogram-design-system.mdc
├── docs/
│   ├── API-MVP.http
│   ├── API-MVP.md
│   ├── gansu_travel3.sql
│   ├── miniprogram-design-system.md
│   ├── PRD-MVP.md
│   └── PROJECT-STRUCTURE.md
├── miniprogram/
│   ├── api/
│   │   ├── modules/
│   │   │   ├── charter.ts
│   │   │   ├── content.ts
│   │   │   └── spot.ts
│   │   ├── types/
│   │   │   ├── spot.ts
│   │   │   └── user.ts
│   │   ├── base.ts
│   │   └── request.ts
│   ├── components/
│   │   ├── c-button/
│   │   │   ├── c-button.json
│   │   │   ├── c-button.ts
│   │   │   ├── c-button.wxml
│   │   │   └── c-button.wxss
│   │   ├── c-input/
│   │   │   ├── c-input.json
│   │   │   ├── c-input.ts
│   │   │   ├── c-input.wxml
│   │   │   └── c-input.wxss
│   │   └── c-tab/
│   │       ├── c-tab.json
│   │       ├── c-tab.ts
│   │       ├── c-tab.wxml
│   │       └── c-tab.wxss
│   ├── pages/
│   │   ├── car-charter/
│   │   │   └── charter-index/
│   │   │       ├── charter-index.json
│   │   │       ├── charter-index.ts
│   │   │       ├── charter-index.wxml
│   │   │       └── charter-index.wxss
│   │   └── user/
│   │       ├── order-list.json
│   │       ├── order-list.ts
│   │       ├── order-list.wxml
│   │       ├── order-list.wxss
│   │       ├── user-index.json
│   │       ├── user-index.ts
│   │       ├── user-index.wxml
│   │       └── user-index.wxss
│   ├── static/
│   │   └── images/
│   │       ├── banner/
│   │       │   ├── 1.jpg
│   │       │   ├── 2.jpg
│   │       │   └── 3.jpg
│   │       ├── category/
│   │       │   ├── creative.jpg
│   │       │   ├── food.jpg
│   │       │   ├── museum.jpg
│   │       │   ├── route.jpg
│   │       │   └── scenic.jpg
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
│   ├── types/
│   │   ├── spot.d.ts
│   │   └── user.d.ts
│   ├── utils/
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
│   │   │   ├── 20260920150000_add_charter_tables/
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts/
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
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── .env
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
| `miniprogram/` | 微信小程序：页面、组件、接口封装、静态资源 |
| `miniprogram/pages/car-charter/charter-index/` | 包车首页 |
| `miniprogram/pages/user/` | 我的、订单列表 |
| `miniprogram/api/` | 小程序请求封装与业务接口 |
| `miniprogram/components/` | 按钮、输入框、Tab 等公共组件 |
| `server/` | NestJS API（包车、景点、路线、文章、搜索、首页） |
| `server/prisma/` | 数据模型、迁移与种子数据 |
| `docs/` | 产品需求、接口说明、设计规范、建表 SQL |
| `typings/` | 小程序 API 类型声明 |
| `docker-compose.yml` | 本地依赖服务编排 |
