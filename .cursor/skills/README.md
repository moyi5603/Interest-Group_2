# Cursor Skills（Interest-Group 项目）

本仓库以 **`site/` 离线原型** 为唯一前端实现；Agent 会在相关任务中自动读取 skills（见 `.cursor/rules/auto-use-skills.mdc`）。

## 项目 Skills

| Skill | 路径 | 用途 |
|-------|------|------|
| exp-mobile-design-system | `.cursor/skills/exp-mobile-design-system/` | `site/` 移动端 CSS 变量与卡片风格 |
| exp-mobile-patterns | `.cursor/skills/exp-mobile-patterns/` | `ListScreen`、首页、`nav.go` 模式 |
| exp-interest-group-ux | `.cursor/skills/exp-interest-group-ux/` | 业务规则、全部活动/往期回顾分离 |
| exp-admin-pc | `.cursor/skills/exp-admin-pc/` | `site/` PC 管理端 |

## 使用方式

在对话中 `@exp-interest-group-ux` 或说明要改 `site/` 某页面，Agent 会加载对应 skill。

新功能建议流程：**brainstorming** → spec → 改 `site/assets/` → **verification-before-completion**（本地 `cd site && node serve.mjs` 目视验收）。
