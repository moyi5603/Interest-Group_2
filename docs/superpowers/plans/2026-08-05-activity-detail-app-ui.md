# Activity Detail App UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild C-end `ActivityDetail` into an App-like layout: immersive hero, clear sections, sticky CTA-only bottom bar, comment compose in a Sheet.

**Architecture:** Keep all enroll/join/series logic in `ActivityDetail`; restructure JSX and add `commentSheetOpen` state. Reuse `Sheet`, `SessionSlotTile`, `FloatBtn`, existing actions. No store API changes.

**Tech Stack:** Static Babel React in `site/assets/*.js`, CSS variables, existing `Sheet` / `Btn` / `Icon`.

**Spec:** `docs/superpowers/specs/2026-08-05-activity-detail-app-ui-design.md`

---

### Task 1: Comment Sheet state + bottom bar without compose

**Files:**
- Modify: `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js` (`ActivityDetail`)

- [x] **Step 1: Add comment sheet state**

Near other `useState` in `ActivityDetail`:

```javascript
const [commentSheetOpen, setCommentSheetOpen] = React.useState(false);
```

Update `startReply` to open the sheet; `cancelReply` / successful `send` to close it:

```javascript
const startReply = (c) => {
  setReplyTo(c);
  setDraft('');
  setCommentSheetOpen(true);
};
const openCommentCompose = () => {
  setReplyTo(null);
  setDraft('');
  setCommentSheetOpen(true);
};
const cancelReply = () => {
  setReplyTo(null);
  setDraft('');
  setCommentSheetOpen(false);
};
// in send(), after toast:
setCommentSheetOpen(false);
```

- [x] **Step 2: Strip compose from sticky bottom bar**

Remove the reply banner + input row from the sticky bar. Keep: join hint (when needed), like + CTA row.

- [x] **Step 3: Add comment Sheet**

After pick-enroll `Sheet` (or nearby), add:

```javascript
<Sheet open={commentSheetOpen} onClose={cancelReply} title={replyTo ? `回复 @${replyTo.author.replace(/ · AI$/, '')}` : '写评论'}>
  <div style={{ padding: '8px 14px calc(12px + env(safe-area-inset-bottom))' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', borderRadius: 14, padding: '6px 6px 6px 14px' }}>
      <input value={draft} onChange={e => setDraft(e.target.value)}
        placeholder={replyTo ? `回复 ${replyTo.author.replace(/ · AI$/, '')}…` : '说点什么…'}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        autoFocus
        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none', padding: '10px 0' }} />
      <button type="button" onClick={send} style={{ width: 38, height: 38, borderRadius: 12, background: draft.trim() ? 'var(--brand)' : 'var(--line-2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
        <Icon name="send" size={17} />
      </button>
    </div>
  </div>
</Sheet>
```

- [ ] **Step 4: Manual check**

Open any activity detail → bottom bar has no text field; enroll still works.

---

### Task 2: Restructure layout (hero + sections + write comment CTA)

**Files:**
- Modify: `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js`

- [ ] **Step 1: Hero height + title block**

Set cover height to `260`. Keep FloatBtn back + bottom tags. After hero, title block with optional status chip (`ended` → 已结束; `seriesJoined` / `joinedByMe` → 已报名 when appropriate).

- [ ] **Step 2: Section order**

Inside content column (`padding: '16px 16px 24px'`, `gap: 18`):

1. Title block  
2. Collapsed-ended control OR info card + slots + desc + tags  
3. Moments (existing condition)  
4. Comments header + list + write button:

```javascript
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
  <SectionHeader title={`评论 ${comments.length}`} accent="var(--brand)" />
  <Btn variant="soft" size="sm" icon="edit" onClick={openCommentCompose}>写评论</Btn>
</div>
```

(If `SectionHeader` already fills width, put title row as flex with button instead of nesting.)

Prefer:

```javascript
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
  <div style={{ fontSize: 16, fontWeight: 800 }}>评论 <span style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{comments.length}</span></div>
  <Btn variant="soft" size="sm" onClick={openCommentCompose}>写评论</Btn>
</div>
```

- [ ] **Step 3: Info card polish**

Slightly increase card padding to `14px 16px`, gap `10`. Keep MetaRows. Single-act progress block unchanged logically.

- [ ] **Step 4: Manual check**

Scroll order matches spec; write comment opens Sheet.

---

### Task 3: Sessions copy 期→场 + tile touch

**Files:**
- Modify: `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js`

- [ ] **Step 1: Replace visible 期 with 场 in ActivityDetail**

Examples:

- `共${episodes.length}期` → `共 ${episodes.length} 场`
- `系列场次 · 共 {n} 期` → `场次 · 共 {n} 场`
- `整场报名 · 共 {n} 期` → `整场报名 · 共 {n} 场`
- pick sheet hints already say 场次; ensure no 期 left in this component’s user-facing strings

- [ ] **Step 2: SessionSlotTile touch (list mode)**

In `SessionSlotTile`, for non-grid horizontal tiles, ensure min width ≥ 88 and padding comfortable (e.g. `padding: '10px 12px'`). Do not break grid pick sheet.

- [ ] **Step 3: Manual check**

Series + recurring detail: labels say 场; tiles easy to tap.

---

### Task 4: Cache bust + verify matrix

**Files:**
- Modify: `site/index.html` (script `6e9cd9ec…js?v=`)

- [ ] **Step 1: Bump** `?v=20260805af` (or next)

- [ ] **Step 2: Verify checklist**

| Case | Expect |
|------|--------|
| Once upcoming | Hero, info, progress, CTA enroll |
| Recurring | Horizontal sessions, adjust sheet |
| Series independent | 场 copy, multi-select enroll |
| Series all | 整场报名 meta, single enroll |
| Non-member | Hint + 报名并加入小组 |
| Ended | Collapse detail; moments/comments; no enroll |
| Comment | Write/reply via Sheet only |

- [ ] **Step 3: Commit only if user asks**

Do not commit unless explicitly requested.

---

## Spec coverage

| Spec | Task |
|------|------|
| Immersive hero + sections | 2 |
| CTA-only bar | 1 |
| Comment Sheet | 1–2 |
| 期→场 + session touch | 3 |
| Business logic unchanged | all (no action changes) |
| Cache / verify | 4 |
