---
name: exp-mobile-design-system
description: EXP 智能体 C 端移动端视觉规范。在用户设计或修改兴趣小组、员工端页面、移动端 UI 时使用。实现位于 site/ 原型（CSS 变量 + 内联样式），非 Tailwind。
---

# EXP Mobile Design System

**载体**：`site/index.html` + `site/assets/*.js` 内联样式与 CSS 变量（`--brand`、`--surface`、`--ink` 等）。

## 设计 token（`site` 全局变量）

| Token | 用法 |
|-------|------|
| 主色 | `--brand` / `--ai` 渐变，按钮与强调 |
| 背景 | `--bg`、`--surface` 卡片底 |
| 分类色 | `--c-sport`、`--c-reading`、`--c-game` 等（`CATS`） |
| 圆角 | `--r-lg` 大卡片 |
| 阴影 | `--shadow`、`--shadow-sm` |

**禁止**：在 C 端移动页使用 PC 表格风、Ant Design。

## 排版

- 页面标题：约 17px、`fontWeight: 800`
- 正文：13–14.5px
- 辅助：`--ink-3`、`--ink-2`

## 卡片

- 活动大卡：`ActivityCard` — 封面约 152px 高、底渐变、分类 `CatBadge`
- 列表间距：`gap: 15` 纵向
- 横向滚动：`className="noscroll"` + `overflowX: 'auto'`

## 图标

内联 `Icon` 组件（`site/assets/` 公共脚本），非 lucide。

## 参考

- 卡片：`site/assets/56b1d150-9839-448d-a372-67039ef0ea89.js`
- 首页布局：`site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js`
- 截图对照：`site/preview/`
