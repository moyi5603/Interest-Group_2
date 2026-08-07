# Mobile Admin App UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make `AdminApp variant="mobile"` feel like a native App (cards, compact chrome, fullscreen forms, ConfirmSheet) while keeping PC admin unchanged.

**Architecture:** Branch on `mobileAdmin` from `AdminCtx` inside existing Dashboard / Groups / Activities / Categories / forms. Add small shared helpers (`MobileAdminBar`, `AdminActRow`, fullscreen wrappers). No separate Mobile* page trees.

**Tech Stack:** Static React via Babel in `site/assets/*.js`; CSS variables; existing `ConfirmSheet` / `ActForm asPage` / `AIComposer asPage`.

**Spec:** `docs/superpowers/specs/2026-08-05-mobile-admin-app-ui-design.md`

**Commits:** Do not commit unless the user explicitly asks.

---

## File map

| File | Role |
|------|------|
| `site/assets/06091f2a-16af-41e1-9ea2-396272d1f95c.js` | `Topbar` mobile compact mode; optional `MobileAdminBar` |
| `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` | Dashboard polish; GroupsSection cards; ActTable→row list when mobile; group delete ConfirmSheet |
| `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` | ActivitiesSection list; CategoriesSection list; GroupForm/Cat form fullscreen; shell polish; hide tab chrome on detail/create |
| `site/index.html` | Cache-bust query on touched scripts |

---

### Task 1: Shared mobile chrome helpers

**Files:**
- Modify: `site/assets/06091f2a-16af-41e1-9ea2-396272d1f95c.js` (`Topbar` ~75–86)
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (mobile shell ~1713–1750)

- [x] **Step 1: Compact Topbar when mobile**

In `Topbar`, read optional prop or detect via caller passing `compact`:

```javascript
function Topbar({ title, sub, right, compact }) {
  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <div style={{ minWidth: 0 }}>
          {title ? <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div> : null}
          {sub ? <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div> : null}
        </div>
        {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{right}</div>}
      </div>
    );
  }
  // existing PC Topbar unchanged
}
```

- [x] **Step 2: Shell — hide top tabs on pushed views**

In mobile `AdminApp`, when `view.section` is `groupDetail` | `actDetail` | `actCreate` | `actAiCreate` | `groupForm` | `catForm`, render only content (no identity+tabs strip). Identity+tabs only on tab roots: `dashboard` | `groups` | `activities` | `categories`.

```javascript
const isRootTab = ['dashboard', 'groups', 'activities', 'categories'].includes(view.section);
// header (identity + tabs) only if isRootTab
```

- [x] **Step 3: Cache-bust**

Bump `?v=` on `06091f2a`, `5f3ec28e`, `191074b9` in `site/index.html`.

- [x] **Step 4: Verify**

Open `http://127.0.0.1:8081/` → 管理者 → Tab 可见；点进活动详情后顶 Tab 应消失、有返回。

---

### Task 2: Dashboard App layout

**Files:**
- Modify: `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` (`Dashboard`)

- [x] **Step 1: When `mobileAdmin`**

- `Topbar` with `compact`，无大副标题；右侧仅 AI 图标钮或短文案「AI」
- Keep 2×2 stats
- MiniBars height ~100 if possible (or leave)
- Replace `ActTable` in「近期活动」with vertical `AdminActRow` list (implement in Task 3; temporarily map simple rows here if Task 3 not done yet)

Simple interim row if needed:

```javascript
function AdminActRow({ a, onClick }) {
  const g = useA().store.groups.find(x => x.id === a.gid);
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
      padding: '12px 14px', border: 'none', background: 'var(--surface)', borderRadius: 14,
      boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
        <Cover src={a.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }} className="clamp1">{a.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{g?.name} · {a.date} {a.time}</div>
        <div style={{ marginTop: 6 }}><ProgressBar value={a.signed} max={a.cap} color={SIGNUP_BAR} height={5} /></div>
      </div>
      <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)' }} />
    </button>
  );
}
```

Export via `window` or keep file-local in `5f3ec28e` and reuse from Activities if same file; if Activities needs it, put `AdminActRow` in `5f3ec28e` and `Object.assign(window, { AdminActRow })` or define in `191074b9` and use from dashboard after load — **prefer define in `5f3ec28e` next to `ActTable`, assign to window**.

- [x] **Step 2: Verify**

管理者 → 工作台：2×2 卡、待审核行、近期活动为卡片行非表格。

---

### Task 3: Activities — card list, no table/pagination

**Files:**
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (`ActivitiesSection`)
- Modify: `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` (`ActTable` callers / `AdminActRow`)

- [x] **Step 1: Mobile ActivitiesSection**

```javascript
function ActivitiesSection() {
  const { store, openActForm, setView, mobileAdmin } = useA();
  // ... existing filters ...
  if (mobileAdmin) {
    const units = groupActs(list); // same grouping as ActTable
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
        <Topbar compact title="活动" right={<>
          <Btn variant="ai" size="sm" icon="spark" onClick={useAOpen}>AI</Btn>
          <Btn variant="primary" size="sm" icon="plus" onClick={() => openActForm(null)}>新建</Btn>
        </>} />
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AdminSearchBar value={actQ} onChange={setActQ} placeholder="搜索活动" width="100%" />
          <Segmented value={type} onChange={setType} options={[...]} />
          {units.map(unit => {
            const a = detailAct(unit) || unit.act || unit.eps?.[0];
            return <AdminActRow key={unit.key} unit={unit} onClick={() => setView({ section: 'actDetail', aid: a.id, back: { section: 'activities' } })} />;
          })}
        </div>
      </div>
    );
  }
  // existing PC return
}
```

