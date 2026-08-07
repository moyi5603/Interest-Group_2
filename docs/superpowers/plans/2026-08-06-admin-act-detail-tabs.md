# Mobile Admin Act Detail Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On mobile admin `AdminActDetail` only, split body into tabs (活动描述 / 报名情况 / 评论&互动 / 精彩瞬间); keep 4 StatCards above tabs with click-to-switch.

**Architecture:** Reuse `AdminGroupDetail` tab chrome. Add `tab` state in `AdminActDetail`. Mobile branch: stats + tab bar + one panel. PC branch: keep current two-column layout unchanged.

**Tech Stack:** Static Babel React in `site/assets/*.js`; existing `StatCard`, `CommentsView`, `MomentsGrid`.

**Spec:** `docs/superpowers/specs/2026-08-06-admin-act-detail-tabs-design.md`

**Commits:** Do not commit unless the user explicitly asks.

---

## File map

| File | Role |
|------|------|
| `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` | `AdminActDetail` — tab state, mobile body restructure |
| `site/index.html` | cache-bust `5f3ec28e…` |

No new files. `MomentsGrid` already in `191074b9-…js` (global).

---

### Task 1: Tab state + mobile body (stats / tabs / panels)

**Files:**
- Modify: `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` (`AdminActDetail` ~862–1168)

- [ ] **Step 1: Add state + tabs + moms**

Inside `AdminActDetail`, after existing `aUseState` hooks (~865–868), add:

```javascript
const [tab, setTab] = aUseState('desc');
```

After `momentCount` (~905), add:

```javascript
const moms = DB.moments.filter(m => commentActs.some(x => x.id === m.aid));
const detailTabs = [
  ['desc', '活动描述'],
  ['signups', '报名情况'],
  ['comments', '评论&互动'],
  ['moments', '精彩瞬间'],
];
```

- [ ] **Step 2: Extract shared content fragments**

Before `return`, define JSX fragments (reuse current markup bodies; do not change PC logic inside them):

```javascript
const descPanel = (
  <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: mobileAdmin ? 14 : 22 }}>
    {!mobileAdmin && <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>活动描述</div>}
    {desc
      ? <div className="richtext" style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: desc }} />
      : <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>暂无描述</div>}
  </div>
);

const commentsPanel = (
  <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: mobileAdmin ? 14 : 22 }}>
    {!mobileAdmin && <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>评论 & 互动</div>}
    <CommentsView acts={commentActs} inline />
  </div>
);

const signupsPanel = (
  <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: mobileAdmin ? 14 : 22, minWidth: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>报名情况</div>
      <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700 }}>
        {recentSessions
          ? `最近 ${recentSessions.length} 场`
          : signupBlocksDisplay
            ? `共 ${signupBlocksDisplay.length} ${isSeries ? '期' : '场'}`
            : (full ? '已满员' : `余 ${cap - signed} 位`)}
      </span>
    </div>
    {isSeries && mode === 'all' && (
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>整场报名模式</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>各期共用同一批报名成员</div>
      </div>
    )}
    {signupBlocksDisplay ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {signupBlocksDisplay.map(s => renderSignupBlock(
          s,
          isSeries && mode === 'all' ? activeEp.signed : null
        ))}
      </div>
    ) : (
      <div style={{ borderRadius: 13, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div onClick={() => toggleSession('single')}
          style={{ padding: '11px 13px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in oklch, var(--brand) 6%, var(--surface-2))'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>已报名 {signed}/{cap}</span>
            <Icon name={sessionOpen.single ? 'chevD' : 'chevR'} size={16} style={{ color: 'var(--ink-3)' }} />
          </div>
          <ProgressBar value={signed} max={cap} color={SIGNUP_BAR} height={8} />
        </div>
        {sessionOpen.single && (
          <div style={{ padding: '0 13px 12px', borderTop: '1px solid var(--line)' }} className="fade">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', margin: '10px 0 8px' }}>已报名 ({signed})</div>
            <SignupAvatars count={signed} modalTitle={`${title} · 已报名 (${signed})`} />
          </div>
        )}
      </div>
    )}
  </div>
);

const momentsPanel = (
  <MomentsGrid
    moms={moms}
    navBack={{ section: 'actDetail', aid: aIn.id, ...(back ? { back } : {}) }}
    emptyText="暂无精彩瞬间"
  />
);

const statsRow = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: mobileAdmin ? 6 : 16 }}>
    <StatCard compact={!!mobileAdmin} icon="ticket"
      label={recentSessions ? '已报名 · 最近5场' : signupBlocksDisplay ? (isSeries && mode === 'all' ? '已报名 · 整场' : '已报名 · 全部场次') : '已报名'}
      value={`${signed}/${cap}`} color="var(--brand)"
      onClick={mobileAdmin ? () => setTab('signups') : undefined} />
    <StatCard compact={!!mobileAdmin} icon="heart" label="点赞" value={likes} color="var(--c-music)"
      onClick={mobileAdmin ? () => setTab('comments') : undefined} />
    <StatCard compact={!!mobileAdmin} icon="comment" label="评论" value={commentCount} color="var(--c-reading)"
      onClick={mobileAdmin ? () => setTab('comments') : undefined} />
    <StatCard compact={!!mobileAdmin} icon="image" label="精彩瞬间" value={momentCount} color="var(--sun)"
      onClick={mobileAdmin ? () => setTab('moments') : undefined} />
  </div>
);
```

