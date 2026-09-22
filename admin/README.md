# 甘肃旅游 · 运营后台

## 启动

1. 确保 `server` 已启动：`cd server && npm run start:dev`
2. 安装并启动后台：

```bash
cd admin
npm install
npm run dev
```

3. 浏览器打开 http://localhost:5173
4. 默认账号：`admin` / `admin123`（可在 `server/.env` 配置）

## 第一期功能

- 登录
- 文章列表（筛选、分页）
- 从公众号导入（自动转存图片、默认上架）
- 编辑元信息、上架/下架、删除
