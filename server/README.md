# 甘肃旅游小程序后端（MVP）

技术栈：NestJS + TypeScript + Prisma + MySQL + Redis（对齐 gansu_demo）

## 本地启动

### 1. 启动数据库（项目根目录）

```bash
cd D:\微信开发者工具\test
docker compose up -d
```

- MySQL：`localhost:3308`，库名 `gansu_travel3`，用户 `travel` / `travelpass`
- Redis：`localhost:6380`

> 与 gansu_demo 隔离：demo 常用 3307/6379，本项目用 3308/6380。跑本项目时请停掉占用 3000 的 demo 后端。

### 2. 安装依赖 & 迁移 & 种子

```bash
cd server
npm install
npx prisma migrate deploy
npx prisma db seed
```

### 3. 启动 API

```bash
npm run start:dev
```

服务地址：`http://localhost:3000/api/v1`

示例：

- `GET /api/v1/health`
- `GET /api/v1/home/feed`
- `GET /api/v1/articles/1`
- `GET /api/v1/itinerary/current`（请求头 `X-User-Id`）

行程管理为独立 Module：`src/itinerary`；用户 ID 占位在 `src/mine`（可替换）。HTTP 说明见仓库外工作区 `docs/api/itinerary-http.md`。

若数据库已是完整 `gansu_travel3.sql`，不要执行 itinerary 那次 migrate（表已存在），只 `npx prisma generate`。

小程序联调请将 `miniprogram/api/base.ts` 的 `BASE_URL` 改为 `http://本机IP:3000/api/v1`，并在开发者工具中勾选不校验合法域名。
