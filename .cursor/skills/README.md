# Cursor Skills（Interest-Group 项目）

本仓库在 `.cursor/skills/` 下配置了 **EXP 兴趣小组 C 端** 专用 skills，Agent 会在相关任务中自动读取（见 `.cursor/rules/auto-use-skills.mdc`）。

## 项目 Skills

| Skill | 路径 | 用途 |
|-------|------|------|
| exp-mobile-design-system | `.cursor/skills/exp-mobile-design-system/` | 颜色、排版、token、组件库 |
| exp-mobile-patterns | `.cursor/skills/exp-mobile-patterns/` | 页面壳、顶栏、底栏、路由模式 |
| exp-interest-group-ux | `.cursor/skills/exp-interest-group-ux/` | 业务规则、路由、活动/小组逻辑 |
| exp-admin-pc | `.cursor/skills/exp-admin-pc/` | PC 管理后台 Ant Design、独立路由 |

## 个人 Skills（已安装到 ~/.cursor/skills/）

| Skill | 用途 |
|-------|------|
| frontend-design | 通用移动端 UI 设计与实现 |
| ui-mobile-review | 改 UI 前的走查 checklist |
| brainstorming / writing-plans / … | Superpowers 流程（symlink 至 plugins） |
| canvas | IDE 侧边 mockup（`~/.cursor/skills-cursor/canvas`） |

## 使用方式

在对话中 `@exp-mobile-design-system` 或描述任务（如「设计活动详情页」），Agent 会按规则自动加载。

新功能建议流程：**brainstorming** → spec → **writing-plans** → 实现 → **verification-before-completion**。
