# 兴趣小组 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 humanistic-care 原型中实现兴趣小组 MVP：标签与推荐、官方/自发小组、四类活动、报名与自发组报备 Banner、AI 推荐/文案/对话，UI 对齐悦文化卡片风格。

**Architecture:** 新建 `src/data/interest*.ts` 承载 mock 实体与 localStorage 档案；`src/lib/interestRecommend.ts` / `interestAgent.ts` / `interestVisibility.ts` 承载纯函数业务逻辑；页面与卡片组件仿 `HumanityCare` + 悦文化活动卡片；路由挂于 `/agents/interest-groups/*`，从 `MoreAgents` 的 `dev-interest-group` 入口进入。

**Tech Stack:** React 18, TypeScript, Vite, react-router-dom v6, Tailwind, Radix UI（已有 `tabs`/`dialog`/`alert-dialog`），无单元测试框架——用 `npm run build` + 规格 §13 手工验收。

**Spec:** [`docs/superpowers/specs/2026-05-26-interest-group-design.md`](../specs/2026-05-26-interest-group-design.md)  
**UI 参考:** [`docs/superpowers/specs/2026-05-26-exp-yueculture-app-ui-style.md`](../specs/2026-05-26-exp-yueculture-app-ui-style.md)

**Current user（原型）:** `employeeId = "u1"`（张敏），与 `colleagueData` 一致。

---

## File map

| 文件 | 职责 |
|------|------|
| `src/data/interestTypes.ts` | 全部 TS 类型导出 |
| `src/data/interestTags.ts` | 标签词典 |
| `src/data/interestGroups.ts` | 小组、活动、场次、报名 mock + CRUD helpers |
| `src/data/interestProfileStore.ts` | 当前用户兴趣标签 localStorage |
| `src/data/interestCopyPools.ts` | AI 文案 mock 池 |
| `src/lib/interestVisibility.ts` | 小组/活动可见性过滤 |
| `src/lib/interestRecommend.ts` | 小组/活动打分推荐 |
| `src/lib/interestOccurrences.ts` | 周期 RRULE 简化为「每周/每月」生成场次 |
| `src/lib/interestAgent.ts` | 对话意图 mock |
| `src/components/interest/*` | 卡片、Banner、话题面板等 |
| `src/pages/interest/*` | 各页面 |
| `src/App.tsx` | 路由注册 |
| `src/pages/MoreAgents.tsx` | 入口 navigate |
| `src/pages/EmployeeDetail.tsx` | 小组卡片跳转 |
| `src/components/agent/SuggestedQuestions.tsx` | 链到兴趣小组 |

---

## Spec coverage checklist

| Spec § | Task |
|--------|------|
| 标签自填+AI补全 | Task 2, 8 |
| 官方/自发+先上线后报备 | Task 1, 5, 6 |
| 活动 ABCD | Task 1, 7 |
| AI A/C/D | Task 3, 7, 9 |
| 可见性 AC | Task 3, 4 |
| 路由 §8 | Task 10 |
| 悦文化 UI | Task 4+ |
| §13 测试要点 | 每 Task 末尾 Verify |

---

### Task 1: Types and mock data foundation

**Files:**
- Create: `src/data/interestTypes.ts`
- Create: `src/data/interestTags.ts`
- Create: `src/data/interestGroups.ts`

- [ ] **Step 1: Define types**

`src/data/interestTypes.ts`:

```typescript
export type TagSource = "manual" | "ai_suggested" | "inferred";
export type GroupType = "official" | "spontaneous";
export type GroupVisibility = "public" | "dept_only" | "invite_only";
export type ReportStatus = "pending_report" | "reported" | "flagged";
export type ActivityKind = "one_off" | "ongoing" | "recurring" | "series";
export type OccurrenceStatus = "scheduled" | "cancelled" | "completed";

export type InterestTag = {
  id: string;
  name: string;
  category: "运动" | "文艺" | "生活" | "科技";
};

export type ProfileTag = {
  tagId: string;
  source: TagSource;
  confidence?: number;
};

export type InterestGroup = {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  type: GroupType;
  visibility: GroupVisibility;
  deptIds?: string[];
  tagIds: string[];
  status: "active" | "archived";
  reportStatus?: ReportStatus;
  reportDueAt?: string; // ISO date
  memberCount: number;
  ownerId: string;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
};

export type GroupActivity = {
  id: string;
  groupId: string;
  title: string;
  description: string;
  activityKind: ActivityKind;
  location?: string;
  capacity?: number;
  enrollDeadline?: string;
  startAt?: string;
  endAt?: string;
  rrule?: string; // e.g. FREQ=WEEKLY;BYDAY=WE
  status: "draft" | "published" | "cancelled";
  enrollOpen?: boolean;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
};

export type ActivityOccurrence = {
  id: string;
  activityId: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  enrollCount: number;
  status: OccurrenceStatus;
};

export type ActivityEnrollment = {
  id: string;
  activityId: string;
  occurrenceId?: string;
  employeeId: string;
  enrolledAt: string;
  status: "enrolled" | "cancelled";
};

export type GroupMembership = {
  groupId: string;
  employeeId: string;
  role: "owner" | "admin" | "member";
};
```