Support both single act and series in `AdminActRow` (title = series name when series; show status pill).

- [x] **Step 2: Disable pagination on mobile**

`useAdminPagination(..., !!pagination && !mobileAdmin)` inside ActTable when still used on PC only; mobile path must not call ActTable.

- [x] **Step 3: Verify**

活动 Tab：卡片列表可点进详情；无表头「类型/时间/报名」表格。

---

### Task 4: Groups — single column + ConfirmSheet + fullscreen form route

**Files:**
- Modify: `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` (`GroupsSection`)
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (`GroupForm`, `AdminApp` render/actions)

- [x] **Step 1: Mobile GroupsSection layout**

- `Topbar compact` title「小组」, right `+`
- padding 12; search full width
- `gridTemplateColumns: '1fr'`; cover height 88
- `useAdminPagination` disabled: `useAdminPagination(list.length, ADMIN_PAGE.groups, !mobileAdmin)`
- Delete: if `mobileAdmin` use `ConfirmSheet` else existing Modal

```javascript
{mobileAdmin ? (
  <ConfirmSheet open={!!deleteTarget} title="删除小组"
    message={deleteTarget ? `确认删除「${deleteTarget.name}」？删除后不可恢复。` : ''}
    confirmLabel="删除" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
) : (
  <Modal>...</Modal>
)}
```

- [x] **Step 2: GroupForm fullscreen for mobile**

Add `asPage` prop to `GroupForm` mirroring ActForm pattern (full height scroll + sticky header 返回/保存).

In `AdminApp` when `mobileAdmin`:

```javascript
openGroupForm: (init) => setView({ section: 'groupForm', init, back: { section: view.section === 'groupDetail' ? 'groupDetail' : 'groups', gid: view.gid } }),
// render:
case 'groupForm': return (
  <GroupForm asPage init={view.init} onClose={() => setView(view.back || { section: 'groups' })}
    onSave={(d) => { actions.saveGroup(d); setView(view.back || { section: 'groups' }); }} />
);
```

PC keeps Modal via `groupForm` state.

- [x] **Step 3: Verify**

新建小组 → 全屏；删除 → 底部确认；列表单列无分页。

---

### Task 5: Categories — list rows + fullscreen editor + ConfirmSheet

**Files:**
- Modify: `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` (`CategoriesSection`)

- [x] **Step 1: Mobile list UI**

Replace table with rows:

```javascript
{list.map((c, i) => {
  const cnt = countFor(c.key);
  return (
    <div key={c.key} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-sm)',
    }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in oklch, ${c.color} 18%, white)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
        <Icon name={c.icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{c.label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{cnt.g} 小组 · {cnt.a} 活动</div>
      </div>
      <button type="button" disabled={i===0} onClick={() => actions.moveCat(c.key, -1)}>...</button>
      <button type="button" disabled={i===list.length-1} onClick={() => actions.moveCat(c.key, 1)}>...</button>
      <button type="button" onClick={() => openEdit(c)}><Icon name="edit" /></button>
      <button type="button" onClick={() => setDeleteTarget(c)}><Icon name="trash" /></button>
    </div>
  );
})}
```

- [x] **Step 2: Fullscreen cat form on mobile**

Either `setView({ section: 'catForm', ... })` or inline fullscreen overlay when `mobileAdmin && form.open`. Prefer view section for consistency with Task 1 tab hiding.

- [x] **Step 3: ConfirmSheet for delete when mobile**

- [x] **Step 4: Verify**

分类：无表格；排序/编辑/删除可用；新建全屏。

---

### Task 6: Detail pages compact polish + final QA

**Files:**
- Modify: `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` (`AdminGroupDetail`, `AdminActDetail`)

- [x] **Step 1: When `mobileAdmin`**

- Reduce horizontal padding 28 → 14
- Back button:「返回」短文案
- Hide or collapse heavy PC tabs if cramped (keep overview + acts minimum on mobile; members/signups/comments/moments can stay but wrap Segmented)

- [x] **Step 2: End-to-end checklist**

1. 员工 → 管理者：顶 Tab 四页  
2. 工作台卡片非表格  
3. 小组 CRUD + ConfirmSheet + 全屏表单  
4. 活动列表卡片 + 详情返回  
5. 分类排序/编辑/删除  
6. Showcase PC `AdminApp`：表格与侧栏仍正常  
7. Hard refresh after cache-bust  

- [x] **Step 3: Mark plan tasks done in this file** (checkboxes)

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Shell tabs / no duplicate titles / hide on push | 1 |
| Dashboard 2×2 / pending / act rows | 2 |
| Activities card list / no table / no pager | 3 |
| Groups column + ConfirmSheet + fullscreen | 4 |
| Categories rows + sort + fullscreen + ConfirmSheet | 5 |
| Detail compact / PC unchanged / QA | 6 |
| No swipe-delete / no signup modules | YAGNI — omitted |
