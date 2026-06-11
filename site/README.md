# 兴趣小组 · Agent —— 1:1 还原站点

这是 https://interestinggroup.netlify.app/ 的**完整离线还原**。

线上站点是一个「单文件自解包」bundle：把 React / ReactDOM / Babel-standalone、全部 JSX 源码、105 个 Noto Sans SC 字体子集，全部以 base64+gzip 内联进一个 `index.html`，在浏览器里运行时解包成 blob URL 再渲染。

本目录把这个 bundle **解包还原**成了可直接浏览、可编辑的静态站点：

```
site/
├── index.html          # 还原后的真实页面（uuid 占位符已替换为 assets/ 下的本地文件）
├── assets/             # 119 个解包后的资源
│   ├── *.js            # React、ReactDOM、Babel-standalone 及若干工具脚本
│   ├── *.jsx           # 应用源码（Chrome.jsx / 各页面组件，原始可读 JSX）
│   └── *.woff2         # Noto Sans SC 字体子集
├── preview/            # 渲染验证截图（移动端 / PC 端）
└── serve.mjs           # 本地静态服务器
```

## 运行

页面用 Babel-standalone 在浏览器内编译 JSX，**`index.html` 需通过 HTTP 访问**（不能直接 `file://` 打开）。任选其一：

```bash
# 方式一：Python（系统自带）
cd site && python3 -m http.server 8080

# 方式二：Node
cd site && node serve.mjs   # 默认 http://127.0.0.1:8080/
```

然后浏览器打开 http://127.0.0.1:8080/

## Standalone 单文件（可双击打开）

若需发**单个 HTML** 给同事（无需起服务、无需 `assets/` 目录）：

```bash
cd site && python3 build_standalone.py
```

生成 **`site/interest-group-standalone.html`**（约 30MB，含字体与脚本内联）。  
用 Chrome / Edge **双击打开**或拖入浏览器即可（`file://`）。

> 修改 `index.html` 或 `assets/` 后需重新运行上述命令再分享。

## 内容

页面是一个 Showcase，顶部可在两个视角间切换：

- **移动员工端**：员工「林浅」视角的兴趣小组 App（首页推荐、本周活动、底部导航等）。
- **PC 管理端**：HR「陈航」视角的管理控制台（工作台数据、活动/报名/评论管理、AI 活动策划等），外层套 macOS Chrome 窗口外观。

## 还原说明

- 资源 100% 来自线上 bundle 解码，字节级一致；仅去除了 `integrity`/`crossorigin`（同源本地资源不需要 SRI）。
- 经无头浏览器渲染验证：两个视角均正常，控制台 **0 报错**。
- `index.html` 中保留的少量未替换 uuid 是线上 bundle 本就未打包的字体子集，浏览器按 `unicode-range` + `font-display: swap` 自动回退，与线上行为一致。
