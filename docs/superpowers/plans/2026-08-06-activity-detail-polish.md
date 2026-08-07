# Activity Detail Polish v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish C-end `ActivityDetail`: clearer visual hierarchy, info-card grouping, scroll top bar, richer intro images, tighter sessions/bottom bar — without changing enroll/join business rules.

**Architecture:** Keep existing section order and state machines in `ActivityDetail`. Apply targeted JSX/CSS tweaks; add scroll listener via `ScreenScroll`'s passthrough `onScroll`; optional small `MetaRow` icon-column fix in shared cards file.

**Tech Stack:** Static Babel React in `site/assets/*.js`; CSS variables; existing `ScreenScroll` / `Sheet` / `SessionSlotTile` / `FloatBtn`.

**Spec:** `docs/superpowers/specs/2026-08-06-activity-detail-polish-design.md`

**Commits:** Do not commit unless the user explicitly asks.

---

## File map

| File | Role |
|------|------|
| `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js` | `ActivityDetail`, `SessionSlotTile`, `CommentItem`, `FloatBtn` polish |
| `site/assets/56b1d150-9839-448d-a372-67039ef0ea89.js` | `MetaRow` icon column width (shared) |
| `site/index.html` | `.richtext img` radius/spacing; cache-bust `6e9cd9ec` |

---

### Task 1: Shared visual tokens — MetaRow + richtext img

**Files:**
- Modify: `site/assets/56b1d150-9839-448d-a372-67039ef0ea89.js` (`MetaRow` ~34–40)
- Modify: `site/index.html` (`.richtext img` ~3498)

- [ ] **Step 1: MetaRow icon column**

Replace `MetaRow` with fixed icon slot so rows align:

```javascript
function MetaRow({ icon, children, wrap }) {
  return (
    <div style={{ display: 'flex', alignItems: wrap ? 'flex-start' : 'center', gap: 10, fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
      <span style={{ width: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: wrap ? 2 : 0 }}>
        <Icon name={icon} size={15} stroke={2} style={{ color: 'var(--ink-3)' }} />
      </span>
      <span className={wrap ? undefined : 'clamp1'} style={{ flex: 1, minWidth: 0 }}>{children}</span>
    </div>
  );
}
```

- [ ] **Step 2: richtext images**

In `site/index.html` change:

```css
.richtext img { max-width:100%; border-radius:8px; margin:8px 0; display:block; }
```

to:

```css
.richtext img { max-width:100%; width:100%; border-radius:12px; margin:12px 0 0; display:block; }
```

- [ ] **Step 3: Spot-check**

Open any activity detail with HTML desc (or AI-created with images): images full-width, radius 12. Meta rows icons align in info card.

---

### Task 2: Hero + title + info card + sessions IA

**Files:**
- Modify: `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js` (`ActivityDetail` render ~574–685, `FloatBtn` ~22–26)

- [ ] **Step 1: FloatBtn shadow**

```javascript
function FloatBtn({ icon, onClick, style }) {
  return <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(6px)', boxShadow: '0 4px 14px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--ink)', border: 'none', cursor: 'pointer', ...style }}><Icon name={icon} size={20} stroke={2.4} /></button>;
}
```

- [ ] **Step 2: Hero height + gradient**

In `ActivityDetail` hero wrapper:

- `height: 260` → `280`
- Gradient to something like:

```javascript
background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 42%, rgba(0,0,0,0.55) 100%)',
```

- [ ] **Step 3: Title / group row polish**

Keep title `fontSize: 22, fontWeight: 800`. Status pills: `fontSize: 11`, `padding: '2px 8px'`. Group row: `fontSize: 13`, `color: 'var(--ink-3)'`.

- [ ] **Step 4: Info card — upper / lower blocks**

Replace the single meta card body so that:

**Upper** (`gap: 12`, padding `14px 16px`): time, pin, host, series signup mode rows, and **deadline** when `!sessions && !showAsSeries && aIn.deadlineIso && !ended` **OR** when `(sessions || showAsSeries) && !ended && aIn.deadlineIso` (move deadline here from session card header).

**Lower** (only for `!sessions && !showAsSeries`): divider + progress + `AvatarStack` (existing markup), with `paddingTop` / slightly more margin.

Remove the deadline block currently inside the sessions card header (the IIFE with `DeadlineCountdown` next to `slotSectionTitle`).

- [ ] **Step 5: Hide empty intro; tag spacing**

Wrap intro section:

```javascript
{(desc || (tags || []).length > 0) && (
  <div>
    {desc ? (
      <>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>活动简介</div>
        <div className="richtext" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)' }}
          dangerouslySetInnerHTML={{ __html: desc }} />
      </>
    ) : null}
    {(tags || []).length > 0 && (
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: desc ? 14 : 0 }}>
        ...
      </div>
    )}
  </div>
)}
```

- [ ] **Step 6: Sessions strip spacing**

Horizontal list:

