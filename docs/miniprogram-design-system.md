# 微信小程序设计系统 - 开发规范文档

> **目标**：生成严格遵循设计规范的 UI 代码。所有样式必须引用 `miniprogram/app.wxss` 中的 CSS 变量，严禁硬编码色值和尺寸。
>
> **冲突优先级**：MasterGo 设计稿与本文档不一致时，**以本文档为准**。

---

## 目录

1. [全局样式变量（app.wxss）](#1-全局样式变量appwxss)
2. [尺寸换算规则](#2-尺寸换算规则-pt-to-rpx)
3. [颜色变量映射表](#3-颜色变量映射表)
4. [文字规范](#4-文字规范)
5. [圆角与按钮引用](#5-圆角与按钮引用)
6. [代码生成示例](#6-代码生成示例)
7. [前端目录结构](#7-前端目录结构)
8. [开发检查清单](#附录开发检查清单)

---

## 1. 全局样式变量（app.wxss）

变量定义以 `miniprogram/app.wxss` 为唯一来源；修改 token 时只改该文件，页面 wxss 通过 `var(--xxx)` 引用。

```scss
/* ========================================
   1. 全局样式重置 & 基础设置
   ======================================== */
page {
  --font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  --font-family-number: 'DIN', 'PingFang SC', sans-serif;
  --bg-page: #F8F8F8;

  font-family: var(--font-family);
  background-color: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.5;
}

/* ========================================
   2. 颜色系统 (Color Tokens)
   ======================================== */
page {
  --color-primary-blue: #1677FF;
  --color-primary-yellow: #FFAC00;
  --color-danger: #FA5151;
  --color-warning: #FA9D3B;
  --color-success: #B3F0DC;
  --color-info: #D1E5FF;
  --color-white: #FFFFFF;

  --text-primary: #000000;
  --text-secondary: #515151;
  --text-annotation: #A6A6A6;
  --text-disabled: #D8D8D8;

  --fill-body: #F8F8F8;
  --fill-base: #F2F2F2;
}

/* ========================================
   3. 文字系统 (Typography Tokens)
   ======================================== */
page {
  --font-size-extra-large: 48rpx;
  --font-size-title: 36rpx;
  --font-size-heading: 32rpx;
  --font-size-body-large: 30rpx;
  --font-size-body: 28rpx;
  --font-size-secondary: 26rpx;
  --font-size-caption: 22rpx;
  --font-size-tag: 20rpx;

  --font-weight-bold: 700;
  --font-weight-medium: 500;
  --font-weight-regular: 400;
}

/* ========================================
   4. 尺寸与间距 (Spacing & Layout)
   ======================================== */
page {
  --page-padding-horizontal: 32rpx;
  --nav-height: 94rpx;
  --tabbar-height: 100rpx;
  --icon-size-base: 48rpx;
}

/* ========================================
   5. 圆角系统 (Border Radius)
   ======================================== */
page {
  --radius-small: 8rpx;
  --radius-medium: 16rpx;
  --radius-large: 32rpx;
}

/* ========================================
   6. 按钮规范
   ======================================== */
.btn-primary { /* 630×88rpx 主按钮 */ }
.btn-modal { /* 486×88rpx 弹窗按钮 */ }
.btn-secondary { /* 幽灵按钮 */ }
.btn-small { /* 小按钮 52rpx 高 */ }
.btn-small-alt { /* 灰色小按钮 56rpx 高 */ }

/* ========================================
   7. 通用工具类
   ======================================== */
.text-ellipsis { }
.flex-center { }
.flex-column { }
.card { }
.page-container { }
```

---

## 2. 尺寸换算规则 (PT to RPX)

- **设计稿基准**：375 × 812 pt
- **换算公式**：`1pt = 2rpx`（例如：16pt => 32rpx）

| 元素 | pt 值 | rpx 值 | CSS 变量 |
| :--- | :--- | :--- | :--- |
| 页面左右边距 | 16pt | 32rpx | `var(--page-padding-horizontal)` |
| 顶部导航栏高 | 47pt | 94rpx | `var(--nav-height)` |
| 底部 TabBar 高 | 50pt | 100rpx | `var(--tabbar-height)` |
| 基础图标尺寸 | 24pt | 48rpx | `var(--icon-size-base)` |

---

## 3. 颜色变量映射表

> **必须使用 `var(--xxx)`，严禁硬编码色值。**

| 设计角色 | 设计稿色值 | CSS 变量名 | 使用场景 |
| :--- | :--- | :--- | :--- |
| 主色蓝 | #1677FF | `var(--color-primary-blue)` | 按钮、激活态、链接 |
| 主色黄 | #FFAC00 | `var(--color-primary-yellow)` | 重要标记、促销标签 |
| 危险/错误 | #FA5151 | `var(--color-danger)` | 删除、报错提示 |
| 警告 | #FA9D3B | `var(--color-warning)` | 弱提醒、强调标签 |
| 成功 | #B3F0DC | `var(--color-success)` | 已完成状态 |
| 信息 | #D1E5FF | `var(--color-info)` | 信息提示、浅色标签底 |
| 主要文字 | #000000 | `var(--text-primary)` | 标题、正文内容 |
| 次要文字 | #515151 | `var(--text-secondary)` | 列表描述、辅助信息 |
| 注释文字 | #A6A6A6 | `var(--text-annotation)` | 占位符、灰显说明 |
| 不可用文字 | #D8D8D8 | `var(--text-disabled)` | 占位图、不可用 |
| 分割线/底色 | #F2F2F2 | `var(--fill-base)` | 输入框背景、分割线 |
| 页面背景 | #F8F8F8 | `var(--fill-body)` | 整个页面背景 |
| 卡片/弹层白底 | #FFFFFF | `var(--color-white)` | 卡片、弹层内容区 |
| 弹层遮罩 | rgba(0,0,0,0.85) | `var(--overlay-mask)` | 底部弹层、模态遮罩 |
| 卡片阴影 | — | `var(--shadow-card)` | 卡片、列表项浮层 |

---

## 4. 文字规范

> **行高规则**：所有文本行高固定为 `1.5` 倍（已设置在 `page` 根元素），页面内不要单独覆盖 `line-height`，除非设计明确要求。

| 场景 | 字号 (rpx) | 字重 | CSS 变量 |
| :--- | :--- | :--- | :--- |
| 重点文字 | 48rpx | Bold | `var(--font-size-extra-large)` |
| 大标题 | 36rpx | Bold | `var(--font-size-title)` |
| 一级标题 | 32rpx | Bold | `var(--font-size-heading)` |
| 列表文字/标签 | 30rpx | Medium | `var(--font-size-body-large)` |
| 正文/按钮 | 28rpx | Regular | `var(--font-size-body)` |
| 辅助/二级标题 | 26rpx | Regular | `var(--font-size-secondary)` |
| 说明文字 | 22rpx | Regular | `var(--font-size-caption)` |
| 标签文字 | 20rpx | Regular | `var(--font-size-tag)` |

数字（价格、数量）使用 `font-family: var(--font-family-number)`。

---

## 5. 圆角与按钮引用

| 级别 | rpx | CSS 变量 | 典型场景 |
| :--- | :--- | :--- | :--- |
| 小圆角 | 8rpx | `var(--radius-small)` | 小按钮、标签 |
| 中圆角 | 16rpx | `var(--radius-medium)` | 主按钮、卡片 |
| 大圆角 | 32rpx | `var(--radius-large)` | 弹窗、大卡片 |

| 按钮类型 | 类名 | 适用场景 |
| :--- | :--- | :--- |
| 主按钮 | `.btn-primary` | 全屏宽主操作 |
| 弹窗按钮 | `.btn-modal` | 弹窗/卡片内操作 |
| 次要按钮 | `.btn-secondary` | 幽灵按钮 |
| 小按钮 | `.btn-small` | 极小标签操作 |
| 小按钮(灰) | `.btn-small-alt` | 次要标签操作 |

---

## 6. 代码生成示例

### 正确写法

```html
<view class="card" style="padding: 0 var(--page-padding-horizontal);">
  <text class="text-ellipsis" style="font-size: var(--font-size-heading); color: var(--text-primary); font-weight: var(--font-weight-bold);">
    景点名称
  </text>
  <text style="font-size: var(--font-size-secondary); color: var(--text-secondary);">
    景点地址
  </text>
  <button class="btn-primary">立即预约</button>
</view>
```

```css
.article-page {
  background-color: var(--fill-body);
  padding: 0 var(--page-padding-horizontal);
}

.content-card {
  background-color: var(--color-white);
  border-radius: var(--radius-medium);
}
```

### 错误写法（禁止）

```html
<!-- ❌ 禁止硬编码色值和尺寸 -->
<view style="padding: 0 32rpx; background: #F8F8F8;">
  <text style="font-size: 32rpx; color: #333333;">景点名称</text>
</view>
```

---

## 7. 前端目录结构

```
miniprogram/
├── app.ts                     // 小程序入口
├── app.json                   // 全局配置（页面路径、tabBar、窗口样式）
├── app.wxss                   // 全局样式与 CSS 变量（唯一 token 源）
├── pages/                     // 业务页面
│   ├── index/
│   ├── jingdianliebiao/
│   ├── article/
│   └── wode/
├── components/                // 公共组件
│   ├── c-button/
│   ├── c-input/
│   └── c-tab/
├── api/
│   ├── base.ts
│   ├── request.ts
│   ├── types/
│   └── modules/
├── utils/
├── types/
├── typings/
└── static/images/
```

---

## 附录：开发检查清单

- [ ] 所有颜色使用 `var(--color-xxx)` / `var(--text-xxx)` / `var(--fill-xxx)` / `var(--color-white)`
- [ ] 所有字号使用 `var(--font-size-xxx)`
- [ ] 所有字重使用 `var(--font-weight-xxx)`
- [ ] 所有圆角使用 `var(--radius-xxx)`
- [ ] 页面边距使用 `var(--page-padding-horizontal)`
- [ ] 按钮优先使用 `.btn-primary` / `.btn-modal` / `.btn-secondary` 等封装类
- [ ] 行高保持默认 1.5，不随意覆盖
- [ ] 与 MasterGo 稿冲突时以本文档为准
