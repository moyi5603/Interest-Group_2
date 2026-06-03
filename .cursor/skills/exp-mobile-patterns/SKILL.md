---
name: exp-mobile-patterns
description: EXP C 端移动端页面结构与交互模式。在新建或重构兴趣小组页面、列表页、详情页、表单页、固定底栏、路由守卫时使用。
---

# EXP Mobile Page Patterns

## 标准页面壳（必用）

C 端兴趣小组页面统一结构：

```tsx
<div className="mx-auto flex h-screen max-w-md flex-col bg-background">
  <header className="sticky top-0 z-30 shrink-0 border-b border-border/40 bg-background/90 backdrop-blur-lg">
    {/* 返回 + 标题 + 可选右上角操作 */}
  </header>
  <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
    {/* 内容 */}
  </main>
  {/* 可选 fixed footer */}
</div>
```

- **宽度**：始终 `max-w-md`（约 448px），居中 `mx-auto`
- **高度**：`h-screen` + `flex-col`，主区 `flex-1 overflow-y-auto`
- **首页/发现**：可加 `bg-gradient-to-b from-primary/[0.07] via-background to-background`

## 顶栏模式

```tsx
<button type="button" aria-label="返回" onClick={goBack}
  className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95">
  <ArrowLeft className="h-5 w-5" />
</button>
<h1 className={ty.pageTitle}>页面标题</h1>
```

- 返回：`useNavigateBack()`（`@/hooks/useNavigateBack`）
- 搜索：Input + `Search` 图标，`pl-9 rounded-xl`

## 固定底栏（详情/操作页）

参考 `ActivityDetail.tsx`、`GroupDetail.tsx`：

```tsx
<footer className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-md items-center gap-2 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur">
  {/* 主按钮 h-12 flex-1 rounded-xl */}
</footer>
```

主内容区需 `pb-20` 或等效 padding，避免被底栏遮挡。

## Tab 与筛选

- URL 同步 Tab：`useUrlEnumParam`（`@/hooks/useUrlEnumParam`）
- 横向 pill：`rounded-full px-3 py-1 text-sm`，选中 `bg-primary text-primary-foreground`

## 权限门控

管理操作页面包裹 `InterestRoleGate`（创建小组、发布活动等）。

角色切换：`RoleIdentitySwitcher` + `useAppRole`（员工 / 管理员）。

## 空状态

使用模块内 `*EmptyState` 组件或 `interestTypography.empty`，居中、`py-8 text-sm text-muted-foreground`。

## 表单页

- 标签：`ty.formLabel`，必填 `ty.requiredMark` 红星
- 提交：底栏或顶栏右侧主按钮
- 长表单：`ActivityFormFields` 等现有字段组件，勿重复造轮子

## 路由前缀

C 端兴趣小组：`/agents/interest-groups/*`  
PC 管理后台：`/admin/interest-groups/*`（不同壳层，勿混用 `max-w-md`）

## 参考页面

| 类型 | 文件 |
|------|------|
| 首页 | `InterestGroupHome.tsx` |
| 列表 | `InterestGroupSectionList.tsx`, `InterestGroupDiscover.tsx` |
| 详情+底栏 | `ActivityDetail.tsx`, `GroupDetail.tsx` |
| 表单 | `GroupCreate.tsx`, `ActivityCreate.tsx` |
| 对话 | `InterestGroupChat.tsx` + `ChatInputBar` |
