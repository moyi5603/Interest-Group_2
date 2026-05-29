# 活动详情评论区设计规格

**日期**：2026-05-28  
**状态**：待评审  
**项目**：EXP 智能体 / humanistic-care 前端原型  
**关联**：`2026-05-26-interest-group-design.md` §活动详情、`PRD-兴趣小组.md` §5.3 互动数据展示位  

---

## 1. 背景与目标

活动详情页需增加**评论区**，支持员工发表文字评论并上传图片（单次最多 9 张），用于活动前讨论、活动后晒图与复盘，补齐 PRD 中「互动数据（赞/藏/评）」里的**评**能力。

### 1.1 成功标准（MVP）

- 活动详情页底部展示评论列表与评论入口。
- 登录员工在**能查看活动详情**的前提下，可发布文字 + 图片评论。
- 单条评论支持 0–9 张图片；至少包含文字或一张图片方可发布。
- 发布后评论即时出现在列表底部，`activity.commentCount` 同步 +1。
- 与现有底部报名/取消/组织者操作栏共存，不产生遮挡。

### 1.2 非目标（MVP 不做）

- 楼中楼回复、@ 提醒、评论点赞。
- 组织者/组长删他人评论、敏感词审核、举报。
- 真实 OSS 上传（沿用 mock：本地选图 → base64）。
- 评论推送通知（成长引擎 / IM，列入二期）。

---

## 2. 需求决策

| 议题 | 决策 |
|------|------|
| 谁可看评论 | 能查看活动详情的登录员工 |
| 谁可发评论 | **能查看活动详情即可发**（与「可见即可报名」一致，选项 A） |
| 活动终止后 | 仍可评论（复盘、晒图） |
| 布局方案 | **吸底轻条 + 底部 Sheet 完整编辑**（方案 A） |
| 排序 | 时间正序，最新在下；发布后滚动至最新 |
| 删除 | 仅作者可删自己的评论 |
| 图片上限 | 单条评论最多 9 张；单张 ≤ 5MB；仅 `image/*` |

---

## 3. 页面结构

活动详情现有结构：**顶栏 → 可滚动主内容 → 固定底栏（报名/取消/编辑）**。

评论区拆为三部分：

1. **评论列表区**（`main` 滚动内容最底部）
2. **吸底输入条**（`fixed`，位于报名底栏上方；无报名底栏时贴屏幕底）
3. **写评论 Sheet**（点击输入条或相机图标唤起）

```
┌─────────────────────────────┐
│ ← 活动名称                   │
├─────────────────────────────┤
│ 活动信息（封面/场次/说明…）    │
│ 组织者 / 报名状态              │
│ ─────────────────────────   │
│ 评论 (N)                     │
│ [评论卡片 × N]                │
│         (可滚动)             │
├─────────────────────────────┤
│ 💬 说点什么…            📷  │  ← ActivityCommentComposerBar
├─────────────────────────────┤
│      [ 立即报名 ]            │  ← 现有 footer（条件显示）
└─────────────────────────────┘
```

**写评论 Sheet**：

```
┌─────────────────────────────┐
│        ───                  │
│ 写评论              [发布]   │
├─────────────────────────────┤
│ 多行文本（placeholder）       │
│ max 500 字                   │
├─────────────────────────────┤
│ [+] [预览1][预览2]…          │  ← CommentImagePicker，最多 9 张
└─────────────────────────────┘
```

### 3.1 与底栏层叠

| 状态 | 评论吸底条 `bottom` | 主内容 `padding-bottom` |
|------|---------------------|-------------------------|
| 有报名/取消/编辑底栏 | 报名栏高度之上（约 `bottom-[68px]`） | 报名栏 + 评论条 + 安全区 |
| 无底栏（已结束等） | `bottom-0` + safe-area | 评论条 + 安全区 |

编辑模式（`?edit=1`）不展示评论区与吸底条。

---

## 4. 组件设计

| 组件 | 路径（建议） | 职责 |
|------|--------------|------|
| `ActivityCommentSection` | `components/interest/ActivityCommentSection.tsx` | 标题「评论 (N)」、列表、空状态 |
| `ActivityCommentItem` | `components/interest/ActivityCommentItem.tsx` | 单条：头像、姓名/部门、正文、图片网格、相对时间、删除 |
| `ActivityCommentComposerBar` | `components/interest/ActivityCommentComposerBar.tsx` | 吸底占位条，点击打开 Sheet |
| `ActivityCommentComposerSheet` | `components/interest/ActivityCommentComposerSheet.tsx` | 文本框、图片选择、发布、校验 |
| `CommentImageGrid` | `components/interest/CommentImageGrid.tsx` | 只读展示：1/2/3 列自适应 |
| `CommentImagePicker` | `components/interest/CommentImagePicker.tsx` | 编辑态：添加、预览、删除，上限 9 |

图片读取逻辑复用 `ActivityCoverUpload` 模式：`FileReader.readAsDataURL`，校验类型与 5MB 上限，toast 报错。

