# Admin Category Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PC 管理后台新增「分类管理」完整 CRUD + 排序；删除后关联项显示「未分类」。

**Architecture:** `AdminApp` 持有可变 `cats` state，变更时同步 `window.CATS`；`getCat(key)` 统一安全读取；新增 `CategoriesSection` 列表+Modal。

**Tech Stack:** React (Babel-standalone) in `site/`；inline styles；共用 `DB` / `CATS`。

**Spec:** `docs/superpowers/specs/2026-08-05-admin-category-management-design.md`

---

## File map

| File | Role |
|------|------|
| `site/assets/a91a7bed-087a-4db6-8705-be046ebfdf13.js` | `getCat`、初始 cats 带 `order` |
| `site/assets/69f18197-47b5-4ec3-ac12-536623853bab.js` | `CatBadge` 用 `getCat` |
| `site/assets/06091f2a-16af-41e1-9ea2-396272d1f95c.js` | 侧栏 NAV |
| `site/assets/191074b9-c2d0-4a88-a79e-0e86db894b8b.js` | `CategoriesSection` + AdminApp state/actions |
| `site/assets/5f3ec28e-1203-4053-854e-db9d64aac7b6.js` | GroupsSection 等安全读分类 |

No automated tests; verify via http://127.0.0.1:8081/ PC 管理端.

---

### Task 1: getCat + CatBadge

**Files:** `a91a7bed-….js`, `69f18197-….js`

- [x] Add `getCat` / `UNCATEGORIZED` / ensure each CATS entry has `order`
- [x] `CatBadge` uses `getCat(cat)` (never null crash)
- [x] Export `window.getCat`

### Task 2: Nav + AdminApp cats state

**Files:** `06091f2a-….js`, `191074b9-….js`

- [x] NAV child `{ k: 'categories', label: '分类管理', icon: 'layers' }` after groups
- [x] `cats` state + syncWindowCats + actions save/del/move
- [x] `store.cats` in context; switch case `categories`

### Task 3: CategoriesSection UI

**Files:** `191074b9-….js`

- [x] Table list + Modal form (label/icon/color/order)
- [x] Delete confirm with N/M counts; clear cat on groups/acts

### Task 4: Safe reads in admin lists

**Files:** `5f3ec28e-….js` (and any admin filter using `CATS[g.cat].label`)

- [x] Replace crashing `CATS[x].label` with `getCat(x).label`

### Task 5: Manual verify

- [x] Code served on 8081; manual UI check in browser
- [ ] Commit only if user asks

---

## Spec coverage

| Spec | Task |
|------|------|
| 侧栏入口 | Task 2 |
| CRUD + 排序字段 | Task 3 |
| 删除→未分类 | Task 1+3 |
| store.cats + getCat | Task 1+2 |
| C 端不崩 | Task 1+4 |
