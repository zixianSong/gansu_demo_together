# 行程管理 · HTTP API

> 实现：`server` 的 `ItineraryModule`  
> 前缀：`/api/v1`  
> 响应：`{ "code": 0, "message": "ok", "data": ... }`  
> 用户：请求头 **`X-User-Id`**。登录由「我的」提供，合并时只换 `src/mine` 的 `MINE_USER_PORT`。

未确认的 AI 预览不要调 `POST /itinerary/apply`。

## 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/itinerary/current` | 当前方案现行版本；无方案时 200 且 `plan=null` |
| GET | `/itinerary/plans` | 方案集 `?status=current\|draft\|archived` |
| GET | `/itinerary/plans/:planId` | 指定方案明细 |
| GET | `/itinerary/plans/:planId/switch-preview` | 冲突预览 |
| POST | `/itinerary/plans/:planId/switch` | 切换当前方案 |
| GET | `/itinerary/plans/:planId/snapshots` | 历史快照 |
| POST | `/itinerary/plans/:planId/snapshots/:snapshotId/restore` | 恢复快照 |
| POST | `/itinerary/apply` | 规划确认写入 |
| POST | `/itinerary/items/:itemId/complete` | 节点完成态 |
| POST | `/itinerary/sense` | 前台感知 |
| POST | `/itinerary/hints/ignore` | 忽略向导 |
| GET/POST | `/itinerary/conversations` | AI 对话落库 |

`GET /itinerary/current` query：`date`、`slot`（morning/noon/afternoon/evening/all）、`nodeId`。

`POST /itinerary/apply` 只改 **current**；结束后拒绝。写入前打 `plan_snapshots`。行中保留 `details.completed` 且未出现在新预览中的节点。

轮播图：`GET /pois/:id` 的 `images_json`。

已导入完整 `gansu_travel3.sql` 时不要跑 `20260920120000_itinerary` 迁移，只 `npx prisma generate`。
