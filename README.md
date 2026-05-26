# humanistic-care

企业 AI 工作助手（人文关怀、同事查询等）前端原型。

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

## GitHub Pages

站点地址：<https://moyi5603.github.io/humanistic-care/>

推送 `main` 分支后，GitHub Actions 会自动构建并部署。首次使用前请在仓库设置中启用 Pages：

1. 打开 **Settings → Pages**
2. **Build and deployment → Source** 选择 **GitHub Actions**

本地预览生产构建：

```bash
npm run build
npm run preview
```
