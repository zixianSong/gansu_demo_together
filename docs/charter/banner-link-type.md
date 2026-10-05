# 轮播 `linkType`：首页线路与包车线路

## 问题

`banner` 表同时给首页和包车首页使用。合并包车种子后，出现两条 `linkType = 'route'` 的轮播：

| 标题 | `linkId` 实际指向 |
| --- | --- |
| 青海湖1日游 立减50元 | `biz_tour_route.id`（包车线路） |
| 河西走廊线路 | `route_template.id`（首页线路模板） |

两边的 id 各自自增，数字可以相同，但不是同一张表。

包车接口按 `linkType = 'route'` 且 `sortOrder` 最小取第一条，会把包车轮播当成自己的数据，这一点当时是对的。首页接口不过滤这张表，会把包车轮播一并返回。首页点击 `route` 时按线路模板 id 处理，点到包车轮播就会对错记录。

## 约定

`linkType` 按目标表区分，不要共用 `route`。

| `linkType` | `linkId` | 使用方 |
| --- | --- | --- |
| `article` | `article.id` | 首页 |
| `poi` | `poi.id` | 首页 |
| `route` | `route_template.id` | 首页 |
| `webview` | 空，地址在 `linkPath` | 首页 |
| `charter` | `biz_tour_route.id` | 包车首页 |

首页 `getBanners` 只放行 `none`、`article`、`poi`、`route`、`webview`，因此 `charter` 不会出现在首页轮播。包车 `findCharterBanner` 只查询 `linkType = 'charter'`。

## 已改文件

- `server/prisma/seed.ts`：青海湖轮播改为 `linkType: 'charter'`，`linkId` 仍是对应包车线路。
- `server/src/charter/charter.service.ts`：包车轮播查询条件改为 `charter`。

数据库里如果已经跑过旧种子，需要重新执行 `npx prisma db seed`，或把已有「青海湖」轮播的 `link_type` 从 `route` 改成 `charter`。