```javascript
<div className="noscroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 2px 4px' }}>
```

---

### Task 3: SessionSlotTile touch + CommentItem + bottom bar

**Files:**
- Modify: `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js` (`SessionSlotTile`, `CommentItem`, sticky bottom bar)

- [ ] **Step 1: SessionSlotTile list mode size**

For non-grid tiles, ensure comfortable tap:

```javascript
minWidth: grid ? 0 : (cross ? 188 : 112),
minHeight: grid ? (cross ? 78 : undefined) : 72,
padding: grid ? (cross ? '8px 6px' : '7px 5px') : '12px 14px',
```

Keep grid pick-sheet behavior intact.

- [ ] **Step 2: CommentItem spacing**

```javascript
padding: '15px 0',
```

Empty comments copy — soften color already `ink-3`; optional padding `28px 0`.

- [ ] **Step 3: Bottom bar chrome**

Update sticky bar styles:

```javascript
background: 'rgba(255,255,255,0.92)',
backdropFilter: 'blur(12px)',
borderTop: '1px solid var(--line)',
boxShadow: '0 -6px 20px rgba(0,0,0,0.06)',
padding: '12px 14px calc(12px + env(safe-area-inset-bottom, 0px))',
```

Inner CTA row: `alignItems: 'center'`. Keep enroll / moment / hint logic unchanged.

- [ ] **Step 4: Pick sheet tile gap (optional micro)**

In pick sheet month grids, if `gap` &lt; 10, bump to `10` or `12` where sessions are laid out — only if an existing `gap` is easy to find; do not rewrite pick logic.

---

### Task 4: Scroll top bar

**Files:**
- Modify: `site/assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js` (`ActivityDetail`)

`ScreenScroll` forwards unknown props to the scroll `div` (`...rest`), so `onScroll` works.

- [ ] **Step 1: State + handler**

Near other state in `ActivityDetail`:

```javascript
const [navSolid, setNavSolid] = React.useState(false);
const onDetailScroll = (e) => {
  const y = e.currentTarget.scrollTop;
  setNavSolid(y > 200);
};
```

- [ ] **Step 2: Wire ScreenScroll**

```javascript
<ScreenScroll onScroll={onDetailScroll}>
```

- [ ] **Step 3: Sticky collapsing bar**

Immediately after the hero block (before main padding content), insert:

```javascript
<div style={{
  position: 'sticky', top: 0, zIndex: 30,
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.94)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid var(--line)',
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  opacity: navSolid ? 1 : 0,
  pointerEvents: navSolid ? 'auto' : 'none',
  transition: 'opacity .2s ease',
}}>
  <FloatBtn icon="back" onClick={nav.back} style={{ width: 34, height: 34, boxShadow: 'var(--shadow-sm)' }} />
  <div className="clamp1" style={{ flex: 1, fontSize: 15, fontWeight: 800, minWidth: 0 }}>{title}</div>
</div>
```

Hero `FloatBtn` remains for the top-of-page state. When `navSolid`, user uses sticky bar back.

- [ ] **Step 4: Manual check**

Scroll past ~200px → bar fades in with title; scroll to top → fades out; back works in both modes.

---

### Task 5: Cache-bust + hand matrix

**Files:**
- Modify: `site/index.html` (`6e9cd9ec` script + already-touched CSS)

- [ ] **Step 1: Bump**

Current: `assets/6e9cd9ec-f03e-4bc2-bf82-30dfe5b2ae3c.js?v=20260806q`  
→ e.g. `?v=20260806u`

Also bump `56b1d150` script `?v=` if MetaRow file is cache-busted separately (find its script tag and bump).

- [ ] **Step 2: Verify**

| Case | Expect |
|------|--------|
| Once upcoming | Hero 280, info upper+progress lower, CTA enroll |
| Recurring | Sessions strip gap 12; deadline only in info card; adjust sheet |
| Series independent / all | Signup mode in info upper; 场 copy; enroll OK |
| Desc with images | Full-width radius 12 under body |
| Scroll | Top bar at y&gt;200 |
| Non-member / pending | Hint + CTA unchanged |
| Ended | Collapse; moments/comments; no enroll |
| Comment | Sheet only |

- [ ] **Step 3: Done**

Do not commit unless user asks.

---

## Spec coverage (self-review)

| Spec | Task |
|------|------|
| Hero / FloatBtn / title polish | Task 2 |
| MetaRow align + info upper/lower | Task 1 + 2 |
| Deadline only in info card | Task 2 |
| Sessions gap / tile size | Task 2 + 3 |
| richtext img | Task 1 |
| Hide empty intro | Task 2 |
| Comment spacing | Task 3 |
| Bottom bar chrome | Task 3 |
| Scroll top bar | Task 4 |
| Cache + matrix | Task 5 |
| Business rules untouched | All tasks avoid enroll logic edits |

No TBD placeholders. Names: `navSolid`, `onDetailScroll`.