- [ ] **Step 2: Tag dictionary**

`src/data/interestTags.ts` — 至少 12 个标签，覆盖 `interestPool` 已有小组名（咖啡、电竞、读书、音乐、摄影、健身）并增加 `跑步`、`徒步`、`桌游` 等。

- [ ] **Step 3: Mock groups, activities, occurrences, memberships**

`src/data/interestGroups.ts` 导出：

- `CURRENT_EMPLOYEE_ID = "u1"`
- `interestGroups`: 6 组（3 official + 3 spontaneous），映射现有 `colleagueData` `interestPool` id（`ig1`…`ig6`）到新结构
- `groupMemberships`: u1 已加入 2 组
- `activities`: 每小组至少 1 个活动，覆盖四种 `activityKind`
- `occurrences`: `recurring` 预生成 4 条未来场次；`series` 父活动 + 3 子场次
- Helpers: `getGroupById`, `getActivitiesByGroup`, `getOccurrencesByActivity`, `joinGroup`, `createSpontaneousGroup`, `enrollActivity`, `markGroupReported`

自发组示例需含 `reportStatus: "pending_report"`, `reportDueAt` = 今天+7天。

- [ ] **Step 4: Verify build**

```bash
cd /Users/edy/Documents/需求/AI相关/Interest-Group && npm run build
```

Expected: exit 0（仅新 data 文件被 import 前可能无引用——Step 3 末尾在 `interestGroups.ts` 加 `export {}` 即可，Task 3 会引用）。

---

### Task 2: Profile store and AI tag suggestions

**Files:**
- Create: `src/data/interestProfileStore.ts`
- Create: `src/lib/interestTagSuggest.ts`

- [ ] **Step 1: localStorage profile**

`interestProfileStore.ts`:

```typescript
const KEY = "exp-interest-profile-u1";

export function getProfileTags(): ProfileTag[] { /* parse localStorage */ }
export function setProfileTags(tags: ProfileTag[]): void { /* stringify */ }
export function addManualTag(tagId: string): void { /* upsert source manual */ }
export function removeTag(tagId: string): void { /* filter */ }
export function confirmSuggestedTag(tagId: string): void { /* ai_suggested -> manual */ }
export function dismissSuggestedTag(tagId: string): void { /* push to dismissed list KEY2 */ }
```

默认种子：从 `employeesFull` u1 的 `interestGroups` + `skills` 映射 2 个 `manual` 标签。

- [ ] **Step 2: Suggestion helper**

`interestTagSuggest.ts`:

```typescript
export function getSuggestedTags(employeeId: string): InterestTag[] {
  // if profile.length >= 2 return []
  // map dept/skills/joined groups -> tag ids not in profile/dismissed
}
```

- [ ] **Step 3: Verify**

`npm run build` — pass.

---

### Task 3: Visibility and recommendation libs

**Files:**
- Create: `src/lib/interestVisibility.ts`
- Create: `src/lib/interestRecommend.ts`

- [ ] **Step 1: Visibility**

```typescript
import { getEmployee } from "@/data/colleagueData";

export function canViewGroup(group: InterestGroup, viewerId: string): boolean {
  const emp = getEmployee(viewerId);
  if (!emp || group.status !== "active") return false;
  if (group.visibility === "public") return true;
  if (group.visibility === "dept_only")
    return !!group.deptIds?.includes(emp.deptId) || emp.deptId === group.deptIds?.[0];
  // invite_only: member only for MVP
  return isMember(group.id, viewerId);
}
```

`isMember` 从 `interestGroups.ts` 导入。

- [ ] **Step 2: Recommend groups**

```typescript
export type ScoredGroup = { group: InterestGroup; score: number; reasons: string[] };

export function recommendGroups(viewerId: string, limit = 5): ScoredGroup[] {
  // tag intersection weights 10 each
  // deptBonus 5
  // officialBonus 3
  // exclude joined
  // if no tags: return official groups sorted by memberCount
}
```

