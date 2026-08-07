# AI Guide Group Fuzzy Select Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In `ActAiGuide` step 0 (所属小组), replace dump-all chips with session-input fuzzy match, unique-hit confirm, multi-hit chips, and random-4 shortcuts.

**Architecture:** Keep one step (`key === 'group'`) with sub-phase `pick | confirm`. Pure helpers `fuzzyMatchGroups` / `pickRandomGroups` feed `groupCandidates` / `pendingGroup`. `sendText` gains a group branch; bottom composer shows for `group` as well as title/loc/cap/desc.

**Tech Stack:** Static React via Babel in `site/assets/*.js`; existing `ActAiGuide` chip / `commit` / `push` patterns.

**Spec:** `docs/superpowers/specs/2026-08-05-act-ai-guide-design.md`（「所属小组」节）

**Commits:** Do not commit unless the user explicitly asks.

---

## File map

| File | Role |
|------|------|
| `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` | Helpers + `ActAiGuide` state / UI / `sendText` / composer visibility |
| `site/index.html` | Cache-bust `?v=` on `191074b9` script |

No new files. Helpers live just above `ActAiGuide` (near `AI_GUIDE_Q`).

---

### Task 1: Pure helpers

**Files:**
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (insert before `function ActAiGuide`)

- [ ] **Step 1: Add helpers**

Insert immediately before `function ActAiGuide`:

```javascript
function fuzzyMatchGroups(groups, query) {
  const q = String(query || '').trim();
  if (!q) return [];
  return (groups || []).filter(g => String(g.name || '').includes(q));
}

function pickRandomGroups(groups, n) {
  const list = (groups || []).slice();
  const limit = Math.min(typeof n === 'number' ? n : 4, list.length);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  return list.slice(0, limit);
}
```

- [ ] **Step 2: Verify helpers in Node (no DOM)**

Run from repo root:

```bash
node -e '
function fuzzyMatchGroups(groups, query) {
  const q = String(query || "").trim();
  if (!q) return [];
  return (groups || []).filter(g => String(g.name || "").includes(q));
}
function pickRandomGroups(groups, n) {
  const list = (groups || []).slice();
  const limit = Math.min(typeof n === "number" ? n : 4, list.length);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  return list.slice(0, limit);
}
const groups = [
  { id: "g1", name: "城市夜跑团" },
  { id: "g2", name: "周末徒步野行" },
  { id: "g3", name: "深夜读书会" },
  { id: "g4", name: "周五观影会" },
  { id: "g5", name: "桌游电竞局" },
  { id: "g6", name: "职场成长营" },
  { id: "g7", name: "暖心公益志愿队" },
  { id: "g8", name: "羽毛球俱乐部" },
  { id: "g9", name: "视觉设计交流组" },
];
console.assert(fuzzyMatchGroups(groups, "夜跑").length === 1);
console.assert(fuzzyMatchGroups(groups, "球").length >= 2);
console.assert(fuzzyMatchGroups(groups, "xyz").length === 0);
console.assert(fuzzyMatchGroups(groups, "  ").length === 0);
console.assert(pickRandomGroups(groups, 4).length === 4);
console.assert(pickRandomGroups(groups.slice(0, 2), 4).length === 2);
console.log("ok");
'
```

Expected: prints `ok` (no assert failure).

---

### Task 2: State + chip UI in `ActAiGuide`

**Files:**
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (`ActAiGuide`)

- [ ] **Step 1: Add state next to existing `useState` block**

After `const [previewOpen, setPreviewOpen] = React.useState(false);` add:

```javascript
  const [groupPhase, setGroupPhase] = React.useState('pick'); // pick | confirm
  const [groupCandidates, setGroupCandidates] = React.useState(() => pickRandomGroups(groups, 4));
  const [pendingGroup, setPendingGroup] = React.useState(null);
```

- [ ] **Step 2: Add `selectGroup` helper inside component**

After `const commit = ...` block, add:

```javascript
  const selectGroup = (gr) => {
    if (!gr || busy) return;
    setPendingGroup(null);
    setGroupPhase('pick');
    commit(gr.name, { gid: gr.id, cat: gr.cat || 'sport' }, 1);
  };

  const refreshGroupShortcuts = () => {
    setGroupPhase('pick');
    setPendingGroup(null);
    setGroupCandidates(pickRandomGroups(groups, 4));
  };
```

- [ ] **Step 3: Replace group chip block**

Replace the block:

```javascript
        {!busy && key === 'group' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {groups.map(gr => chip(gr.name, () => commit(gr.name, { gid: gr.id, cat: gr.cat || 'sport' }, 1), draft.gid === gr.id))}
          </div>
        )}
```

with:

```javascript
        {!busy && key === 'group' && groupPhase === 'pick' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {groupCandidates.map(gr => chip(gr.name, () => selectGroup(gr), draft.gid === gr.id))}
          </div>
        )}
        {!busy && key === 'group' && groupPhase === 'confirm' && pendingGroup && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {chip('是', () => selectGroup(pendingGroup), false)}
            {chip('否', () => {
              push('user', '否');
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                refreshGroupShortcuts();
                push('ai', '好的，再输入小组名称，或点下面快捷选～');
              }, 420);
            }, false)}
          </div>
        )}
```

Note: `chip` uses `key={label}`; 「是」「否」labels are unique in that row — OK.

---

### Task 3: `sendText` group branch + show composer

**Files:**
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (`sendText` + bottom input visibility)

