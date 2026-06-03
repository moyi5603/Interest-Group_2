---
name: exp-mobile-design-system
description: EXP 智能体 C 端移动端视觉与 Tailwind 设计规范。在用户设计或修改兴趣小组、员工端页面、移动端 UI、组件样式、布局间距时使用；禁止把 C 端做成 PC 表格风。
---

# EXP Mobile Design System

本 skill 约束 **C 端（员工侧）** 页面视觉，不适用于 `/admin/*` PC 管理后台。

## 设计 token（`src/index.css`）

| Token | 值 / 用法 |
|-------|-----------|
| 主色 | `--primary: 245 75% 60%` 科技蓝紫，按钮/选中态 |
| 背景 | `--background: 220 33% 98%` 浅灰蓝 |
| 圆角 | `--radius: 1rem`，卡片/输入框 `rounded-xl` |
| 字体 | PingFang SC / 系统 sans，正文 14px 为主 |
| 阴影 | `shadow-soft` / `shadow-card` / `shadow-tab`（底栏） |
| 过渡 | `transition-base`（0.25s），点击 `active:scale-95` |
| 渐变 | 首页/发现页可用 `from-primary/[0.07] via-background` |

**禁止**：引入 Ant Design / Element；在 C 端使用 `min-w-[1280px]`、宽表格、小字号高密度列表。

## 排版（`interestTypography`）

统一从 `@/components/interest/interestTypography` 引用，勿硬编码字号：

```ts
import { interestTypography as ty } from "@/components/interest/interestTypography";

// pageTitle, pageSubtitle, empty, formLabel, tabSegment, chip, sectionHint
<h1 className={ty.pageTitle}>标题</h1>
```

## 颜色与语义

- 主操作：`bg-primary text-primary-foreground rounded-full` 或 `rounded-xl`
- 次要：`bg-secondary/70 text-muted-foreground`
- destructive：下架/取消，`text-destructive` 或 `bg-destructive`
- 标签 pill：`rounded-full px-3 py-1 text-sm font-medium`

## 组件库

仅使用项目已有 shadcn 风格组件（`src/components/ui/`）：

- `Button`, `Input`, `Textarea`, `Dialog`, `AlertDialog`, `Sheet`, `Tabs`, `Switch`, `Checkbox`
- 日期：`MobileDateTimeField` 等（`mobile-date-field.tsx`）
- Toast：`sonner`，居中深色样式（`.app-toast-host`）

## 图标

`lucide-react`，常用尺寸：`h-4 w-4`（内联）、`h-5 w-5`（导航）、`h-3.5 w-3.5`（辅助）。

## 卡片与列表

- 列表间距：`space-y-2`，页内边距 `px-3`
- 卡片：白底 `bg-card border border-border/60 rounded-xl shadow-sm`
- 横向滚动 Tab：`overflow-x-auto scrollbar-hide` + pill 按钮

## 参考文件

- Token 源：`src/index.css`
- 排版：`src/components/interest/interestTypography.ts`
- 卡片示例：`GroupCard`, `FeaturedActivityCard`, `ActivityCard`
