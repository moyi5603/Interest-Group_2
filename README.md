# Interest-Group_2

企业 AI 工作助手前端原型，包含兴趣小组、同事查询等模块。

## 本地开发

```bash
npm install
npm run dev
```

浏览器访问：**http://127.0.0.1:5174/**（不要用 8080，该端口常被其他程序占用）

兴趣小组直达：**http://127.0.0.1:5174/agents/interest-groups**

若 `npm run dev` 报 `uv_interface_addresses` 错误，请用 `bash scripts/dev.sh` 或 `node node_modules/vite/bin/vite.js --host 127.0.0.1`。

若 `npm` 命令不可用，可先安装 [Node.js LTS](https://nodejs.org/)，或在本项目目录执行：

```bash
node node_modules/vite/bin/vite.js
```

## 离线原型站点

`site/` 目录包含兴趣小组 C 端与 PC 管理端的离线还原原型，详见 [site/README.md](site/README.md)。

```bash
cd site && python3 -m http.server 8080
# 或 cd site && node serve.mjs
```

## GitHub Pages

站点地址：<https://moyi5603.github.io/Interest-Group_2/>

推送 `main` 分支后，GitHub Actions（`.github/workflows/deploy-pages.yml`）会自动构建并部署。首次使用前请在仓库设置中启用 Pages：

1. 打开 **Settings → Pages**
2. **Build and deployment → Source** 选择 **GitHub Actions**

本地预览生产构建（需带仓库子路径）：

```bash
npm run build
npm run preview
```

浏览器访问预览地址时路径需包含 `/Interest-Group_2/`（与 `vite.config.ts` 中 `base` 一致）。
