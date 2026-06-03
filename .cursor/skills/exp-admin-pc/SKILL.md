---
name: exp-admin-pc
description: EXP 兴趣小组 PC 管理后台规范。Ant Design 风格、路由前缀 /admin/interest-groups、所有运营交互在 PC 端完成，不跳转 C 端 mobile 页面。在修改 src/pages/admin、src/admin、AdminLayout 或 PC 后台功能时使用。
---

# EXP PC 管理后台

## 独立性

- **路由**：`/admin/interest-groups/*`，与 C 端 `/agents/interest-groups/*` 分离
- **UI**：Ant Design 5（`antd` + `@ant-design/icons`），包裹于 `AdminAntdRoot`
- **样式**：`admin-antd-overrides.css`，**不要**使用 C 端 `max-w-md` / `interestTypography`
- **交互闭环**：列表 → 详情 → 编辑/创建均在 PC 路由内完成，**禁止** `target="_blank"` 跳转 C 端

## 路由表

| 路径 | 页面 |
|------|------|
| `/admin/interest-groups` | 仪表盘 |
| `…/groups` | 小组列表 |
| `…/groups/create` | 创建小组 |
| `…/groups/:groupId` | 小组详情（成员/活动 Tab） |
| `…/groups/:groupId/edit` | 编辑小组 |
| `…/activities` | 活动列表 |
| `…/activities/new?groupId=` | 发布活动 |
| `…/activities/:activityId` | 活动详情（报名记录） |
| `…/activities/:activityId/edit` | 编辑活动 |

路径常量：`src/admin/adminPaths.ts`

## 组件约定

- 布局：`Layout` + `Sider` + `Header` + `Content`（`exp-admin-content` 白卡片）
- 列表：`Table` + 内联 `Form` 筛选 + `Modal` 确认
- 反馈：`App.useApp()` 的 `message` / `Modal.confirm`
- 权限：`adminRoleStore` + `AdminGate`（需 C 端 manager 身份）

## 数据写操作

- 创建官方组：`createOfficialGroup`
- 更新小组：`adminUpdateGroup`（不校验组长）
- 下架：`adminDeactivateGroup`
- 取消活动：`terminatePublishedActivity`

## 与 C 端关系

- 共用 Mock store（`interestGroups.ts`），改动同步到 C 端
- 侧栏底部可保留「返回员工端预览」链接，仅用于演示 C 端效果
