---
name: exp-interest-group-ux
description: EXP 兴趣小组 C 端业务规则与信息架构。在设计或实现小组、活动、报名、推荐、角色、自发组报备、AI 助手相关功能时使用。完整规格见 docs/superpowers/specs/2026-05-26-interest-group-design.md。
---

# EXP Interest Group UX

**实现载体**：`site/` 离线原型（移动员工端 + PC 管理端）。改功能请编辑 `site/assets/` 下对应 JS，勿再维护已删除的 `src/`。

## 核心产品原则

1. **报名 ≠ 加入**：员工可直接报名活动，不必先加入小组。
2. **自发组先上线后报备**：创建即上线；C 端显示报备 Banner，不自动下架。
3. **MVP 推荐**：规则引擎 + 可解释理由，非向量检索。
4. **积分**：兴趣小组模块内不发积分卡（荣誉引擎负责）。

## 用户角色（C 端）

| 身份 | 切换 | 能力 |
|------|------|------|
| 员工 | 顶栏身份切换 | 浏览、加入、报名、发帖 |
| 管理员 | 同上 | + PC 管理端入口 |

## 主要导航（移动员工端 `nav.go`）

| 路由键 | 页面 |
|--------|------|
| `home` | 首页（AI、本周活动、往期精彩回顾） |
| `allActs` | **全部活动**（仅 `status === 'upcoming'`） |
| `allGroups` | 全部小组 |
| `group` | 小组详情 |
| `activity` | 活动详情 |
| `moments` | 小组圈 |
| `aichat` | AI 对话 |

源码：`site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js`（`AllActivities`、`HomeTab` 等）。

## 活动类型

| 类型 | 字段 `type` | 说明 |
|------|-------------|------|
| 单次 | `once` | 单场时间地点 |
| 周期 | `recurring` | `sessions[]` 多场次 |
| 系列 | `series` | `seriesSignupMode`: `all`（整场）/ `independent`（按场） |

活动状态 Mock：`upcoming` | `ended`；列表页不展示 `ended`。

## 关键 UI 组件（`site/assets/56b1d150-…js`）

- `ActivityCard`、`GroupCard`、`RecCard`
- `EndedActsStrip`（首页往期回顾，与「全部活动」分离）
- `SectionHeader`、`ListScreen`

## 数据 Mock

- `site/assets/a91a7bed-087a-4db6-8705-be046ebfdf13.js`：`DB.acts`、`DB.groups`、`DB.moments`

## PC 管理端

见 `exp-admin-pc` skill；源码在 `site/assets/191074b9-…js`、`5f3ec28e-…js` 等。

## 设计前必读

重大新功能：先 `brainstorming` → 更新 `docs/superpowers/specs/` → 再改 `site/`。