- [ ] **Step 3: Recommend activities / occurrences**

```typescript
export function getUpcomingOccurrences(viewerId: string, limit = 10) { /* joined groups first */ }
export function getOngoingActivities(viewerId: string) { /* activityKind ongoing */ }
```

- [ ] **Step 4: Verify**

`npm run build` — pass.

---

### Task 4: Shared interest UI components

**Files:**
- Create: `src/components/interest/GroupCard.tsx`
- Create: `src/components/interest/ActivityCard.tsx`
- Create: `src/components/interest/ReportBanner.tsx`
- Create: `src/components/interest/SectionHeader.tsx`

- [ ] **Step 1: GroupCard** — 一行一列（悦文化）  
  字段：封面占位（渐变）、标题、官方/自发 badge、状态、成员数、tag chips、推荐理由（可选）、加入按钮。

- [ ] **Step 2: ActivityCard** — 对齐悦文化 §4.2  
  封面、标题、状态标签（未开始/进行中/已结束）、开始/结束时间、地点、底部赞/藏/评、报名按钮；`ended` 封面遮罩。

- [ ] **Step 3: ReportBanner** — 自发组 `pending_report` 时显示截止日与「我已报备」。

- [ ] **Step 4: Verify**

`npm run build` — pass.

---

### Task 5: Interest group home page

**Files:**
- Create: `src/pages/interest/InterestGroupHome.tsx`

- [ ] **Step 1: Page layout**

结构（`max-w-md`, sticky header 返回 + 标题「兴趣小组」）：

1. 若无标签或 `<2`：引导条 → `/profile/interests`
2. **为你推荐** — `recommendGroups` + `GroupCard`
3. **我的小组** — 已加入横向 scroll 或列表
4. **近期活动** — `getUpcomingOccurrences` + `ActivityCard`
5. **长期招募** — `getOngoingActivities`
6. 底部：**SuggestedTopics**（3 条）+ 输入栏 → `/agents/interest-groups/chat?q=`

- [ ] **Step 2: 快捷入口 4 宫格**（悦文化风格，本模块简化为 2×2）  
  我的兴趣 | 发起小组 | AI 对话 | 我的报名（报名列表可合并在 home 下方）

- [ ] **Step 3: Verify**

手动：打开 `/agents/interest-groups` 可见推荐与活动；`npm run build`。

---

### Task 6: Group detail and create

**Files:**
- Create: `src/pages/interest/GroupDetail.tsx`
- Create: `src/pages/interest/GroupCreate.tsx`

- [ ] **Step 1: GroupDetail**

- 顶部 `ReportBanner`
- 介绍、成员数、标签
- Tab：活动列表（按 kind 筛选 chips）
- 加入/已加入按钮（`invite_only` 非成员 toast「请联系组长」）

- [ ] **Step 2: GroupCreate**

表单：名称、描述、可见性、标签多选；提交调用 `createSpontaneousGroup`（立即 active + pending_report）；`navigate` 到详情。

- [ ] **Step 3: Verify**

创建自发组后详情页 Banner 出现；点「我已报备」Banner 消失；`npm run build`。

---

### Task 7: Activities — detail, create wizard, enroll

**Files:**
- Create: `src/lib/interestOccurrences.ts`
- Create: `src/data/interestCopyPools.ts`
- Create: `src/pages/interest/ActivityDetail.tsx`
- Create: `src/pages/interest/ActivityCreate.tsx`

- [ ] **Step 1: Occurrence generator**

```typescript
export function expandRecurringOccurrences(
  activity: GroupActivity,
  count = 4
): ActivityOccurrence[] {
  // parse simple rrule: WEEKLY + BYDAY or MONTHLY
  // generate from startAt
}
```

- [ ] **Step 2: Copy pools + reuse CareContentAiPanel**

`interestCopyPools.ts`: `titlePool`, `descPool` 各 10 条中文。

`ActivityCreate.tsx`:

- Step1: 选择 `activityKind`（4 卡片）
- Step2: 条件字段（one_off 时间；ongoing 无 end；recurring 每周/每月；series 仅标题）
- `CareContentAiPanel` 填入 title/description
- 保存 `published` 并返回 GroupDetail

- [ ] **Step 3: ActivityDetail**

信息顺序同悦文化 §4.3；底部互动数 + 报名；`recurring`/`series` 列出场次；满员禁用；`enrollActivity` + toast。

