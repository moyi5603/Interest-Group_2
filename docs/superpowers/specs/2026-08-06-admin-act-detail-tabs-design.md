# 管理端活动详情 · Mobile Tab 分区

日期：2026-08-06  
范围：`site/` 原型 · **仅 mobile 管理端** `AdminActDetail`  
PC 活动详情布局不变。

## 目标

活动详情内容过长、纵向堆叠难扫。Mobile 管理端改为 tab 分区，并保留顶部统计卡作快捷入口。

## 信息架构

自上而下：

1. Hero 封面 + 浮层返回（仅图标）+ 标签
2. 标题、元信息、操作按钮（编辑 / 终止 / 删除）
3. 一行 4 统计卡（compact）
4. Tab 栏
5. 当前 tab 内容区

### Tab

| key | 文案 | 内容 |
|-----|------|------|
| `desc` | 活动描述 | 现有 richtext /「暂无描述」 |
| `signups` | 报名情况 | 现有场次块 / 单场进度与头像展开 |
| `comments` | 评论&互动 | 现有 `CommentsView`（`inline`） |
| `moments` | 精彩瞬间 | 该活动（系列则各期）相关 moments，复用 `MomentsGrid`；空态「暂无精彩瞬间」 |

默认选中：`desc`。

Tab 栏视觉与交互对齐 `AdminGroupDetail`（底边品牌色指示、字重、mobile 横向滚动）。

### 统计卡 → Tab

| 卡 | 跳转 |
|----|------|
| 已报名 | `signups` |
| 点赞 | `comments` |
| 评论 | `comments` |
| 精彩瞬间 | `moments` |

卡本身仍展示数字；点击仅切换 tab，不另开页。

## 非目标

- PC `AdminActDetail` 两栏布局不改
- C 端活动详情不改
- 不新增报名/评论/瞬间业务能力，只做分区与入口

## 实现落点

- 主改：`site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js`（`AdminActDetail`）
- 复用：`MomentsGrid`、`CommentsView`、`StatCard`（`compact` + `onClick`）
- moments 过滤：与现有 `momentCount` 一致 — `DB.moments` 中 `aid` 属于当前活动或系列各期
- `site/index.html` cache bust 该脚本

## 验收

- Mobile 管理端进入活动详情：见 4 tab，默认「活动描述」
- 切换 4 tab 内容正确，互不叠显
- 点 4 统计卡跳到上表对应 tab
- 「精彩瞬间」有数据出网格，无数据空态
- PC 活动详情仍为原两栏，无 tab
