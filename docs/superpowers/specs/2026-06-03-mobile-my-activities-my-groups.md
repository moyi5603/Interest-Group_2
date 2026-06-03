# 移动员工端「我的活动」与「我的小组」— 设计规格

**日期**：2026-06-03  
**范围**：`site/` 离线 HTML 原型（移动员工端）  
**状态**：已批准，待实现

---

## 背景

移动员工端 HomeTab 目前只提供「全部活动」和「全部小组」的发现入口，缺少员工查看**自己已加入小组**和**自己已报名活动**的专属视图。本次在 HomeTab 新增 2 个快捷按钮，并实现对应的两个新页面。

---

## 数据层

`site/` 原型中数据已具备：
- **已加入小组**：`store.groups.filter(g => g.joined === true)`
- **已报名活动**：`store.acts.filter(a => a.joinedByMe === true)`

无需改动数据层。

---

## 入口：HomeTab 快捷按钮

**位置**：AI 搜索栏（问话词）下方、「为你推荐」section 上方

**布局**：一排 2 个等宽按钮，与 `var(--surface)` 背景的卡片行对齐

| 图标 | 文字 | 目标 |
|---|---|---|
| `ticket` | 我的活动 | `nav.go('myActivities')` |
| `star` | 我的小组 | `nav.go('myGroups')` |

**视觉**：同一行左右排布，每个按钮圆角卡片（`borderRadius: 16`、`boxShadow: var(--shadow-sm)`），icon（24px）居中显示，文字在 icon 下方（`fontSize: 13`）。徽标数字：当 joined/joinedByMe 数量 > 0 时，在卡片右上角显示一个小计数圆点（`background: var(--brand)`，白字）。

---

## 页面 A：MyActivities（我的活动）

**触发**：`nav.go('myActivities')`  
**实现位置**：`9e8f0b88` 文件，`renderTop` 中注册 `case 'myActivities'`

### 布局

```
┌───────────────────────────────────┐
│ ← 我的活动                         │
├───────────────────────────────────┤
│ [ 全部 ] [ 未开始 ] [ 已结束 ]       │  ← tab 筛选
├───────────────────────────────────┤
│ ActivityCard                      │
│ ActivityCard                      │
│ ...                               │
│                                   │
│ （空态：还没有报名任何活动 · [去看看]）  │
└───────────────────────────────────┘
```

### 数据与筛选

- 来源：`store.acts.filter(a => a.joinedByMe)`
- Tab 筛选：
  - 全部：不筛选
  - 未开始：`a.status === 'upcoming'`（且日期在当前时间之后，原型中简化为 upcoming）
  - 已结束：`a.status === 'ended'`
- **不显示**已终止（`cancelled`）活动

### 卡片

复用已有的 `ActivityCard` 组件（原型中已有，展示封面缩图、标题、时间、报名状态）。点击 → `nav.go('activity', { aid: a.id })`

### 空态

- 全部 tab 为空：「还没有报名任何活动」+ 灰色副文「去报名一个活动吧」+ 「去看看」按钮（`nav.go('allActs')`）
- 筛选 tab 为空：「该状态下暂无活动」

---

## 页面 B：MyGroups（我的小组）

**触发**：`nav.go('myGroups')`  
**实现位置**：`9e8f0b88` 文件，`renderTop` 中注册 `case 'myGroups'`

### 布局

```
┌───────────────────────────────────┐
│ ← 我的小组                         │
├───────────────────────────────────┤
│ GroupCard                         │
│ GroupCard                         │
│ ...                               │
│                                   │
│ （空态：还没有加入任何小组 · [去探索]） │
└───────────────────────────────────┘
```

### 数据

- 来源：`store.groups.filter(g => g.joined)`
- 无筛选（全部展示）

### 卡片

复用已有的 `GroupCard` 组件（原型中已有，展示封面、名称、成员数、分类徽标）。点击 → `nav.go('group', { gid: g.id })`

### 空态

「还没有加入任何小组」+ 「去探索」按钮（`nav.go('allGroups')`）

---

## 实现范围

| 文件 | 修改内容 |
|---|---|
| `site/assets/9e8f0b88-*.js` | 新增 `MyActivities` 组件、`MyGroups` 组件；`renderTop` 中注册两个 case |
| `site/assets/9e8f0b88-*.js` | HomeTab 中在建议词下方插入 2 个快捷按钮 |

不需要改动其他文件。

---

## 不在范围内

- 退出小组、取消报名等操作（用户可在小组详情 / 活动详情页内完成）
- 活动排序（按时间、报名数等）
- `src/` 改动（src/ 已有对应功能）