- [ ] **Step 1: Handle group in `sendText`**

At the start of `sendText`, after `if (!t || busy) return;`, add:

```javascript
    if (key === 'group') {
      push('user', t);
      setBusy(true);
      setInput('');
      const hits = fuzzyMatchGroups(groups, t);
      setTimeout(() => {
        setBusy(false);
        if (hits.length === 0) {
          setGroupPhase('pick');
          setPendingGroup(null);
          setGroupCandidates(pickRandomGroups(groups, 4));
          push('ai', '没找到相关小组，换个名字试试～');
          return;
        }
        if (hits.length === 1) {
          setGroupPhase('confirm');
          setPendingGroup(hits[0]);
          setGroupCandidates([]);
          push('ai', `是「${hits[0].name}」吗？`);
          return;
        }
        setGroupPhase('pick');
        setPendingGroup(null);
        setGroupCandidates(hits);
        push('ai', '找到这几个，选一个吧～');
      }, 420);
      return;
    }
```

Empty `groups` edge (spec): if `groups.length === 0`, before matching:

```javascript
      if (!groups.length) {
        push('user', t);
        setInput('');
        push('ai', '暂无可用小组');
        return;
      }
```

(Place this check at the top of the `key === 'group'` branch.)

- [ ] **Step 2: Show bottom composer for group**

Change the composer condition from:

```javascript
      {((['title', 'loc', 'cap', 'desc'].includes(key))
        || (key === 'when' && draft.type === 'series' && seriesPhase === 'count')) && !busy && (
```

to:

```javascript
      {((['group', 'title', 'loc', 'cap', 'desc'].includes(key))
        || (key === 'when' && draft.type === 'series' && seriesPhase === 'count')) && !busy && (
```

- [ ] **Step 3: Group placeholder**

In the input `placeholder={...}` expression, add group first:

```javascript
            placeholder={
              key === 'group' ? '输入小组名称'
                : key === 'when' ? '场数，例如 7'
                : key === 'cap' ? '例如 20'
                : key === 'desc' ? '自己写简介…'
                : '输入回复…'
            }
```

---

### Task 4: Cache-bust + full-data hand test

**Files:**
- Modify: `site/index.html` (script tag for `191074b9`)

- [ ] **Step 1: Bump cache-bust**

In `site/index.html`, change:

```html
<script type="text/babel" src="assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js?v=20260806p"></script>
```

to a new suffix, e.g. `?v=20260806q`.

- [ ] **Step 2: Hand test against full `DB.groups`**

Open mobile admin → 活动 → AI 对话创建（`actAiCreate`）。Use **all** groups below — not only sample words.

| id | name | Unique probe (expect confirm) | Shared probe notes |
|----|------|-------------------------------|--------------------|
| g1 | 城市夜跑团 | `夜跑` or full name | |
| g2 | 周末徒步野行 | `徒步` or full name | |
| g3 | 深夜读书会 | `读书` or full name | `深` may hit g1? No — only g3 has 深. `会` hits g3+g4 |
| g4 | 周五观影会 | `观影` or full name | `会` → multi |
| g5 | 桌游电竞局 | `桌游` or full name | |
| g6 | 职场成长营 | `职场` or full name | |
| g7 | 暖心公益志愿队 | `公益` or full name | |
| g8 | 羽毛球俱乐部 | `羽毛球` or full name | `球` → g8 only? 城市夜跑团 has no 球 — only g8. Use `部` for multi (俱乐部+交流组? 视觉设计交流组 has 组 not 部). `俱乐部` unique. For multi use `会` (读书会+观影会) |
| g9 | 视觉设计交流组 | `视觉` or full name | |

Checklist:

1. **进场**：最多 4 随机 chip；点任一 → 类型步；用户气泡 = 组名  
2. **唯一**：对上表每个组用「Unique probe」→ 「是「{name}」吗？」→ 是 = 类型步；否 = 回 pick + 新随机 ≤4 + 文案  
3. **多命中**：输入 `会` → 候选含 深夜读书会 + 周五观影会（及任何其它含「会」的组）全出；点选 commit  
4. **零命中**：输入 `xyz无此组` → 提示换名字 + 新随机 ≤4；可继续输入  
5. **confirm 再搜**：唯一命中后不点是/否，再输入另一组 Unique probe → 新 0/1/N 流程  
6. **回归**：选定后类型→标题…→发布路径仍可用  

- [ ] **Step 3: Done**

Report which probes passed. Do not commit unless user asks.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| 进场随机 ≤4 chip + 会话输入 | Task 2 + Task 3 |
| 点 chip 直接 commit | Task 2 `selectGroup` |
| 模糊 includes / trim | Task 1 `fuzzyMatchGroups` |
| 0 命中文案 + 新随机 4 | Task 3 |
| 1 命中 confirm 是/否 | Task 2 + Task 3 |
| N 命中全部候选 | Task 3 `setGroupCandidates(hits)` |
| confirm 再输入 = 新搜索 | Task 3 (same branch, no phase gate on send) |
| 空输入不发送 | existing `if (!t \|\| busy) return` |
| groups 空 | Task 3 empty check |
| 全量数据手测 | Task 4 |
| 后续步骤不动 | no changes outside group step |

No TBD / placeholder steps. Names consistent: `groupPhase`, `groupCandidates`, `pendingGroup`, `fuzzyMatchGroups`, `pickRandomGroups`, `selectGroup`, `refreshGroupShortcuts`.
