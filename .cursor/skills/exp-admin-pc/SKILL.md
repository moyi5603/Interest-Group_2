---
name: exp-admin-pc
description: EXP 兴趣小组 PC 管理后台规范。在修改 site/ 内 PC 管理端、活动/小组 CRUD、报名与评论管理时使用。
---

# EXP PC 管理后台

**载体**：`site/` 内 PC 视角（`AdminApp`），源码分散在 `site/assets/191074b9-…js`、`5f3ec28e-…js`、`06091f2a-…js` 等。已删除的 `src/admin` 不再使用。

## 独立性

- **UI**：桌面表格 + 表单 + Modal，外层 macOS `ChromeWindow` 装饰
- **交互闭环**：列表 → 详情 → 编辑均在 PC 区块内完成
- **与 C 端分离**：不依赖 `/agents/interest-groups` Vite 路由

## 主要视图（`section`）

| section | 说明 |
|---------|------|
| `dashboard` | 工作台 |
| `groups` | 小组管理 |
| `activities` | 活动管理 |
| `signups` | 报名记录 |
| `comments` / `moments` | 评论与小组圈 |

导航：`site/assets/06091f2a-16af-41e1-9ea2-396272d1f95c.js`。

## 活动状态（管理列表）

- `published` / `upcoming` / `ended` / `cancelled`（已终止）
- 列表展示含已结束；与 C 端「全部活动」仅 upcoming 不同

## 数据

与 C 端共用 `site/assets/a91a7bed-…js` 中 `DB` store（`store.acts`、`store.groups`）。

## 参考截图

`site/preview/02-pc.png`、`03-admin-acts.png` 等。
