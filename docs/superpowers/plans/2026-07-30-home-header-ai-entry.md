# Home Header + AI Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder homepage top: left-aligned 我的活动/我的小组, then AI bar + chips as one block with fixed copy that navigates to `aichat`.

**Architecture:** Single change in `HomeTab` JSX. Remove orphaned header title row pattern; render shortcut pills above an AI entry wrapper that contains both the bar and suggestion chips.

**Tech Stack:** React via Babel-standalone in `site/` static prototype; inline styles; `nav.go` from mobile shell.

**Spec:** `docs/superpowers/specs/2026-07-30-home-header-ai-entry-design.md`

---

## File map

| File | Role |
|------|------|
| `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js` | `HomeTab` — only file to modify |
| `docs/superpowers/specs/2026-07-30-home-header-ai-entry-design.md` | Source of truth (read-only during impl) |

No new files. No `AIChat` changes. No automated unit tests in this prototype; verify via local HTTP + browser.

---

### Task 1: Rewrite HomeTab top section

**Files:**
- Modify: `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js` — `HomeTab` return, the block from home header through AI chips (currently ~lines 104–135)

- [ ] **Step 1: Replace header + AI markup**

Delete the current flex-end header that only holds the two pills, and the separate AI padding block. Replace with:

```jsx
      {/* shortcut entries — independent row above AI block */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8, padding: '16px 16px 2px' }}>
        {headerEntries.map(({ key, label, icon }) => (
          <button key={key} type="button" onClick={() => nav.go(key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px',
              borderRadius: 99, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Icon name={icon} size={15} stroke={2.2} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* AI entry whole: bar + chips */}
      <div style={{ padding: '10px 16px 4px' }}>
        <div onClick={() => nav.go('aichat')} style={{ borderRadius: 14, padding: 1.5, background: 'var(--ai-grad)', cursor: 'pointer', boxShadow: '0 6px 18px oklch(0.66 0.21 4 / 0.18)' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 12.5, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8, minHeight: 40 }}>
            <Sparkles size={18} color="var(--ai)" style={{ animation: 'sparkle 2.4s infinite', flexShrink: 0 }} />
            <input
              readOnly
              value="和AI助手聊聊，找到适合你的活动"
              tabIndex={0}
              onFocus={e => e.target.blur()}
              onClick={() => nav.go('aichat')}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 500, lineHeight: 1.3, cursor: 'pointer', minWidth: 0 }}
            />
            <div style={{ padding: '5px 10px', borderRadius: 9, background: 'var(--ai-grad)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
              <Icon name="mic" size={14} stroke={2.4} />问</div>
          </div>
        </div>
        <div className="noscroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 8 }}>
          {['职场成长的活动有什么', '适合新人的小组', '本周还有什么活动'].map(s =>
            <button key={s} type="button" onClick={() => nav.go('aichat')} style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 99,
              background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)',
              display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} color="var(--ai)" />{s}</button>)}
        </div>
      </div>
```

Notes:
- Keep `headerEntries` array as-is above the return.
- Outer AI bar `onClick` already covers「问」; `input` uses `readOnly` + blur-on-focus so keyboard never opens; chip clicks do **not** call `send()`.
- Do not insert anything between the bar and the chips div.

- [ ] **Step 2: Visual verify**

Ensure local server serves `site/` (e.g. `python3 -m http.server 8080` in `site/`). Open http://127.0.0.1:8080/ → 移动员工端 → 首页.

Check:
1. No「兴趣小组」title
2. 「我的活动」「我的小组」left-aligned above AI block
3. AI bar + chips contiguous; no controls between them
4. Click bar /「问」/ chip → AI chat; click pills → my activities / my groups
5. Focusing the fake input does not keep keyboard / caret (blur)

- [ ] **Step 3: Commit only if user asks**

Do not commit unless explicitly requested. If asked:

```bash
git add site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js docs/superpowers/specs/2026-07-30-home-header-ai-entry-design.md docs/superpowers/plans/2026-07-30-home-header-ai-entry.md
git commit -m "$(cat <<'EOF'
fix(home): left-align my entries above AI entry block

Remove empty title gap; keep AI bar and chips as one unit with fixed readonly copy that opens chat.
EOF
)"
```

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Shortcut row left-aligned above AI | Task 1 |
| AI bar + chips one block | Task 1 |
| Fixed readonly copy | Task 1 (`readOnly` input) |
| Click → aichat, no auto-send | Task 1 |
| No AIChat changes / no title restore | Out of scope (verified by not touching other files) |

## Self-review

- No placeholders
- Single file, single task — appropriate for scope
- Commit gated on user request (repo rule)
