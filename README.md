# Interest-Group_2

兴趣小组产品原型：**移动员工端** + **PC 管理端**，源码与演示均在 `site/` 目录。

## 本地预览

页面在浏览器内用 Babel 编译 JSX，需通过 HTTP 访问（不要 `file://` 打开）。

```bash
cd site && node serve.mjs
# 或 python3 -m http.server 8080 --bind 0.0.0.0
```

- 本机：**http://127.0.0.1:8080/**
- 局域网：启动后终端会打印 `http://<本机IP>:8080/`（手机/同事需与你在同一 Wi‑Fi）

顶部可切换：

- **移动员工端**：首页、全部活动、小组圈、AI 对话等
- **PC 管理端**：工作台、小组/活动/报名/评论管理

详见 [site/README.md](site/README.md)。

## GitHub Pages

部署地址：<https://moyi5603.github.io/Interest-Group_2/>

推送 `main` 后，`.github/workflows/deploy-pages.yml` 会将 `site/` 发布到 Pages。

## 文档

| 文档 | 说明 |
|------|------|
| [docs/PRD-兴趣小组.md](docs/PRD-兴趣小组.md) | 产品需求（部分条目仍引用旧 Vite 实现，以 `site/` 为准） |
| [docs/PRD-兴趣小组-代码逆向.md](docs/PRD-兴趣小组-代码逆向.md) | 从原型梳理的验收清单 |
| [docs/superpowers/specs/](docs/superpowers/specs/) | 设计规格 |

## 源码位置（`site/assets/`）

| 模块 | 主要文件 |
|------|----------|
| 移动员工端 | `9e8f0b88-…js`（`mobile.jsx`：首页、`AllActivities`、`AllGroups`） |
| 活动/小组卡片 | `56b1d150-…js` |
| Mock 数据 | `a91a7bed-…js` |
| PC 管理端 | `191074b9-…js`、`5f3ec28e-…js` 等 |

> 曾有的 Vite + `src/` React 应用已移除，避免与 `site/` 双轨维护。
