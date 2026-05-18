# Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the three-tier surface model + unified state system + accent policy from `docs/superpowers/specs/2026-05-14-theme-system-design.md`, with no JSX changes and no infra changes.

**Architecture:** Add `_tiers.scss` and `_states.scss` to `packages/webapp/src/style/theme/`. Re-map all existing `--color-*-background`, `--color-*-border`, and `--color-*-text` semantic tokens in `_light-tokens.scss` and `_dark-tokens.scss` to point at the new tier/border/text tokens. Refactor `_overrides.scss` Layer B state rules to use `--state-*` tokens. All component SCSS (Sidebar.scss, Dashboard.scss, etc.) keeps its existing `var(--color-*)` references unchanged — only the values behind those names move.

**Tech Stack:** Sass, Blueprint.js v4, CSS custom properties. No new dependencies.

---

## Spec reference

This plan implements `docs/superpowers/specs/2026-05-14-theme-system-design.md`. The spec is the source of truth for what is in/out of scope.

## Deviations from spec

None planned. If the implementation runs into a value/mapping ambiguity (e.g., a token whose tier assignment isn't covered in spec §2), the implementer should choose the closest tier per the rules in spec §2 and note the choice in the commit message.

## Branch

This plan runs on a new branch `theme/tier-system` off `theme/hardcoded-color-migration` (head `d74e77be7`).

## Verification gates

The webapp has no test framework. Verification is:
- `pnpm --filter @bigcapital/webapp theme:check` — parity audit
- `pnpm --filter @bigcapital/webapp run build` — Sass + Vite compile cleanly
- Manual visual check at `http://localhost:4000` after each phase

## File structure

```
packages/webapp/src/style/theme/
├── _palette.scss             (existing)
├── _typography.scss          (existing)
├── _radius.scss              (existing)
├── _tiers.scss               ← NEW (Task 1.1)
├── _states.scss              ← NEW (Task 1.2)
├── _light-tokens.scss        (modified — Phases 2-4)
├── _dark-tokens.scss         (modified — Phases 2-4)
├── _overrides.scss           (modified — Phase 5)
└── theme.scss                (modified — Task 1.3)
```

---

## Phase 0 — Branch setup

### Task 0.1: Create the implementation branch

**Files:** none (branch only)

- [ ] **Step 1: Confirm working tree is clean**

```bash
cd /Users/marwanbukhori/virtus-projects/bigcapital
git status
```
Expected: working tree clean.

- [ ] **Step 2: Confirm parent branch**

```bash
git log --oneline -1
```
Expected: HEAD is `d74e77be7` "fix(theme): override Blueprint's .bp4-dark .bp4-menu inside the sidebar" on `theme/hardcoded-color-migration`.

- [ ] **Step 3: Create branch**

```bash
git checkout -b theme/tier-system
git branch --show-current
```
Expected output: `theme/tier-system`.

---

## Phase 1 — Foundation tokens

### Task 1.1: Create `theme/_tiers.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_tiers.scss`

- [ ] **Step 1: Create the file with the exact content**

```scss
// packages/webapp/src/style/theme/_tiers.scss
// Three-tier surface model. Every semantic --color-*-background, --color-*-border,
// and --color-*-text token maps to one of the tier tokens below.
//
// Tier 0: Brand surface (sidebar) — darkest in both modes
// Tier 1: Working surface (body, topbar, drawer body) — mid
// Tier 2: Elevated surface (cards, popovers, dialogs, toasts) — lightest

:root {
  // Light mode surfaces
  --surface-tier-0: var(--vv-slate-900);   // sidebar (brand-dark always)
  --surface-tier-1: var(--vv-slate-100);   // body / drawer body / topbar
  --surface-tier-2: #FFFFFF;               // cards / popovers / dialogs

  // Light mode borders (per surface tier they sit on)
  --border-on-tier-0: rgba(255, 255, 255, 0.06);
  --border-on-tier-1: var(--vv-slate-200);
  --border-on-tier-2: var(--vv-slate-200);

  // Light mode text
  --text-on-tier-0:        #FFFFFF;
  --text-on-tier-0-muted:  rgba(255, 255, 255, 0.6);
  --text-on-tier-1:        var(--vv-slate-900);
  --text-on-tier-1-muted:  var(--vv-slate-500);
  --text-on-tier-2:        var(--vv-slate-900);
  --text-on-tier-2-muted:  var(--vv-slate-500);
}

body.bp4-dark {
  // Dark mode surfaces
  --surface-tier-0: var(--vv-slate-950);
  --surface-tier-1: var(--vv-slate-900);
  --surface-tier-2: var(--vv-slate-800);

  // Dark mode borders
  --border-on-tier-0: rgba(255, 255, 255, 0.06);
  --border-on-tier-1: rgba(255, 255, 255, 0.06);
  --border-on-tier-2: rgba(255, 255, 255, 0.08);

  // Dark mode text
  --text-on-tier-0:        #FFFFFF;
  --text-on-tier-0-muted:  rgba(255, 255, 255, 0.6);
  --text-on-tier-1:        #F0F0F0;
  --text-on-tier-1-muted:  rgba(255, 255, 255, 0.55);
  --text-on-tier-2:        #F0F0F0;
  --text-on-tier-2-muted:  rgba(255, 255, 255, 0.55);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_tiers.scss
git commit -m "feat(theme): add three-tier surface model tokens"
```

---

### Task 1.2: Create `theme/_states.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_states.scss`

- [ ] **Step 1: Create the file**

```scss
// packages/webapp/src/style/theme/_states.scss
// Unified interactive state tokens. Used by _overrides.scss Layer B for every
// hoverable/focusable/clickable element. Single source of truth so hover looks
// the same on a button as on a table row as on a menu item.

:root {
  // Light mode
  --state-hover-overlay:    rgba(15, 23, 42, 0.04);   // slate-900 at 4%
  --state-active-overlay:   rgba(15, 23, 42, 0.08);
  --state-selected-bg:      rgba(34, 197, 94, 0.10);  // emerald tint
  --state-selected-fg:      var(--vv-emerald-700);
  --state-focus-ring:       rgba(34, 197, 94, 0.30);
  --state-disabled-opacity: 0.5;
}

body.bp4-dark {
  --state-hover-overlay:    rgba(255, 255, 255, 0.06);
  --state-active-overlay:   rgba(255, 255, 255, 0.10);
  --state-selected-bg:      rgba(34, 197, 94, 0.18);
  --state-selected-fg:      var(--vv-emerald-400);
  --state-focus-ring:       rgba(34, 197, 94, 0.30);
  --state-disabled-opacity: 0.4;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_states.scss
git commit -m "feat(theme): add unified interactive state tokens"
```

---

### Task 1.3: Wire new files into `theme.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/theme.scss`

- [ ] **Step 1: Read current content**

```bash
cat packages/webapp/src/style/theme/theme.scss
```
Expected current content:
```scss
// packages/webapp/src/style/theme/theme.scss
@import 'palette';
@import 'typography';
@import 'radius';
@import 'light-tokens';
@import 'dark-tokens';
@import 'overrides';
```

- [ ] **Step 2: Replace with**

```scss
// packages/webapp/src/style/theme/theme.scss
// Order matters: foundational → tiers/states → semantic (light/dark) → overrides.
@import 'palette';
@import 'typography';
@import 'radius';
@import 'tiers';
@import 'states';
@import 'light-tokens';
@import 'dark-tokens';
@import 'overrides';
```

- [ ] **Step 3: Verify Sass compiles**

```bash
cd /Users/marwanbukhori/virtus-projects/bigcapital
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -10
```
Expected: `✓ built in <time>` with no Sass errors. The new tokens exist but nothing yet references them — build should pass identically to before.

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/theme.scss
git commit -m "feat(theme): wire _tiers and _states into theme.scss"
```

---

## Phase 2 — Re-map background tokens to tier tokens

### Token mapping reference (Tier 0/1/2 by component category)

Use this table when editing `_light-tokens.scss` and `_dark-tokens.scss` in Tasks 2.1 and 2.2.

**Tier 0 (sidebar):**
- `--color-sidebar-background`
- `--color-sidebar-overlay-background` is NOT Tier 0 — see Tier 2 (it's the floating flyout)

**Tier 1 (body / topbar / drawer body / preferences):**
- `--color-app-body`
- `--color-splash-screen-background`
- `--color-dashboard-insider-background`
- `--color-dashboard-topbar-background`
- `--color-dashboard-fallback-loading-background`
- `--color-dashboard-datatable-background` (table container, not head row)
- `--color-dashboard-navbar-background`
- `--color-financial-report-background`
- `--color-bank-transactions-details-bar-background`
- `--color-bank-transactions-content-background`
- `--color-sidebar-preferences-background`
- `--color-preferences-topbar-background`
- `--color-preferences-content-background`
- `--color-bank-transaction-matching-aside-header`
- `--color-bank-transaction-matching-aside-footer`
- `--color-aside-background`
- `--color-aside-title-background`
- `--color-drawer-insider-background`
- `--color-drawer-tabs-background`

**Tier 2 (cards / popovers / dialogs / dropdowns / drawer header / elevated):**
- `--color-dashboard-card-background`
- `--color-card-background`
- `--color-bank-account-card-background`
- `--color-bank-transactions-datatable-card-background`
- `--color-datatable-head-background`
- `--color-sidebar-overlay-background` (the flyout popover — floating)
- `--color-universal-search-background`
- `--color-element-customize-header-background`
- `--color-element-customize-background`
- `--color-element-customize-header-tabs-background`
- `--color-drawer-header-background`
- `--color-content-tab-background`
- `--color-form-floating-footer-background`

**Inherits / transparent (leave as `transparent` or the existing translucent overlay):**
- `--color-alert-default-background` (transparent)
- `--color-alert-danger-background` (transparent in dark, light tint in light)
- `--color-alert-primary-background` (transparent in dark, light tint in light)
- `--color-sidebar-preferences-item-background` (transparent)
- `--color-sidebar-menu-item-hover-background` — this is a state overlay, becomes `var(--state-hover-overlay)` in Phase 5
- `--color-sidebar-menu-item-active-background` — selected state, becomes `var(--state-selected-bg)` in Phase 5
- `--color-sidebar-menu-item-focus-background` — focus state, removed in Phase 5
- `--color-dashboard-navbar-item-hover-background` — state, Phase 5
- `--color-dashboard-navbar-item-active-background` — state, Phase 5
- `--color-datatable-cell-hover-background` — state, Phase 5
- `--color-ui-menu-select-item-hover-background` — state, Phase 5
- `--color-bank-account-card-tag-background` — pill bg, keep current value
- `--color-element-customize-preview-background` — keep current value (preview content area)
- `--color-form-input-disabled-background` — keep current value
- `--color-datatable-editable-background` — keep
- `--color-datatable-editable-clear-btn-background` — keep
- `--color-datatable-editable-clear-btn-hover-background` — keep

**Special / brand:**
- `--color-sidebar-org-logo-background` — keep `var(--vv-emerald-500)` (brand mark, not a surface tier)
- `--color-dashboard-user-avatar-background` — keep `var(--vv-emerald-500)` / `var(--vv-emerald-700)`
- `--color-ui-menu-select-item-active-background` — keep `var(--color-primary)` (selected emerald)
- `--color-stepper-step-active-background` — keep emerald accent
- `--color-stepper-step-background` — keep current (a state)
- `--color-dashboard-filter-active-background` — keep emerald tint
- `--color-dashboard-navbar-blue-highlight` — keep emerald tint
- `--color-ui-input-background` — inherit from tier; `transparent`
- `--color-ui-html-select-background` — inherit; `transparent`
- `--color-ui-input-group-prepend-background` — keep current (subtle differentiation from input field)
- `--color-select-button-background` — inherit; `transparent`

---

### Task 2.1: Re-map background tokens in `_light-tokens.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_light-tokens.scss`

- [ ] **Step 1: Open the file**

Use the Read tool on `packages/webapp/src/style/theme/_light-tokens.scss` to see current state.

- [ ] **Step 2: For each `--color-*-background` token, look up its category in the mapping reference above and replace its value**

Examples (apply this pattern to every token; the full set is listed under the categories above):

```scss
// Before
--color-app-body: #fff;
--color-dashboard-card-background: #fff;
--color-sidebar-background: var(--vv-slate-900);

// After
--color-app-body: var(--surface-tier-1);
--color-dashboard-card-background: var(--surface-tier-2);
--color-sidebar-background: var(--surface-tier-0);
```

Apply the same pattern for every background token in the file, following the Tier 0/1/2 lists. Tokens marked "Inherits / transparent" or "Special / brand" keep their current values.

**The full set of edits in `_light-tokens.scss`:**

| Token | New value |
|---|---|
| `--color-app-body` | `var(--surface-tier-1)` |
| `--color-splash-screen-background` | `var(--surface-tier-1)` |
| `--color-dashboard-insider-background` | `var(--surface-tier-1)` |
| `--color-dashboard-topbar-background` | `var(--surface-tier-1)` |
| `--color-dashboard-fallback-loading-background` | `var(--surface-tier-1)` |
| `--color-dashboard-datatable-background` | `var(--surface-tier-1)` |
| `--color-dashboard-navbar-background` | `transparent` (sits on tier-1) |
| `--color-financial-report-background` | `var(--surface-tier-1)` |
| `--color-bank-transactions-details-bar-background` | `var(--surface-tier-1)` |
| `--color-bank-transactions-content-background` | `var(--surface-tier-1)` |
| `--color-sidebar-preferences-background` | `var(--surface-tier-1)` |
| `--color-preferences-topbar-background` | `var(--surface-tier-1)` |
| `--color-preferences-content-background` | `var(--surface-tier-1)` |
| `--color-bank-transaction-matching-aside-header` | `var(--surface-tier-1)` |
| `--color-bank-transaction-matching-aside-footer` | `var(--surface-tier-1)` |
| `--color-aside-background` | `var(--surface-tier-1)` |
| `--color-aside-title-background` | `var(--surface-tier-1)` |
| `--color-drawer-insider-background` | `var(--surface-tier-1)` |
| `--color-drawer-tabs-background` | `var(--surface-tier-1)` |
| `--color-sidebar-background` | `var(--surface-tier-0)` |
| `--color-dashboard-card-background` | `var(--surface-tier-2)` |
| `--color-card-background` | `var(--surface-tier-2)` |
| `--color-bank-account-card-background` | `var(--surface-tier-2)` |
| `--color-bank-transactions-datatable-card-background` | `var(--surface-tier-2)` |
| `--color-datatable-head-background` | `var(--surface-tier-2)` |
| `--color-sidebar-overlay-background` | `var(--surface-tier-2)` |
| `--color-universal-search-background` | `var(--surface-tier-2)` |
| `--color-element-customize-header-background` | `var(--surface-tier-2)` |
| `--color-element-customize-background` | `var(--surface-tier-2)` |
| `--color-element-customize-header-tabs-background` | `var(--surface-tier-2)` |
| `--color-drawer-header-background` | `var(--surface-tier-2)` |
| `--color-content-tab-background` | `var(--surface-tier-2)` |
| `--color-form-floating-footer-background` | `var(--surface-tier-2)` |
| `--color-ui-input-background` | `transparent` (inherit from tier) |
| `--color-ui-html-select-background` | `transparent` |
| `--color-select-button-background` | `transparent` |
| `--color-sidebar-preferences-item-background` | `transparent` |

All other `--color-*-background` tokens not listed above keep their existing values (they're state overlays, brand accents, or hardcoded surfaces handled elsewhere).

- [ ] **Step 3: Run parity check + build**

```bash
cd /Users/marwanbukhori/virtus-projects/bigcapital
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -10
```
Expected: parity check ✅; build ✓ in ~25s with no Sass errors.

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_light-tokens.scss
git commit -m "refactor(theme): re-map light-mode background tokens to surface tiers"
```

---

### Task 2.2: Re-map background tokens in `_dark-tokens.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_dark-tokens.scss`

- [ ] **Step 1: Apply the same token-to-tier mapping as Task 2.1, to the dark token file**

The token NAMES are the same; only the values change. Use this table:

| Token | New value |
|---|---|
| `--color-app-body` | `var(--surface-tier-1)` |
| `--color-splash-screen-background` | `var(--surface-tier-1)` |
| `--color-dashboard-insider-background` | `var(--surface-tier-1)` |
| `--color-dashboard-topbar-background` | `var(--surface-tier-1)` |
| `--color-dashboard-fallback-loading-background` | `var(--surface-tier-1)` |
| `--color-dashboard-datatable-background` | `var(--surface-tier-1)` |
| `--color-dashboard-navbar-background` | `transparent` |
| `--color-financial-report-background` | `var(--surface-tier-1)` |
| `--color-bank-transactions-details-bar-background` | `var(--surface-tier-1)` |
| `--color-bank-transactions-content-background` | `var(--surface-tier-1)` |
| `--color-sidebar-preferences-background` | `var(--surface-tier-1)` |
| `--color-preferences-topbar-background` | `var(--surface-tier-1)` |
| `--color-preferences-content-background` | `var(--surface-tier-1)` |
| `--color-bank-transaction-matching-aside-header` | `var(--surface-tier-1)` |
| `--color-bank-transaction-matching-aside-footer` | `var(--surface-tier-1)` |
| `--color-aside-background` | `var(--surface-tier-1)` |
| `--color-aside-title-background` | `var(--surface-tier-1)` |
| `--color-drawer-insider-background` | `var(--surface-tier-1)` |
| `--color-drawer-tabs-background` | `var(--surface-tier-1)` |
| `--color-sidebar-background` | `var(--surface-tier-0)` |
| `--color-dashboard-card-background` | `var(--surface-tier-2)` |
| `--color-card-background` | `var(--surface-tier-2)` |
| `--color-bank-account-card-background` | `var(--surface-tier-2)` |
| `--color-bank-transactions-datatable-card-background` | `var(--surface-tier-2)` |
| `--color-datatable-head-background` | `var(--surface-tier-2)` |
| `--color-sidebar-overlay-background` | `var(--surface-tier-2)` |
| `--color-universal-search-background` | `var(--surface-tier-2)` |
| `--color-element-customize-header-background` | `var(--surface-tier-2)` |
| `--color-element-customize-background` | `var(--surface-tier-2)` |
| `--color-element-customize-header-tabs-background` | `var(--surface-tier-2)` |
| `--color-drawer-header-background` | `var(--surface-tier-2)` |
| `--color-content-tab-background` | `var(--surface-tier-2)` |
| `--color-form-floating-footer-background` | `var(--surface-tier-2)` |
| `--color-ui-input-background` | `transparent` |
| `--color-ui-html-select-background` | `transparent` |
| `--color-select-button-background` | `transparent` |
| `--color-sidebar-preferences-item-background` | `transparent` |

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_dark-tokens.scss
git commit -m "refactor(theme): re-map dark-mode background tokens to surface tiers"
```

---

### Task 2.3: Visual smoke check after Phase 2

- [ ] **Step 1: Start dev server (if not already running)**

```bash
cd /Users/marwanbukhori/virtus-projects/bigcapital
pnpm --filter @bigcapital/webapp run dev
```

- [ ] **Step 2: Open `http://localhost:4000` and verify in BOTH modes**

Toggle `localStorage.theme` between `'dark'` and `'light'` in the browser console and reload between checks.

Expected after Phase 2:
- Sidebar in dark is now clearly DARKER (slate-950) than the body (slate-900) — the previous "indistinguishable" issue is resolved
- Cards in dark are now SOLID slate-800 (not translucent) — clearly elevated above the body
- DataTable head in dark is slate-800
- Light mode: body is slightly off-white (slate-100), cards are pure white — subtle but visible elevation
- No console errors

If any surface looks visibly wrong, the most likely cause is a missed token in the mapping table. Find the token and fix its value to the correct tier.

- [ ] **Step 3: No code commit unless fixes needed**

If you patched a missed token:
```bash
git add packages/webapp/src/style/theme/
git commit -m "fix(theme): patch missing tier mapping caught in smoke check"
```

---

## Phase 3 — Re-map border tokens

### Token mapping reference (borders)

Borders go on top of a surface. Pick the border token by which **tier the bordered element sits on**:

**Border on Tier 0 (inside the sidebar):**
- `--color-sidebar-toggle` (the dropdown caret line — keep)
- `--color-sidebar-scrollbars-background` (keep, it's an overlay)

**Border on Tier 1 (between body sections / on body surfaces):**
- `--color-dashboard-topbar-border-color` → `var(--border-on-tier-1)`
- `--color-dashboard-actionsbar-border` → `var(--border-on-tier-1)`
- `--color-dashboard-actionsbar-divider` → `var(--border-on-tier-1)`
- `--color-aside-divider` → `var(--border-on-tier-1)`
- `--color-app-shell-divider` → `var(--border-on-tier-1)`
- `--color-preferences-sidebar-head-border` → `var(--border-on-tier-1)`
- `--color-preferences-topbar-border` → `var(--border-on-tier-1)`
- `--color-sidebar-preferences-border` → `var(--border-on-tier-1)`
- `--color-bank-transactions-details-bar-divider` → `var(--border-on-tier-1)`
- `--color-bank-transactions-content-border` → `var(--border-on-tier-1)`
- `--color-bank-transaction-matching-divider` → `var(--border-on-tier-1)`

**Border on Tier 2 (around cards, popovers, drawer headers):**
- `--color-card-border` → `var(--border-on-tier-2)`
- `--color-dashboard-card-border` → `var(--border-on-tier-2)`
- `--color-bank-account-card-border` → `var(--border-on-tier-2)`
- `--color-bank-transactions-datatable-card-border` → `var(--border-on-tier-2)`
- `--color-datatable-head-border` → `var(--border-on-tier-2)`
- `--color-datatable-cell-border` → `var(--border-on-tier-2)`
- `--color-universal-search-menu-border` → `var(--border-on-tier-2)`
- `--color-universal-search-footer-divider` → `var(--border-on-tier-2)`
- `--color-financial-sheet-card-border` → `var(--border-on-tier-2)`
- `--color-report-item-border` → `var(--border-on-tier-2)`
- `--color-report-item-top-border` → `var(--border-on-tier-2)`
- `--color-element-customize-divider` → `var(--border-on-tier-2)`
- `--color-drawer-header-border` → `var(--border-on-tier-2)`
- `--color-content-tab-border` → `var(--border-on-tier-2)`
- `--color-form-floating-footer-border` → `var(--border-on-tier-2)`

**Special / accent (leave as-is):**
- `--color-content-tab-hover-border` (emerald — state)
- `--color-content-tab-active-border` (emerald — state)
- `--color-bank-account-card-hover-border` (emerald — state)
- `--color-drawer-border-left` (emerald — brand accent rule)
- `--color-transaction-locking-item-border` / `-icon-border` / `-enabled-border` (keep)
- `--color-form-checkbox-border` (keep)
- `--color-ui-input-border` (focus state, refactored in Phase 5)
- `--color-ui-input-group-prepend-border` (keep)
- `--color-ui-html-select-border` (keep)
- `--color-datatable-cell-focus-border` (emerald — state, Phase 5)
- `--color-datatable-checkbox-border` (keep)
- `--color-datatable-constrant-cell-border` / `-head-border` (keep — contrast border for print)
- `--color-skeleton-border-start` / `-end` (keep — skeleton gradient)

### Task 3.1: Re-map border tokens in `_light-tokens.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_light-tokens.scss`

- [ ] **Step 1: For each border token in the Tier 1 and Tier 2 lists above, change the value to the matching `--border-on-tier-N` token**

Example:
```scss
// Before
--color-card-border: var(--vv-slate-200);

// After
--color-card-border: var(--border-on-tier-2);
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_light-tokens.scss
git commit -m "refactor(theme): re-map light-mode border tokens to tier-aware borders"
```

---

### Task 3.2: Re-map border tokens in `_dark-tokens.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_dark-tokens.scss`

- [ ] **Step 1: Apply the same border-token-to-tier mapping as Task 3.1 to the dark token file** — token names are identical.

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_dark-tokens.scss
git commit -m "refactor(theme): re-map dark-mode border tokens to tier-aware borders"
```

---

## Phase 4 — Re-map text tokens

### Token mapping reference (text)

**Text on Tier 0 (sidebar text):**
- `--color-sidebar-text` → `var(--text-on-tier-0)`
- `--color-sidebar-menu-item-text` → `var(--text-on-tier-0)`
- `--color-sidebar-menu-item-text-hover` → `var(--text-on-tier-0)`
- `--color-sidebar-menu-label-color` → `var(--text-on-tier-0-muted)`
- `--color-sidebar-menu-divider-text` → `var(--text-on-tier-0-muted)`
- `--color-sidebar-menu-item-icon` → `var(--text-on-tier-0-muted)`

**Text on Tier 1 (body, drawer body, topbar text):**
- `--color-dashboard-navbar-item-text` → `var(--text-on-tier-1)`
- `--color-dashboard-navbar-item-hover-text` → `var(--text-on-tier-1)`
- `--color-dashboard-navbar-item-active-text` → `var(--text-on-tier-1)`
- `--color-dashboard-topbar-title-text` → `var(--text-on-tier-1)`
- `--color-dashboard-error-boundary-title-text` → `var(--text-on-tier-1)`
- `--color-dashboard-error-boundary-description-text` → `var(--text-on-tier-1-muted)`
- `--color-datatable-text` → `var(--text-on-tier-1)`
- `--color-datatable-head-text` → `var(--text-on-tier-2-muted)` (head is Tier 2)
- `--color-datatable-no-results-text` → `var(--text-on-tier-1-muted)`
- `--color-datatable-empty-status-title` → `var(--text-on-tier-1)`
- `--color-datatable-empty-status-description` → `var(--text-on-tier-1-muted)`
- `--color-preferences-topbar-title` → `var(--text-on-tier-1)`
- `--color-preferences-sidebar-head-text` → `var(--text-on-tier-1)`
- `--color-sidebar-preferences-item-text` → `var(--text-on-tier-1)`
- `--color-sidebar-preferences-item-hover-text` → `var(--text-on-tier-1)`
- `--color-bank-transactions-details-bar-text` → `var(--text-on-tier-1)`
- `--color-financial-sheet-title-text` → `var(--text-on-tier-1)`
- `--color-financial-sheet-type-text` → `var(--text-on-tier-1)`
- `--color-financial-sheet-date-text` → `var(--text-on-tier-1)`
- `--color-financial-sheet-minimal-title-text` → `var(--text-on-tier-1)`
- `--color-financial-sheet-footer-text` → `var(--text-on-tier-1-muted)`
- `--color-financial-report-drawer-tab-text` → `var(--text-on-tier-1-muted)`
- `--color-report-section-title-text` → `var(--text-on-tier-1)`
- `--color-report-item-text` → `var(--text-on-tier-1)`
- `--color-aside-title-background` is a bg, not a text token — already handled
- `--color-bank-account-card-text` → `var(--text-on-tier-2)` (cards are Tier 2)
- `--color-bank-account-code-text` → `var(--text-on-tier-2-muted)`

**Text on Tier 2 (cards, popovers, dialogs, drawers — text inside elevated surfaces):**
- `--color-drawer-header-text` → `var(--text-on-tier-2)`
- `--color-universal-search-icon` → `var(--text-on-tier-2-muted)`
- `--color-element-customize-header-title-text` → `var(--text-on-tier-2)`
- `--color-element-customize-header-tabs-text` → `var(--text-on-tier-2-muted)`
- `--color-content-tab-text` → `var(--text-on-tier-2-muted)`
- `--color-content-tab-active-text` → `var(--text-on-tier-2)`

**Special (keep — accent / functional / brand colors):**
- `--color-primary` (emerald — brand)
- `--color-muted-text` (kept as a top-level alias to slate-500 / 55%-white)
- `--color-danger` / red / orange / green scale tokens (functional)
- `--color-sidebar-menu-item-active-text` (emerald-tinted — selected state)
- `--color-stepper-step-text` (white on accent)
- `--color-universal-search-tag-text` (white on tag)
- Alert title / description text (kept as functional colors — danger title is red, primary title is emerald)
- `--color-bank-transaction-matching-aside-header` (already a bg)
- All `--color-dashboard-navbar-*-text` accent variants (emerald, danger, warning — already set as functional)
- All `--color-stepper-step-*-text` variants (accent-driven)

### Task 4.1: Re-map text tokens in `_light-tokens.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_light-tokens.scss`

- [ ] **Step 1: For each text token listed above, change its value to the matching `--text-on-tier-N` or `-muted` variant**

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_light-tokens.scss
git commit -m "refactor(theme): re-map light-mode text tokens to tier-aware text"
```

---

### Task 4.2: Re-map text tokens in `_dark-tokens.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_dark-tokens.scss`

- [ ] **Step 1: Apply the same text token mapping as Task 4.1 to the dark file** — names are identical.

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_dark-tokens.scss
git commit -m "refactor(theme): re-map dark-mode text tokens to tier-aware text"
```

---

### Task 4.3: Visual smoke check after Phase 4

- [ ] **Step 1: Open `http://localhost:4000` and walk through:** Homepage, Accounts Chart, Preferences/General, a drawer (open from any list page), the universal search popover. In both light and dark mode.

Expected: All text remains readable (no white-on-white, no black-on-black). Sidebar text stays white. Body text stays slate-900 (light) / off-white (dark). Card text matches body text. Muted labels appropriately dimmed.

- [ ] **Step 2: If any text is unreadable, find the token, fix the mapping, commit**

```bash
git add packages/webapp/src/style/theme/
git commit -m "fix(theme): patch text token mapping for <surface>"
```

---

## Phase 5 — State refactor in `_overrides.scss`

### Task 5.1: Refactor Button hover/active to state tokens

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Find the Button override block (search for `.bp4-button.bp4-intent-primary`)**

Current content:
```scss
.bp4-button.bp4-intent-primary {
  background-color: var(--color-primary);
  background-image: none;
  color: #fff;
  border-radius: var(--radius-md);
  transition: background-color 120ms ease, box-shadow 120ms ease;

  &:hover:not(:disabled) {
    background-color: var(--vv-emerald-700);
  }

  &:active:not(:disabled),
  &.bp4-active {
    background-color: var(--vv-emerald-800);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-app-body), 0 0 0 4px var(--vv-emerald-300);
  }
}
```

- [ ] **Step 2: Replace with**

```scss
// Button — primary intent (emerald) + unified states
.bp4-button.bp4-intent-primary {
  background-color: var(--color-primary);
  background-image: none;
  color: #fff;
  border-radius: var(--radius-md);
  transition: background-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease;

  &:hover:not(:disabled) {
    background-color: var(--vv-emerald-700);  // darker emerald
  }

  &:active:not(:disabled),
  &.bp4-active {
    background-color: var(--vv-emerald-800);  // darker still
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px var(--surface-tier-1),
      0 0 0 3px var(--state-focus-ring);
  }

  &:disabled {
    opacity: var(--state-disabled-opacity);
    cursor: not-allowed;
  }
}

// Button — default (non-intent) — hover/active overlay only
.bp4-button:not([class*="bp4-intent-"]):not(.bp4-minimal):not(.bp4-disabled) {
  transition: background-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease;

  &:hover {
    background-color: var(--state-hover-overlay);
  }

  &:active,
  &.bp4-active {
    background-color: var(--state-active-overlay);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px var(--surface-tier-1),
      0 0 0 3px var(--state-focus-ring);
  }
}
```

- [ ] **Step 3: Build + visual check**

```bash
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

Open the app. Verify: primary button hover darkens. Default button hover shows neutral overlay. Tab through a few buttons → emerald focus ring should appear ON KEYBOARD FOCUS ONLY (clicking a button should NOT show the ring).

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "refactor(theme): Button hover/active/focus use --state-* tokens"
```

---

### Task 5.2: Refactor Input focus to state tokens

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Find the Input override block (`.bp4-input`)**

Current content:
```scss
.bp4-input {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-ui-input-border);
  transition: box-shadow 120ms ease;

  &:focus,
  &.bp4-active {
    box-shadow: 0 0 0 1px var(--vv-emerald-500), 0 0 0 3px rgba(34, 197, 94, 0.18);
    outline: none;
  }
}

.bp4-input[type='number'] {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: Replace with**

```scss
// Input — focus ring + tabular numerals on numeric inputs
.bp4-input {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-ui-input-border);
  transition: box-shadow 120ms ease, opacity 120ms ease;

  &:focus-visible,
  &.bp4-active {
    box-shadow:
      0 0 0 1px var(--vv-emerald-500),
      0 0 0 3px var(--state-focus-ring);
    outline: none;
  }

  &:disabled {
    opacity: var(--state-disabled-opacity);
    cursor: not-allowed;
  }
}

.bp4-input[type='number'] {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "refactor(theme): Input focus uses --state-focus-ring + :focus-visible"
```

---

### Task 5.3: Refactor DataTable hover to state tokens

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Find the DataTable block**

Current content (the row hover line is what we change):
```scss
tbody tr:hover,
.table-tbody .tr:hover {
  background-color: var(--color-datatable-cell-hover-background);
}
```

- [ ] **Step 2: Replace the hover rule with**

```scss
tbody tr:hover,
.table-tbody .tr:hover {
  background-color: var(--state-hover-overlay);
}
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "refactor(theme): DataTable row hover uses --state-hover-overlay"
```

---

### Task 5.4: Refactor Sidebar active item to state-selected tokens

**Files:**
- Modify: `packages/webapp/src/style/theme/_dark-tokens.scss`
- Modify: `packages/webapp/src/style/theme/_light-tokens.scss`

- [ ] **Step 1: Re-point the sidebar active background and text tokens to the state-selected tokens**

In both `_light-tokens.scss` AND `_dark-tokens.scss`, change:

```scss
// Before (current values)
--color-sidebar-menu-item-active-background: rgba(34, 197, 94, 0.18);  // (or 0.12 in light)
--color-sidebar-menu-item-active-text:       var(--vv-emerald-400);    // (or -700 in light)

// After
--color-sidebar-menu-item-active-background: var(--state-selected-bg);
--color-sidebar-menu-item-active-text:       var(--state-selected-fg);
```

Repeat for any analogous "active item" tokens (e.g., `--color-dashboard-navbar-item-active-background` if it's used as a selection state, not a hover state — check by reading the file).

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp theme:check 2>&1 | tail -3
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Visual check**

Navigate the sidebar. Confirm the active item still renders as the emerald pill in both modes.

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_light-tokens.scss packages/webapp/src/style/theme/_dark-tokens.scss
git commit -m "refactor(theme): sidebar active state uses --state-selected-* tokens"
```

---

### Task 5.5: Add Drawer header / Toast / Tooltip overrides (Tier 2)

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append to `_overrides.scss` Layer B**

```scss
// Drawer header — slightly elevated above the drawer body (Tier 2)
.bp4-drawer .bp4-drawer-header {
  background-color: var(--surface-tier-2);
  border-bottom: 1px solid var(--border-on-tier-2);
}

// Toast — Tier 2 surface, replaces Blueprint's default #2f343c
.bp4-dark .bp4-toast,
.bp4-toast {
  background-color: var(--surface-tier-2);
  color: var(--text-on-tier-2);
  border: 1px solid var(--border-on-tier-2);
}

// Tooltip — Tier 2 surface in both modes
.bp4-tooltip .bp4-popover2-content,
.bp4-tooltip .bp4-popover-content {
  background-color: var(--surface-tier-2);
  color: var(--text-on-tier-2);
  border: 1px solid var(--border-on-tier-2);
}

// Dialog body — explicitly Tier 2 (Blueprint mostly defaults here, but we anchor it)
.bp4-dialog {
  background-color: var(--surface-tier-2);
  color: var(--text-on-tier-2);
}
```

- [ ] **Step 2: Verify**

```bash
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 3: Visual check**

Trigger a toast (any form submission success), hover over a tooltip target, open any dialog. All three should render at Tier 2 (slate-800 dark / white light) with consistent borders.

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): Drawer header, Toast, Tooltip, Dialog use Tier 2 surface"
```

---

### Task 5.6: Add card-clickable hover/focus state

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Find the Card override block (`.bp4-card`)**

Current content:
```scss
.bp4-card {
  background-color: var(--color-card-background);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-card-border);
  box-shadow: none;

  &.bp4-elevation-1,
  &.bp4-elevation-2,
  &.bp4-elevation-3 {
    box-shadow: none;
  }
}
```

- [ ] **Step 2: Replace with**

```scss
// Card — Tier 2 surface, no drop shadow, interactive hover when clickable
.bp4-card {
  background-color: var(--color-card-background);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-card-border);
  box-shadow: none;
  transition: border-color 120ms ease, transform 120ms ease;

  &.bp4-elevation-1,
  &.bp4-elevation-2,
  &.bp4-elevation-3 {
    box-shadow: none;
  }

  // Interactive cards (anchors, buttons): hover slightly strengthens the border
  &.bp4-interactive {
    cursor: pointer;

    &:hover {
      border-color: var(--state-hover-overlay);
    }

    &:active {
      transform: scale(0.99);
    }

    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 1px var(--surface-tier-1),
        0 0 0 3px var(--state-focus-ring);
    }
  }
}
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter @bigcapital/webapp run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): interactive card hover/focus uses --state-* tokens"
```

---

## Phase 6 — Visual QA

### Task 6.1: Full Tier 1 walkthrough

**Files:**
- Modify: `docs/superpowers/plans/theme-system-qa-tier1.md` (create new)

- [ ] **Step 1: Create the file**

```bash
mkdir -p docs/superpowers/plans
```

```markdown
# Theme system — Tier 1 QA checklist

For each screen below, verify at 1100px and 1440px widths, in BOTH light and dark modes:

## Tier verification (do this once per screen)
- [ ] Sidebar (Tier 0) is clearly darker than body (dark) / clearly distinct via dark surface (light)
- [ ] Body (Tier 1) reads as the main working surface
- [ ] Cards / popovers / dialogs (Tier 2) clearly lifted from body
- [ ] All three tiers feel intentional, not random shades

## Per-screen checks
For each screen:
- [ ] No console errors
- [ ] No element renders against same-tier surface (e.g., white card on white body without border)
- [ ] Hover on interactive elements shows neutral overlay
- [ ] Focus rings appear ONLY on keyboard Tab, not on mouse click
- [ ] Primary buttons are emerald; default buttons are transparent + border
- [ ] Disabled controls reduce opacity to ~40-50%

## Screens
- [ ] Dashboard
- [ ] Accounts Chart
- [ ] Invoice list
- [ ] Invoice detail
- [ ] Invoice create form (verify Tier 2 form footer)
- [ ] Reports viewer
- [ ] Bank transactions
- [ ] Items list
- [ ] Sidebar navigation (verify Tier 0 darker, active pill emerald)
- [ ] Login / Setup pages

## Notes / regressions
(Add findings below.)
```

- [ ] **Step 2: Walk through with the running dev server. Tick each box manually.**

```bash
pnpm --filter @bigcapital/webapp run dev
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/theme-system-qa-tier1.md
git commit -m "docs(theme): Tier 1 QA checklist completed for tier system"
```

---

### Task 6.2: Tier 2 walkthrough (drawers / dialogs / popovers focus)

**Files:**
- Modify: `docs/superpowers/plans/theme-system-qa-tier2.md` (create new)

- [ ] **Step 1: Create the file**

```markdown
# Theme system — Tier 2 QA checklist

Same verification template as Tier 1, focused on elevated surfaces.

## Screens / interactions
- [ ] Open Customer detail drawer → drawer body is Tier 1, drawer header is Tier 2 (slightly elevated)
- [ ] Open Vendor detail drawer
- [ ] Open Payment Made drawer
- [ ] Open Bill drawer
- [ ] Open Invoice send mail drawer
- [ ] Open any dialog (e.g., "Are you sure?" delete confirm) → Tier 2 surface
- [ ] Trigger a toast (save a form successfully) → Tier 2 surface, no Blueprint #2f343c leak
- [ ] Hover any tooltip target → Tier 2 surface
- [ ] Open universal search (cmd/ctrl+K) → Tier 2 popover, distinct from body
- [ ] Open sidebar flyout (hover an item with sub-items) → Tier 2 popover
- [ ] Open a Blueprint dropdown / select menu → Tier 2 popover
- [ ] Open the user avatar menu (top right) → Tier 2 popover

## Notes / regressions
```

- [ ] **Step 2: Walk through.**

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/theme-system-qa-tier2.md
git commit -m "docs(theme): Tier 2 QA checklist completed for tier system"
```

---

### Task 6.3: Focus-visible behaviour check

- [ ] **Step 1: Manual check with the running app**

Test 1 (mouse click should NOT show ring):
- Click any primary button with the mouse.
- Expected: button activates, NO emerald ring around it.

Test 2 (keyboard tab SHOULD show ring):
- Press Tab repeatedly. Each focusable element gets an emerald ring as it receives focus.
- Expected: clear emerald halo on the focused element.

Test 3 (focus persists on click → tab):
- Click an input to focus it. Type something. Press Tab.
- Expected: NO ring on the input while clicked-focused. Ring DOES appear on the next element when Tab moves focus.

If any of these fail, the `:focus-visible` rules in `_overrides.scss` are wrong — debug by selector.

- [ ] **Step 2: No commit unless fixes needed.**

If fixes needed:
```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "fix(theme): correct :focus-visible behaviour on <element>"
```

---

## Phase 7 — WCAG AA contrast audit

### Task 7.1: Verify contrast pairs

**Files:**
- Modify: `docs/superpowers/plans/theme-system-qa-tier1.md` (append a contrast section)

- [ ] **Step 1: Use https://webaim.org/resources/contrastchecker/ or axe DevTools**

Test these pairs in both modes:

| Pair | Light expected | Dark expected |
|---|---|---|
| `--text-on-tier-1` on `--surface-tier-1` | slate-900 on slate-100 ≥ 14:1 ✅ | #F0F0F0 on slate-900 ≥ 13:1 ✅ |
| `--text-on-tier-2` on `--surface-tier-2` | slate-900 on white ≥ 17:1 ✅ | #F0F0F0 on slate-800 ≥ 11:1 ✅ |
| `--text-on-tier-0` on `--surface-tier-0` | white on slate-900 ≥ 17:1 ✅ | white on slate-950 ≥ 19:1 ✅ |
| `--text-on-tier-1-muted` on `--surface-tier-1` | slate-500 on slate-100 ≥ 4.6:1 | 55%-white on slate-900 ≥ 7:1 ✅ |
| Primary button (white on emerald-700) | white on `#15803D` ≥ 4.7:1 ✅ | n/a |
| Primary button (slate-900 on emerald-500) | n/a | slate-900 on `#22C55E` ≥ 9:1 ✅ |
| `--state-selected-fg` on `--state-selected-bg` | emerald-700 on 10%-emerald-on-white | emerald-400 on 18%-emerald-on-slate-900 |

- [ ] **Step 2: Append results to `theme-system-qa-tier1.md`**

```markdown
## WCAG AA contrast — verified

| Pair | Light measured | Dark measured |
|---|---|---|
| Body text on body bg | <ratio> ✅ | <ratio> ✅ |
| Card text on card bg | ... | ... |
| Sidebar text on sidebar bg | ... | ... |
| Muted text on body | ... | ... |
| Primary button text on emerald | ... | ... |
| Selected nav fg on selected bg | ... | ... |
```

- [ ] **Step 3: If any pair fails AA, identify the failing token and fix it**

The most likely failure point is `state-selected-fg on state-selected-bg` because emerald-on-emerald-tint can be subtle. If so, darken `--state-selected-fg` in the affected mode.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/theme-system-qa-tier1.md
git commit -m "docs(theme): WCAG AA contrast verified for tier system"
```

---

## Final verification gate

Once Phases 0-7 are complete:

- [ ] `pnpm --filter @bigcapital/webapp theme:check` exits 0
- [ ] `pnpm --filter @bigcapital/webapp run build` succeeds
- [ ] All Tier 1 + Tier 2 checkboxes ticked
- [ ] WCAG AA contrast pairs documented and pass
- [ ] Visual smoke check: sidebar visibly darker than body in dark mode
- [ ] Visual smoke check: cards visibly elevated above body in both modes
- [ ] Focus rings appear only on `:focus-visible` (keyboard nav)
- [ ] No new console errors

If all pass, the tier system is complete. Open a PR from `theme/tier-system` into `theme/hardcoded-color-migration` (or whichever branch the user designates as the integration target).