Note: if `navBack` shape for act detail is unknown to MomentsGrid consumers, mirror group detail: `navBack={{ section: 'actDetail', aid }}` — confirm `setView` accepts this elsewhere; if act detail back uses `backTo`, pass `navBack={backTo}` instead (simpler, preferred):

```javascript
navBack={backTo}
```

- [ ] **Step 3: Replace body after hero/meta**

Replace the block starting at:

```javascript
      <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: mobileAdmin ? 14 : 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', ...
```

through the closing of that outer padding `</div>` (before `SignupMembersModal`) with:

```javascript
      {mobileAdmin ? (
        <>
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ padding: `${pad}px ${pad}px 0` }}>{statsRow}</div>
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flexWrap: 'nowrap', marginTop: 10 }} className="noscroll">
              {detailTabs.map(([k, l]) => (
                <button key={k} type="button" onClick={() => setTab(k)}
                  style={{
                    padding: '10px 12px', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                    color: tab === k ? 'var(--brand-600)' : 'var(--ink-3)',
                    borderBottom: tab === k ? '2.5px solid var(--brand)' : '2.5px solid transparent',
                    marginBottom: -1, border: 'none', background: 'transparent', cursor: 'pointer',
                  }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: pad, paddingBottom: 24 }}>
            {tab === 'desc' && descPanel}
            {tab === 'signups' && signupsPanel}
            {tab === 'comments' && commentsPanel}
            {tab === 'moments' && momentsPanel}
          </div>
        </>
      ) : (
        <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {statsRow}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 22, alignItems: 'flex-start' }}>
            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
              {descPanel}
              {commentsPanel}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>{signupsPanel}</div>
          </div>
        </div>
      )}
```

Keep `SignupMembersModal` + terminate/delete dialogs unchanged after this block.

- [ ] **Step 4: Hand check (mobile)**

Open mobile admin → 活动 → 任一详情：

1. Default tab = 活动描述  
2. Switch all 4 tabs; only one panel visible  
3. Tap 已报名 / 点赞 / 评论 / 精彩瞬间 cards → correct tab  
4. 精彩瞬间：有数据网格 / 无数据「暂无精彩瞬间」  
5. PC admin act detail：仍两栏，无 tab 栏  

---

### Task 2: Cache bust

**Files:**
- Modify: `site/index.html` (~3532)

- [ ] **Step 1: Bump query**

Change:

```html
<script type="text/babel" src="assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js?v=20260806v"></script>
```

to:

```html
<script type="text/babel" src="assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js?v=20260806tab"></script>
```

(If version string already advanced past `v`, use next letter / `tab2`.)

- [ ] **Step 2: Hard refresh verify**

Hard refresh mobile admin act detail; confirm new tab UI loads (not cached old scroll stack).

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Mobile-only tabs | Task 1 Step 3 |
| 4 tab labels + content | Task 1 Steps 1–3 |
| Default `desc` | Task 1 Step 1 |
| StatCard → tab | Task 1 Step 2 `onClick` |
| MomentsGrid + empty | Task 1 Step 2 `momentsPanel` |
| PC unchanged | Task 1 Step 3 else branch |
| Cache bust | Task 2 |