- [ ] **Step 4: Verify**

四种 kind 表单字段互斥；周期至少 4 场次；`npm run build`。

---

### Task 8: My interests profile page

**Files:**
- Create: `src/pages/interest/MyInterests.tsx`

- [ ] **Step 1: Tag editor**

- 已选 tags chips（可删除）
- 分类下列可选标签
- AI 建议区：`getSuggestedTags` chips → 添加/忽略

- [ ] **Step 2: Verify**

改标签后返回 home 推荐列表变化；`npm run build`。

---

### Task 9: AI chat page

**Files:**
- Create: `src/lib/interestAgent.ts`
- Create: `src/components/interest/ChatMessageList.tsx`
- Create: `src/pages/interest/InterestGroupChat.tsx`

- [ ] **Step 1: Intent parser**

```typescript
export type AgentIntent =
  | "recommend_group"
  | "list_activity"
  | "my_groups"
  | "create_hint"
  | "fallback";

export function parseIntent(input: string): AgentIntent { /* 关键词表 */ }

export function buildReply(intent: AgentIntent, viewerId: string): {
  text: string;
  groups?: InterestGroup[];
  activities?: /* occurrence + activity */;
};
```

- [ ] **Step 2: Chat UI**

仿 `HumanityCare` 对话区：消息气泡 + `GroupCard`/`ActivityCard` 嵌入；底部 `ChatInputBar`；首页话题点击带 `?q=` 自动发送。

- [ ] **Step 3: Verify**

输入「推荐跑步小组」「下周有什么活动」「我加入了哪些组」返回对应卡片；`npm run build`。

---

### Task 10: Routing and entry wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/MoreAgents.tsx`
- Modify: `src/pages/EmployeeDetail.tsx`
- Modify: `src/components/agent/SuggestedQuestions.tsx`
- Modify: `docs/superpowers/specs/2026-05-26-interest-group-design.md`（status → 已批准）

- [ ] **Step 1: Routes in App.tsx**

```tsx
import InterestGroupHome from "./pages/interest/InterestGroupHome.tsx";
import GroupDetail from "./pages/interest/GroupDetail.tsx";
import GroupCreate from "./pages/interest/GroupCreate.tsx";
import ActivityDetail from "./pages/interest/ActivityDetail.tsx";
import ActivityCreate from "./pages/interest/ActivityCreate.tsx";
import MyInterests from "./pages/interest/MyInterests.tsx";
import InterestGroupChat from "./pages/interest/InterestGroupChat.tsx";

// inside Routes:
<Route path="/agents/interest-groups" element={<InterestGroupHome />} />
<Route path="/agents/interest-groups/chat" element={<InterestGroupChat />} />
<Route path="/agents/interest-groups/new" element={<GroupCreate />} />
<Route path="/agents/interest-groups/:groupId" element={<GroupDetail />} />
<Route path="/agents/interest-groups/:groupId/activities/new" element={<ActivityCreate />} />
<Route path="/agents/interest-groups/activities/:activityId" element={<ActivityDetail />} />
<Route path="/profile/interests" element={<MyInterests />} />
```

- [ ] **Step 2: MoreAgents click**

```typescript
if (agent.id === "dev-interest-group") navigate("/agents/interest-groups");
```

- [ ] **Step 3: EmployeeDetail**

`interestGroups.map` 的卡片 `onClick={() => navigate(`/agents/interest-groups/${g.id}`)}`  
（将 `InterestGroup` id 从 `ig1` 映射到新 id，或统一迁移 mock id）

- [ ] **Step 4: SuggestedQuestions**

「如何加入兴趣小组？」→ `navigate("/agents/interest-groups")`

- [ ] **Step 5: Final verify**

```bash
npm run build
npm run lint
```

手工走查 spec §13 全部 checkbox。

---

## Manual acceptance (spec §13)

- [ ] 标签增删改后推荐列表变化
- [ ] 四种 activityKind 表单互斥正确
- [ ] 周期活动 ≥4 条未来场次
- [ ] 自发组创建后可发现，报备 Banner 正常
- [ ] 对话 mock：recommend_group、list_activity、my_groups
- [ ] dept_only 对非同部门不可见
- [ ] 他人 EmployeeProfile 不展示兴趣标签（保持现状）

---

## Out of scope (do not implement)

- 搭子匹配、向量推荐、运营后台、IM 推送、签到、真实 LLM API

---

## Revision

| Date | Note |
|------|------|
| 2026-05-26 | Initial plan from approved spec |
