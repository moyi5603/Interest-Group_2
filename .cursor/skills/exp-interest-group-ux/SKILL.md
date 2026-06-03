---
name: exp-interest-group-ux
description: EXP 兴趣小组 C 端业务规则与信息架构。在设计或实现小组、活动、报名、推荐、角色、自发组报备、AI 助手相关功能时使用。完整规格见 docs/superpowers/specs/2026-05-26-interest-group-design.md。
---

# EXP Interest Group UX

## 核心产品原则

1. **报名 ≠ 加入**：员工可直接报名活动，不必先加入小组。
2. **自发组先上线后报备**：创建即 `active`；C 端显示报备 Banner，不自动下架。
3. **MVP 推荐**：规则引擎 + 可解释理由，非向量检索。
4. **积分**：兴趣小组模块内不发积分卡（荣誉引擎负责）。

## 用户角色（C 端）

| 身份 | 切换 | 能力 |
|------|------|------|
| 员工 | `RoleIdentitySwitcher` | 浏览、加入、报名、创建自发组 |
| 管理员 | 同上 | + 小组/活动管理入口、PC 后台 |

存储：`appRoleStore`（`employee` | `manager`）。

## 主要路由

| 路径 | 页面 |
|------|------|
| `/agents/interest-groups` | 首页（AI + 推荐 + 快捷入口） |
| `/agents/interest-groups/discover` | 小组广场 |
| `/agents/interest-groups/list/:section` | 近期活动 / 我的小组等 |
| `/agents/interest-groups/my-activities` | 我的活动 |
| `/agents/interest-groups/:groupId` | 小组详情 |
| `/agents/interest-groups/activities/:activityId` | 活动详情 |
| `/agents/interest-groups/new` | 创建自发组 |
| `/agents/interest-groups/admin/:kind` | 移动端管理列表 |
| `/admin/interest-groups/*` | PC 管理后台 |

## 活动类型（`activityKind`）

| 类型 | 说明 |
|------|------|
| `one_off` | 单次，需 startAt/endAt |
| `recurring` | 固定周期，rrule |
| `series` | 系列场次，配合 `seriesEnrollmentMode` |

系列报名：`once_before_first`（整场） vs `per_occurrence`（按场）；近 3 个月场次可选。

## 报名截止

- 模式：`fixed` 指定时间 / `hours_before_start` 开始前 N 小时
- **C 端展示**：实时倒计时（`useEnrollDeadlineCountdown`），非静态日期
- 组件：`EnrollDeadlineMeta`, `EnrollDeadlineField`

## 小组类型

- `official` 官方精品组（运营创建）
- `spontaneous` 自发组（员工创建，可有 `reportStatus` / `reportDueAt`）

可见性：`public` | `dept_only` | `invite_only`

## 关键组件（复用优先）

- 列表：`GroupCard`, `FeaturedActivityCard`, `ActivityCard`
- 区块：`InterestSection`, `SectionHeader`
- 推荐：`InterestAgentReply`, `InterestTopicPanel`
- 报备：`ReportBanner`
- 点赞：`EntityLikeButton`, `LikeCountBadge`
- 表单：`ActivityFormFields`, `EnrollDeadlineField`

## 数据与 Mock

- 类型：`src/data/interestTypes.ts`
- Store：`src/data/interestGroups.ts`
- 推荐：`src/lib/interestRecommend.ts`
- 当前用户：`CURRENT_EMPLOYEE_ID`

## 设计前必读

重大新功能：先 `brainstorming` → 更新/引用 `docs/superpowers/specs/` → 再 `writing-plans` 实现。

## PC 后台边界

PC 后台（`/admin/*`）使用 **Ant Design**，与 C 端 Tailwind 移动端完全分离；所有运营操作在 PC 路由内闭环，详见 `exp-admin-pc` skill。