头像复用现有员工数据 `getEmployee` + 小组模块圆形头像样式（与成员列表一致）。

---

## 5. 数据模型

### 5.1 类型（`interestTypes.ts`）

```ts
export type ActivityComment = {
  id: string;
  activityId: string;
  authorId: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
};
```

### 5.2 Mock API（`interestGroups.ts` 或独立 `activityComments.ts`）

```ts
getActivityComments(activityId: string): ActivityComment[]
addActivityComment(activityId, authorId, { content, imageUrls }): ActivityComment | undefined
deleteActivityComment(commentId, authorId): boolean
```

**`addActivityComment` 规则**：

- `content.trim()` 与 `imageUrls.length` 至少一项非空，否则返回 `undefined`。
- `imageUrls.length` ≤ 9。
- 写入后对应 `activity.commentCount = (commentCount ?? 0) + 1`。
- `createdAt` 为 ISO 字符串。

**`deleteActivityComment` 规则**：

- 仅 `authorId === CURRENT_EMPLOYEE_ID` 可删。
- 删除后 `commentCount` 减 1，下限 0。

### 5.3 初始 Mock 数据

为 `act-1`、`act-7` 各预置 2–3 条带图/纯文评论，便于演示列表与九宫格。

---

## 6. 交互细则

### 6.1 发布

1. 点击吸底条 → 打开 Sheet，聚焦文本框。
2. 点击 📷 或 Sheet 内「+」→ 系统文件选择（`multiple`，但总数不超过 9）。
3. 「发布」按钮：无有效内容时 `disabled`；发布中防重复点击。
4. 成功：toast「评论已发布」、关闭 Sheet、清空草稿、`commentCount` 与列表刷新、滚动至最新评论。

### 6.2 删除

- 本人评论右上角「⋯」或长按 →「删除」→ `AlertDialog` 二次确认。
- 成功：toast「已删除」、列表与计数更新。

### 6.3 图片展示

| 张数 | 布局 |
|------|------|
| 1 | 单列宽图，`max-h-[200px]`，`rounded-xl`，`object-cover` |
| 2–4 | 2 列方格 |
| 5–9 | 3 列方格 |

点击缩略图：MVP 可用全屏简单预览（`Dialog` 或新页面）；若工期紧可二期再做，首版仅展示网格。

### 6.4 空状态

无评论时列表区展示：`暂无评论，来说第一句吧`（`interestTypography.emptyCompact` 风格）。

### 6.5 权限与可见性

- 评论能力不校验报名状态、小组成员身份。
- 活动 `invite_only` 等不可见场景下用户本无法进入详情，无需额外分支。
- 未登录：当前原型恒为 `CURRENT_EMPLOYEE_ID`，与现有模块一致。

---

## 7. 视觉规范

- 评论区外层：`rounded-2xl bg-card p-4 shadow-soft`（与同页卡片一致）。
- 标题：`评论 (N)`，`text-sm font-medium`。
- 评论间距：`space-y-4`；单条之间可用 `border-b border-border/60` 分隔最后一条除外。
- 姓名：`text-sm font-medium`；部门：`text-xs text-muted-foreground`。
- 正文：`text-sm leading-relaxed`。
- 时间：`text-xs text-muted-foreground`（相对时间：刚刚 / N 分钟前 / 昨天 / 日期）。
- 吸底条：白底、`border-t`、`backdrop-blur`、高度约 48–52px，与报名栏视觉层级区分（评论条略浅、无实心主色底）。

---

## 8. 集成点

### 8.1 `ActivityDetail.tsx`

- 在组织者/报名信息区块之后挂载 `ActivityCommentSection`。
- 在 `footer` 之上挂载 `ActivityCommentComposerBar` + `ActivityCommentComposerSheet`。
- `isEditing` 时不渲染评论相关组件。
- 调整 `main` 的 `padding-bottom` 以适配双层底栏。

### 8.2 与 `commentCount` 字段

- 活动卡片/列表若后续展示评论数，直接读 `activity.commentCount`（字段已存在于 `GroupActivity`）。

---

## 9. 错误处理

| 场景 | 处理 |
|------|------|
| 非图片文件 | toast「请选择图片文件」 |
| 单张 > 5MB | toast「单张图片不能超过 5MB」 |
| 超过 9 张 | toast「最多上传 9 张图片」；选择时截断至剩余名额 |
| 无文字无图点发布 | 按钮禁用，不提交 |
| 发布失败 | toast「发布失败，请稍后重试」 |

---

## 10. 测试要点（手动）

1. `act-7` 详情：可见预置评论、图片九宫格。
2. 纯文字、纯图片、文字+多图（9 张边界）发布。
3. 有报名底栏时，评论条不被遮挡；滚动到底可看到全部评论。
4. 删除自己的评论后计数减少。
5. 活动已终止：仍可发评论。
6. 编辑模式不出现评论区。

---

## 11. 二期扩展（记录，不实现）

- 回复、点赞、@、通知。
- 真实图片 CDN 上传与压缩。
- 组长删评、举报与审核。
- 评论排序切换（最新/最热）。
