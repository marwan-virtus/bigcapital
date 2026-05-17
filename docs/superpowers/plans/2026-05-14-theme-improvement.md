# Theme Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a Verus Virtus-aligned theme refresh to the Bigcapital webapp with first-class light and dark modes driven by `prefers-color-scheme`, while fixing the known token-level bugs in `_variables.scss`.

**Architecture:** Introduce a new `packages/webapp/src/style/theme/` folder containing palette, typography, radius, semantic light/dark token mappings, and a Blueprint override layer. Reduce `_variables.scss` to legacy Sass-only content. Wire `App.scss` (via `_base.scss`) to import the new theme entry. Update the existing `preload-theme.js` to handle the three-state preference model. Augment `DashboardThemeProvider` with a React context exposing the theme state. Add a non-form theme toggle to the Preferences/General page.

**Tech Stack:** Sass, Blueprint.js v4, React 18, styled-components + @xstyled/emotion, Vite. No new dependencies.

---

## Spec reference

This plan implements `docs/superpowers/specs/2026-05-14-theme-improvement-design.md`. The spec is the source of truth for what is in/out of scope.

## Deviations from spec (intentional, minor)

| Spec said | Plan does | Reason |
|---|---|---|
| Create new `index.html` pre-paint script | Modify the existing `packages/webapp/public/preload-theme.js` | Script already exists; modifying preserves the existing `/payment/*` carve-out |
| Use localStorage key `bc-theme-preference` with values `'light' \| 'dark' \| 'system'` | Use existing key `'theme'` with values `'light' \| 'dark' \| (absent = system)` | Aligns with the existing convention already wired in `preload-theme.js`; "absent = system" is cleaner than a sentinel string |
| Toggle row inside General preferences section | Toggle as a sibling section on the same Preferences/General page, **outside** the Formik form | The General form is Formik-bound and persists to the server; theme is a client-only localStorage preference. Co-locating them inside the form would mix concerns |
| TDD steps with unit tests | Manual verification gates (build + dev server) | The webapp has no functional test framework (the `test` npm script points at a non-existent file). Adding one would be infra change, which is out of scope |

---

## File structure (added / modified / deleted)

**Added:**
- `packages/webapp/src/style/theme/_palette.scss`
- `packages/webapp/src/style/theme/_typography.scss`
- `packages/webapp/src/style/theme/_radius.scss`
- `packages/webapp/src/style/theme/_light-tokens.scss`
- `packages/webapp/src/style/theme/_dark-tokens.scss`
- `packages/webapp/src/style/theme/_overrides.scss`
- `packages/webapp/src/style/theme/theme.scss`
- `packages/webapp/public/fonts/FiraSans-{Regular,Medium,SemiBold,Bold}.woff2` (4 files)
- `packages/webapp/public/fonts/FiraCode-{Regular,Medium}.woff2` (2 files)
- `packages/webapp/scripts/theme-parity-check.mjs`
- `packages/webapp/src/components/Dashboard/ThemePreferenceContext.tsx`
- `packages/webapp/src/containers/Preferences/General/ThemeAppearanceSection.tsx`

**Modified:**
- `packages/webapp/src/style/_variables.scss` (reduced — `--color-*` tokens removed; legacy Sass-only content retained)
- `packages/webapp/src/style/_base.scss` (no longer imports `_variables` directly via colors)
- `packages/webapp/src/style/App.scss` (imports `theme/theme.scss`)
- `packages/webapp/index.html` (remove hardcoded `bp4-dark` class)
- `packages/webapp/public/preload-theme.js` (three-state handling, explicit add/remove)
- `packages/webapp/src/components/Dashboard/DashboardThemeProvider.tsx` (compose with ThemePreferenceProvider)
- `packages/webapp/src/containers/Preferences/General/GeneralFormPage.tsx` (render the appearance section)
- `packages/webapp/package.json` (add `"theme:check"` script)

**Unchanged:** All backend code, all other `.tsx` files, build config, CI.

---

## Phase 1 — Foundational tokens

### Task 1.1: Create `theme/_palette.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_palette.scss`

- [ ] **Step 1: Create the file**

```scss
// packages/webapp/src/style/theme/_palette.scss
// Verus Virtus brand palette + functional + chart colours.
// All values from vv-landing-page/docs/brand.md (slate scale aligned with Tailwind defaults).

:root {
  // Emerald — brand accent
  --vv-emerald-50:  #ECFDF5;
  --vv-emerald-100: #D1FAE5;
  --vv-emerald-200: #A7F3D0;
  --vv-emerald-300: #6EE7B7;
  --vv-emerald-400: #34D399;
  --vv-emerald-500: #22C55E;  // brand default (dark surfaces)
  --vv-emerald-600: #16A34A;
  --vv-emerald-700: #15803D;  // light-mode accent (AA on white)
  --vv-emerald-800: #166534;
  --vv-emerald-900: #14532D;

  // Slate — brand neutral
  --vv-slate-50:  #F8FAFC;
  --vv-slate-100: #F1F5F9;
  --vv-slate-200: #E2E8F0;
  --vv-slate-300: #CBD5E1;
  --vv-slate-400: #94A3B8;
  --vv-slate-500: #64748B;
  --vv-slate-600: #475569;
  --vv-slate-700: #334155;
  --vv-slate-800: #1E293B;
  --vv-slate-900: #0F172A;  // brand black
  --vv-slate-950: #020617;

  // Functional
  --vv-color-success: var(--vv-emerald-500);
  --vv-color-danger:  #EF4444;
  --vv-color-warning: #F59E0B;
  --vv-color-info:    #3B82F6;

  // Data viz (ordered per brand.md)
  --vv-chart-1: var(--vv-emerald-500);
  --vv-chart-2: #3B82F6;
  --vv-chart-3: #F59E0B;
  --vv-chart-4: #8B5CF6;
  --vv-chart-5: #EC4899;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_palette.scss
git commit -m "feat(theme): add VV brand palette tokens"
```

---

### Task 1.2: Download Fira Sans + Fira Code woff2 files

**Files:**
- Create: `packages/webapp/public/fonts/FiraSans-Regular.woff2`
- Create: `packages/webapp/public/fonts/FiraSans-Medium.woff2`
- Create: `packages/webapp/public/fonts/FiraSans-SemiBold.woff2`
- Create: `packages/webapp/public/fonts/FiraSans-Bold.woff2`
- Create: `packages/webapp/public/fonts/FiraCode-Regular.woff2`
- Create: `packages/webapp/public/fonts/FiraCode-Medium.woff2`

- [ ] **Step 1: Create the fonts directory**

```bash
mkdir -p packages/webapp/public/fonts
```

- [ ] **Step 2: Download woff2 files from Google Webfonts Helper**

Visit https://gwfh.mranftl.com/fonts/fira-sans?subsets=latin and download the woff2 files for weights 400, 500, 600, 700. Place them in `packages/webapp/public/fonts/` with the names listed under Files above.

Repeat for https://gwfh.mranftl.com/fonts/fira-code?subsets=latin for weights 400 and 500.

Alternative (scripted):
```bash
cd packages/webapp/public/fonts
# Fira Sans Regular 400
curl -L -o FiraSans-Regular.woff2 "https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jLeTY.woff2"
# Fira Sans Medium 500
curl -L -o FiraSans-Medium.woff2 "https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eRhf6Xl7Glw.woff2"
# Fira Sans SemiBold 600
curl -L -o FiraSans-SemiBold.woff2 "https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3vRBf6Xl7Glw.woff2"
# Fira Sans Bold 700
curl -L -o FiraSans-Bold.woff2 "https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3yRxf6Xl7Glw.woff2"
# Fira Code Regular 400
curl -L -o FiraCode-Regular.woff2 "https://fonts.gstatic.com/s/firacode/v22/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sJVD7Ng.woff2"
# Fira Code Medium 500
curl -L -o FiraCode-Medium.woff2 "https://fonts.gstatic.com/s/firacode/v22/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_GtsJVD7Ng.woff2"
```

If Google's CDN URLs change, fall back to manual download from Google Webfonts Helper.

- [ ] **Step 3: Verify all 6 files exist and are non-empty**

```bash
ls -la packages/webapp/public/fonts/
```

Expected: 6 `.woff2` files, each between 20kB and 90kB.

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/public/fonts/
git commit -m "feat(theme): self-host Fira Sans and Fira Code woff2 files"
```

---

### Task 1.3: Create `theme/_typography.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_typography.scss`

- [ ] **Step 1: Create the file**

```scss
// packages/webapp/src/style/theme/_typography.scss
// Fira Sans (UI) + Fira Code (IDs, codes). Self-hosted woff2.

@font-face {
  font-family: 'Fira Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/FiraSans-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Fira Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/FiraSans-Medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Fira Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/FiraSans-SemiBold.woff2') format('woff2');
}

@font-face {
  font-family: 'Fira Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/FiraSans-Bold.woff2') format('woff2');
}

@font-face {
  font-family: 'Fira Code';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/FiraCode-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Fira Code';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/FiraCode-Medium.woff2') format('woff2');
}

:root {
  --font-family-sans: 'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
  --font-family-mono: 'Fira Code', Menlo, 'Courier New', monospace;

  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_typography.scss
git commit -m "feat(theme): declare Fira Sans/Code @font-face and typography tokens"
```

---

### Task 1.4: Create `theme/_radius.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_radius.scss`

- [ ] **Step 1: Create the file**

```scss
// packages/webapp/src/style/theme/_radius.scss
// Radius scale per VV brand.md.

:root {
  --radius-sm: 6px;     // pills, badges
  --radius-md: 8px;     // buttons, inputs (default)
  --radius-lg: 10px;    // base / brand default
  --radius-xl: 14px;    // cards (default)
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_radius.scss
git commit -m "feat(theme): add radius scale tokens"
```

---

### Task 1.5: Create `theme/theme.scss` entry

**Files:**
- Create: `packages/webapp/src/style/theme/theme.scss`

- [ ] **Step 1: Create the file**

```scss
// packages/webapp/src/style/theme/theme.scss
// Top-level theme entry. Order matters: foundational → semantic → overrides.

@import 'palette';
@import 'typography';
@import 'radius';
@import 'light-tokens';
@import 'dark-tokens';
@import 'overrides';
```

(Light-tokens, dark-tokens, and overrides files are created in subsequent tasks. The Sass compiler will fail until all six imports resolve — see Task 2.4 for the wiring step that runs after all files exist.)

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/theme.scss
git commit -m "feat(theme): add theme.scss entry imports"
```

---

## Phase 2 — Semantic tokens (light + dark migration)

### Task 2.1: Create `theme/_light-tokens.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_light-tokens.scss`
- Reference: `packages/webapp/src/style/_variables.scss` (lines 6-314 are the current light tokens — copy their NAMES, re-map their VALUES)

- [ ] **Step 1: Copy every `--color-*` token name from the existing `:root` block in `_variables.scss` and re-map values**

The new file has the same token names but their values reference the new palette. Use this template — pasting from `_variables.scss` line 6 onwards, with each value updated to the VV palette equivalent.

```scss
// packages/webapp/src/style/theme/_light-tokens.scss
// Semantic tokens for LIGHT mode. Names match _variables.scss (legacy) so
// no JSX changes are required. Values map to the VV palette.
//
// Parity rule: every token defined here MUST also exist in _dark-tokens.scss.
// Verified by `pnpm theme:check` (see Task 5.2).

:root {
  // ─── Brand ────────────────────────────────────────────────
  --color-primary: var(--vv-emerald-700);   // emerald-700 for AA on white (was: #8abbff)
  --color-danger:  var(--vv-color-danger);  // was: keyword `red`

  // ─── Brand scales (kept for backward-compat with components that reference them) ───
  --color-green-500: var(--vv-emerald-900);
  --color-green-400: var(--vv-emerald-800);
  --color-green-300: var(--vv-emerald-700);
  --color-green-200: var(--vv-emerald-500);
  --color-green-100: var(--vv-emerald-300);

  --color-red-500: #8e292c;
  --color-red-400: #ac2f33;
  --color-red-300: #cd4246;
  --color-red-200: #e76a6e;
  --color-red-100: #fa999c;

  --color-orange-500: #77450d;
  --color-orange-400: #935610;
  --color-orange-300: #c87619;
  --color-orange-200: #ec9a3c;
  --color-orange-100: #fbb360;

  // Gray scales (kept as-is; not VV-branded surface but referenced in legacy SCSS)
  --color-dark-gray5: #404854;
  --color-dark-gray4: #383e47;
  --color-dark-gray3: #2f343c;
  --color-dark-gray2: #252a31;
  --color-dark-gray1: #1c2127;

  --color-light-gray1: #d3d8de;
  --color-light-gray2: #dce0e5;
  --color-light-gray3: #e5e8eb;
  --color-light-gray4: #edeff2;
  --color-light-gray5: #f6f7f9;

  --color-white: #fff;
  --color-black: #000;

  --color-muted-text: var(--vv-slate-500);

  // ─── UI surface ───────────────────────────────────────────
  // Fix: --color-base-sand-* were referenced but never defined.
  // Re-map to concrete slate values.
  --color-ui-background-primary:   var(--vv-slate-50);
  --color-ui-background-secondary: var(--vv-slate-100);
  --color-ui-background-tertiary:  var(--vv-slate-200);

  // ─── Alerts ───────────────────────────────────────────────
  --color-alert-default-background:        transparent;
  --color-alert-default-description-text:  var(--vv-slate-600);
  --color-alert-default-title-text:        var(--vv-slate-900);

  --color-alert-danger-background:         #FEF2F2;
  --color-alert-danger-border:             #FECACA;
  --color-alert-danger-description-text:   #B91C1C;
  --color-alert-danger-title-text:         #991B1B;

  --color-alert-primary-background:        var(--vv-emerald-50);
  --color-alert-primary-border:            var(--vv-emerald-200);
  --color-alert-primary-title-text:        var(--vv-emerald-800);
  --color-alert-primary-description-text:  var(--vv-emerald-700);

  // ─── Inputs ───────────────────────────────────────────────
  --color-ui-input-border:                  var(--vv-slate-200);
  --color-ui-input-background:              #fff;
  --color-ui-input-group-prepend-background: var(--vv-slate-100);
  --color-ui-input-group-prepend-color:     var(--vv-slate-700);
  --color-ui-input-group-prepend-border:    var(--vv-slate-200);

  --color-ui-html-select-background: #fff;
  --color-ui-html-select-border:     var(--vv-slate-200);

  --color-ui-menu-select-item-hover-background:  var(--vv-slate-100);
  --color-ui-menu-select-item-active-background: var(--color-primary);

  --color-app-body: #fff;

  // ─── Splash ───────────────────────────────────────────────
  --color-splash-screen-background: #fff;

  // ─── Dashboard shell ──────────────────────────────────────
  --color-dashboard-insider-background:           var(--vv-slate-50);
  --color-dashboard-topbar-background:            #fff;
  --color-dashboard-fallback-loading-background:  var(--vv-slate-50);
  --color-dashboard-topbar-border-color:          var(--vv-slate-200);
  --color-dashboard-datatable-background:         #fff;
  --color-dashboard-datatable-border:             var(--vv-slate-200);

  // ─── Dashboard error boundary ─────────────────────────────
  --color-dashboard-error-boundary-title-text:       var(--vv-slate-900);
  --color-dashboard-error-boundary-description-text: var(--vv-slate-700);
  --color-dashboard-error-boundary-logo:             var(--vv-slate-400);

  // ─── Dashboard navbar ─────────────────────────────────────
  --color-dashboard-navbar-background:            transparent;
  --color-dashboard-navbar-item-text:             var(--vv-slate-900);
  --color-dashboard-navbar-item-hover-text:       var(--vv-slate-900);
  --color-dashboard-navbar-item-hover-background: rgba(15, 23, 42, 0.06);
  --color-dashboard-navbar-item-active-text:      var(--vv-slate-900);
  --color-dashboard-navbar-item-active-background: rgba(15, 23, 42, 0.10);
  --color-dashboard-navbar-item-icon:             var(--vv-slate-700);
  --color-dashboard-topbar-title-text:            var(--vv-slate-900);

  // ─── Dashboard actionsbar ─────────────────────────────────
  --color-dashboard-actionsbar-border:  var(--vv-slate-200);
  --color-dashboard-actionsbar-divider: var(--vv-slate-300);

  // ─── DataTable ────────────────────────────────────────────
  --color-datatable-head-background:    var(--vv-slate-100);
  --color-datatable-head-text:          var(--vv-slate-600);
  --color-datatable-head-border:        var(--vv-slate-200);
  --color-datatable-cell-hover-background: var(--vv-slate-50);
  --color-datatable-cell-border:        var(--vv-slate-200);
  --color-datatable-cell-focus-border:  var(--vv-emerald-500);
  --color-datatable-no-results-text:    var(--vv-slate-500);
  --color-datatable-caret:              var(--vv-slate-400);
  --color-datatable-caret-hover:        var(--vv-slate-600);
  --color-datatable-checkbox-border:    var(--vv-slate-300);

  --color-datatable-empty-status-title:       var(--vv-slate-900);
  --color-datatable-empty-status-description: var(--vv-slate-600);

  --color-datatable-text:                    var(--vv-slate-900);
  --color-datatable-constrant-text:          #000;
  --color-datatable-constrant-cell-border:   #000;
  --color-datatable-constrant-head-text:     #000;
  --color-datatable-constrant-head-border:   #000;

  --color-dashboard-card-background: #fff;
  --color-dashboard-card-border:     var(--vv-slate-200);

  // ─── Sidebar ──────────────────────────────────────────────
  // Sidebar stays slate-900 in both modes (brand identity)
  --color-sidebar-toggle:                  rgba(255, 255, 255, 0.6);
  --color-sidebar-background:              var(--vv-slate-900);
  --color-sidebar-text:                    #fff;
  --color-sidebar-scrollbars-background:   rgba(255, 255, 255, 0.25);

  --color-sidebar-menu-item-text:              #fff;
  --color-sidebar-menu-item-hover-background:  rgba(255, 255, 255, 0.06);
  --color-sidebar-menu-item-text-hover:        #fff;
  --color-sidebar-menu-item-active-background: rgba(34, 197, 94, 0.12);
  --color-sidebar-menu-item-active-text:       var(--vv-emerald-400);
  --color-sidebar-menu-item-focus-background:  rgba(255, 255, 255, 0.08);
  --color-sidebar-menu-label-color:            rgba(255, 255, 255, 0.5);

  --color-sidebar-overlay-background:        #fff;
  --color-sidebar-overlay-hover-background:  var(--vv-slate-100);
  --color-sidebar-overlay-item-text:         var(--vv-slate-900);
  --color-sidebar-overlay-item-hover-text:   var(--vv-slate-900);
  --color-sidebar-overlay-divider-background: var(--vv-slate-200);
  --color-sidebar-overlay-label-text:        var(--vv-slate-500);
  --color-sidebar-overlay-label-border:      var(--color-sidebar-overlay-divider-background);
  --color-sidebar-overlay-backdrop:          rgba(15, 23, 42, 0.15);

  --color-financial-report-background: #fff;

  // ─── Card ─────────────────────────────────────────────────
  --color-card-background: #fff;
  --color-card-border:     var(--vv-slate-200);

  // ─── Bank accounts ────────────────────────────────────────
  --color-bank-account-card-background:    #fff;
  --color-bank-account-card-text:          var(--vv-slate-900);
  --color-bank-account-card-border:        var(--vv-slate-200);
  --color-bank-account-card-hover-border:  var(--vv-emerald-500);
  --color-bank-account-card-tag-background: var(--vv-slate-100);
  --color-bank-account-code-text:          var(--vv-slate-900);

  --color-bank-transactions-details-bar-background: #fff;
  --color-bank-transactions-details-bar-text:       var(--vv-slate-700);
  --color-bank-transactions-details-bar-divider:    var(--vv-slate-200);

  --color-bank-transactions-content-background: #fff;
  --color-bank-transactions-content-border:     var(--vv-slate-200);

  --color-bank-transactions-datatable-card-background: #fff;
  --color-bank-transactions-datatable-card-border:     var(--vv-slate-200);

  --color-bank-transaction-matching-aside:        var(--vv-emerald-500);
  --color-bank-transaction-matching-divider:      var(--vv-slate-200);
  --color-bank-transaction-matching-aside-header: #fff;
  --color-bank-transaction-matching-aside-footer: var(--vv-slate-50);

  // ─── Preferences ──────────────────────────────────────────
  --color-sidebar-preferences-background: var(--vv-slate-100);
  --color-sidebar-preferences-border:     var(--vv-slate-200);

  --color-sidebar-preferences-item-background: transparent;
  --color-sidebar-preferences-item-text:       var(--vv-slate-700);

  --color-sidebar-preferences-item-hover-background: rgba(255, 255, 255, 0.6);
  --color-sidebar-preferences-item-hover-text:       var(--vv-slate-900);

  --color-preferences-sidebar-head-border: var(--vv-slate-300);
  --color-preferences-sidebar-head-text:   var(--vv-slate-800);

  --color-preferences-topbar-background: #fff;
  --color-preferences-topbar-border:     var(--vv-slate-200);
  --color-preferences-topbar-title:      var(--vv-slate-900);

  --color-preferences-content-background: var(--vv-slate-50);

  // ─── Financial sheet ──────────────────────────────────────
  --color-financial-sheet-card-border:        var(--vv-slate-200);
  --color-financial-sheet-title-text:         var(--vv-slate-900);
  --color-financial-sheet-type-text:          var(--vv-slate-900);
  --color-financial-sheet-date-text:          var(--vv-slate-900);
  --color-financial-sheet-footer-text:        var(--vv-slate-500);
  --color-financial-sheet-minimal-title-text: var(--vv-slate-900);

  // ─── Transaction locking ──────────────────────────────────
  --color-transaction-locking-item-background:      #fff;
  --color-transaction-locking-item-border:          var(--vv-slate-200);
  --color-transaction-locking-item-icon-border:     var(--vv-slate-200);
  --color-transaction-locking-item-enabled-border:  var(--vv-slate-200);

  // ─── Report items ─────────────────────────────────────────
  --color-report-section-title-text: var(--vv-slate-900);
  --color-report-item-background:    #fff;
  --color-report-item-border:        var(--vv-slate-200);
  --color-report-item-top-border:    var(--vv-slate-200);
  --color-report-item-text:          var(--vv-slate-900);

  --color-financial-report-drawer-tab-text: var(--vv-slate-700);

  // ─── Element customize ────────────────────────────────────
  // Fix: original typo `ekement` renamed to `element`.
  --color-element-customize-header-background:        #fff;
  --color-element-customize-header-title-text:        var(--vv-slate-900);
  --color-element-customize-background:               #fff;
  --color-element-customize-preview-background:       var(--vv-slate-100);
  --color-element-customize-header-tabs-background:   #fff;
  --color-element-customize-header-tabs-text:         var(--vv-slate-600);
  --color-element-customize-divider:                  var(--vv-slate-200);

  // ─── Universal search ─────────────────────────────────────
  --color-universal-search-background:      #fff;
  --color-universal-search-footer-divider:  var(--vv-slate-200);
  --color-universal-search-icon:            var(--vv-slate-500);
  --color-universal-search-tag-background:  var(--vv-slate-600);
  --color-universal-search-tag-text:        #fff;
  --color-universal-search-menu-border:     var(--vv-slate-200);

  // ─── Content tabs ─────────────────────────────────────────
  --color-content-tab-background:       #fff;
  --color-content-tab-border:           var(--vv-slate-200);
  --color-content-tab-hover-border:     var(--vv-emerald-500);
  --color-content-tab-active-border:    var(--vv-emerald-500);
  --color-content-tab-text:             var(--vv-slate-700);
  --color-content-tab-active-text:      var(--vv-emerald-700);

  // ─── Aside ────────────────────────────────────────────────
  --color-aside-background:        #fff;
  --color-aside-title-background:  #fff;
  --color-aside-divider:           var(--vv-slate-200);

  // ─── App shell ────────────────────────────────────────────
  --color-app-shell-divider: var(--vv-slate-200);

  // ─── Select ───────────────────────────────────────────────
  --color-select-button-background: #fff;
  --color-select-button-border:     var(--vv-slate-200);

  // ─── Stepper ──────────────────────────────────────────────
  --color-stepper-step-title-text:           var(--vv-slate-500);
  --color-stepper-step-title-active-text:    var(--color-primary);
  --color-stepper-step-description-text:     var(--vv-slate-500);
  --color-stepper-step-description-active-text: var(--color-primary);
  --color-stepper-step-background:           var(--vv-slate-300);
  --color-stepper-step-active-background:    var(--color-primary);
  --color-stepper-separator:                 var(--vv-slate-300);
  --color-stepper-step-text:                 #fff;

  // ─── Drawer ───────────────────────────────────────────────
  --color-drawer-border-left:        var(--color-primary);
  --color-drawer-header-background:  #fff;
  --color-drawer-header-border:      transparent;
  --color-drawer-header-text:        var(--vv-slate-900);
  --color-drawer-insider-background: var(--vv-slate-50);
  --color-drawer-tabs-background:    #fff;

  // ─── Skeleton ─────────────────────────────────────────────
  --color-skeleton-background-start: rgba(15, 23, 42, 0.06);
  --color-skeleton-background-end:   rgba(15, 23, 42, 0.12);
  --color-skeleton-border-start:     rgba(15, 23, 42, 0.06);
  --color-skeleton-border-end:       rgba(15, 23, 42, 0.12);
  --color-skeleton-border-radius:    var(--radius-sm);  // referenced by Skeleton.scss
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_light-tokens.scss
git commit -m "feat(theme): add VV-mapped light-mode semantic tokens"
```

---

### Task 2.2: Create `theme/_dark-tokens.scss`

**Files:**
- Create: `packages/webapp/src/style/theme/_dark-tokens.scss`
- Reference: `packages/webapp/src/style/_variables.scss` (lines 321-649 are the current dark tokens — fix the existing whites/typos here)

- [ ] **Step 1: Create file with full dark-mode token set, mirroring `_light-tokens.scss`**

```scss
// packages/webapp/src/style/theme/_dark-tokens.scss
// Semantic tokens for DARK mode. Every name MUST also exist in _light-tokens.scss.
// Verified by `pnpm theme:check`.

body.bp4-dark {
  // ─── Brand ────────────────────────────────────────────────
  --color-primary: var(--vv-emerald-500);
  --color-danger:  var(--vv-color-danger);

  // Brand scales
  --color-green-500: var(--vv-emerald-300);
  --color-green-400: var(--vv-emerald-400);
  --color-green-300: var(--vv-emerald-500);
  --color-green-200: var(--vv-emerald-700);
  --color-green-100: var(--vv-emerald-900);

  --color-red-500: #fa999c;
  --color-red-400: #e76a6e;
  --color-red-300: #cd4246;
  --color-red-200: #ac2f33;
  --color-red-100: #8e292c;

  --color-orange-500: #fbb360;
  --color-orange-400: #ec9a3c;
  --color-orange-300: #c87619;
  --color-orange-200: #935610;
  --color-orange-100: #77450d;

  --color-dark-gray5: #404854;
  --color-dark-gray4: #383e47;
  --color-dark-gray3: #2f343c;
  --color-dark-gray2: #252a31;
  --color-dark-gray1: #1c2127;

  --color-light-gray1: #d3d8de;
  --color-light-gray2: #dce0e5;
  --color-light-gray3: #e5e8eb;
  --color-light-gray4: #edeff2;
  --color-light-gray5: #f6f7f9;

  --color-white: #fff;
  --color-black: #000;

  --color-muted-text: rgba(255, 255, 255, 0.55);

  // ─── UI surface (fix: was using undefined --color-base-sand-*) ───
  --color-ui-background-primary:   var(--vv-slate-900);
  --color-ui-background-secondary: var(--vv-slate-800);
  --color-ui-background-tertiary:  var(--vv-slate-700);

  // ─── Alerts ───────────────────────────────────────────────
  --color-alert-default-background:        transparent;
  --color-alert-default-description-text:  rgba(255, 255, 255, 0.7);
  --color-alert-default-title-text:        rgba(255, 255, 255, 0.9);

  --color-alert-danger-background:         transparent;
  --color-alert-danger-border:             rgba(239, 68, 68, 0.3);
  --color-alert-danger-description-text:   #FCA5A5;
  --color-alert-danger-title-text:         #F87171;

  --color-alert-primary-background:        transparent;
  --color-alert-primary-border:            rgba(34, 197, 94, 0.3);
  --color-alert-primary-title-text:        var(--vv-emerald-400);
  --color-alert-primary-description-text:  var(--vv-emerald-300);

  // ─── Inputs (FIX: html-select was #fff in dark mode) ─────
  --color-ui-input-border:     rgba(255, 255, 255, 0.15);
  --color-ui-input-background: rgba(255, 255, 255, 0.04);
  --color-ui-input-group-prepend-background: rgba(255, 255, 255, 0.06);
  --color-ui-input-group-prepend-color:      rgba(255, 255, 255, 0.6);
  --color-ui-input-group-prepend-border:     rgba(255, 255, 255, 0.15);

  --color-ui-html-select-background: rgba(255, 255, 255, 0.04);  // FIX: was #fff
  --color-ui-html-select-border:     rgba(255, 255, 255, 0.15);

  --color-ui-menu-select-item-hover-background:  rgba(143, 153, 168, 0.15);
  --color-ui-menu-select-item-active-background: var(--color-primary);

  --color-app-body: var(--vv-slate-900);

  --color-splash-screen-background: var(--vv-slate-900);

  // ─── Dashboard shell ──────────────────────────────────────
  --color-dashboard-insider-background:           var(--vv-slate-900);
  --color-dashboard-topbar-background:            var(--vv-slate-900);
  --color-dashboard-fallback-loading-background:  var(--vv-slate-900);
  --color-dashboard-topbar-border-color:          rgba(255, 255, 255, 0.06);
  --color-dashboard-datatable-background:         var(--vv-slate-900);
  --color-dashboard-datatable-border:             rgba(255, 255, 255, 0.06);

  --color-dashboard-error-boundary-title-text:       rgba(255, 255, 255, 0.85);
  --color-dashboard-error-boundary-description-text: rgba(255, 255, 255, 0.6);
  --color-dashboard-error-boundary-logo:             rgba(255, 255, 255, 0.45);

  --color-dashboard-navbar-background:            var(--vv-slate-900);
  --color-dashboard-navbar-item-text:             rgba(255, 255, 255, 0.85);
  --color-dashboard-navbar-item-hover-text:       #fff;
  --color-dashboard-navbar-item-hover-background: rgba(255, 255, 255, 0.06);
  --color-dashboard-navbar-item-active-text:      #fff;
  --color-dashboard-navbar-item-active-background: rgba(255, 255, 255, 0.10);
  --color-dashboard-navbar-item-icon:             rgba(255, 255, 255, 0.7);
  --color-dashboard-topbar-title-text:            #fff;

  --color-dashboard-actionsbar-border:  rgba(255, 255, 255, 0.08);
  --color-dashboard-actionsbar-divider: rgba(255, 255, 255, 0.15);

  // ─── DataTable ────────────────────────────────────────────
  --color-datatable-head-background:    rgba(255, 255, 255, 0.04);
  --color-datatable-head-text:          rgba(255, 255, 255, 0.7);
  --color-datatable-head-border:        rgba(255, 255, 255, 0.06);
  --color-datatable-cell-hover-background: rgba(255, 255, 255, 0.03);
  --color-datatable-cell-border:        rgba(255, 255, 255, 0.06);
  --color-datatable-cell-focus-border:  var(--vv-emerald-500);
  --color-datatable-no-results-text:    rgba(255, 255, 255, 0.5);
  --color-datatable-caret:              rgba(255, 255, 255, 0.25);
  --color-datatable-caret-hover:        rgba(255, 255, 255, 0.6);
  --color-datatable-checkbox-border:    rgba(255, 255, 255, 0.3);

  --color-datatable-empty-status-title:       rgba(255, 255, 255, 0.9);
  --color-datatable-empty-status-description: rgba(255, 255, 255, 0.6);

  --color-datatable-text:                  #fff;
  --color-datatable-constrant-text:        rgba(255, 255, 255, 0.85);
  --color-datatable-constrant-cell-border: rgba(255, 255, 255, 0.15);
  --color-datatable-constrant-head-text:   rgba(255, 255, 255, 0.85);
  --color-datatable-constrant-head-border: rgba(255, 255, 255, 0.15);

  --color-dashboard-card-background: rgba(255, 255, 255, 0.04);
  --color-dashboard-card-border:     rgba(255, 255, 255, 0.06);

  // ─── Sidebar (slate-950 in dark for subtle contrast against body slate-900) ───
  --color-sidebar-toggle:                  rgba(255, 255, 255, 0.5);
  --color-sidebar-background:              var(--vv-slate-950);
  --color-sidebar-text:                    #fff;
  --color-sidebar-scrollbars-background:   rgba(255, 255, 255, 0.25);

  --color-sidebar-menu-item-text:              #fff;
  --color-sidebar-menu-item-hover-background:  rgba(255, 255, 255, 0.06);
  --color-sidebar-menu-item-text-hover:        #fff;
  --color-sidebar-menu-item-active-background: rgba(34, 197, 94, 0.18);
  --color-sidebar-menu-item-active-text:       var(--vv-emerald-300);
  --color-sidebar-menu-item-focus-background:  rgba(255, 255, 255, 0.10);
  --color-sidebar-menu-label-color:            rgba(255, 255, 255, 0.4);

  --color-sidebar-overlay-background:        var(--vv-slate-800);
  --color-sidebar-overlay-hover-background:  rgba(255, 255, 255, 0.06);
  --color-sidebar-overlay-item-text:         #fff;
  --color-sidebar-overlay-item-hover-text:   #fff;
  --color-sidebar-overlay-divider-background: rgba(255, 255, 255, 0.10);
  --color-sidebar-overlay-label-text:        rgba(255, 255, 255, 0.5);
  --color-sidebar-overlay-label-border:      var(--color-sidebar-overlay-divider-background);
  --color-sidebar-overlay-backdrop:          rgba(2, 6, 23, 0.5);

  --color-financial-report-background: var(--vv-slate-900);

  // ─── Card ─────────────────────────────────────────────────
  --color-card-background: rgba(255, 255, 255, 0.04);
  --color-card-border:     rgba(255, 255, 255, 0.06);

  // ─── Bank accounts ────────────────────────────────────────
  --color-bank-account-card-background:    rgba(255, 255, 255, 0.04);
  --color-bank-account-card-text:          rgba(255, 255, 255, 0.95);
  --color-bank-account-card-border:        rgba(255, 255, 255, 0.06);
  --color-bank-account-card-hover-border:  var(--vv-emerald-500);
  --color-bank-account-card-tag-background: rgba(255, 255, 255, 0.10);
  --color-bank-account-code-text:          rgba(255, 255, 255, 0.7);

  --color-bank-transactions-details-bar-background: var(--vv-slate-900);
  --color-bank-transactions-details-bar-text:       rgba(255, 255, 255, 0.85);
  --color-bank-transactions-details-bar-divider:    rgba(255, 255, 255, 0.08);

  --color-bank-transactions-content-background: var(--vv-slate-900);
  --color-bank-transactions-content-border:     rgba(255, 255, 255, 0.06);

  --color-bank-transactions-datatable-card-background: rgba(255, 255, 255, 0.03);
  --color-bank-transactions-datatable-card-border:     rgba(255, 255, 255, 0.06);

  --color-bank-transaction-matching-aside:        var(--vv-emerald-500);
  --color-bank-transaction-matching-divider:      rgba(255, 255, 255, 0.08);
  --color-bank-transaction-matching-aside-header: var(--vv-slate-900);
  --color-bank-transaction-matching-aside-footer: var(--vv-slate-900);

  // ─── Preferences ──────────────────────────────────────────
  --color-sidebar-preferences-background: var(--vv-slate-900);
  --color-sidebar-preferences-border:     rgba(255, 255, 255, 0.06);

  --color-sidebar-preferences-item-background: transparent;
  --color-sidebar-preferences-item-text:       rgba(255, 255, 255, 0.85);

  --color-sidebar-preferences-item-hover-background: rgba(255, 255, 255, 0.06);
  --color-sidebar-preferences-item-hover-text:       #fff;

  --color-preferences-sidebar-head-border: rgba(255, 255, 255, 0.10);
  --color-preferences-sidebar-head-text:   rgba(255, 255, 255, 0.85);

  --color-preferences-topbar-background: var(--vv-slate-900);
  --color-preferences-topbar-border:     rgba(255, 255, 255, 0.06);
  --color-preferences-topbar-title:      rgba(255, 255, 255, 0.9);

  --color-preferences-content-background: var(--vv-slate-900);

  // ─── Financial sheet ──────────────────────────────────────
  --color-financial-sheet-card-border:        rgba(255, 255, 255, 0.06);
  --color-financial-sheet-title-text:         rgba(255, 255, 255, 0.9);
  --color-financial-sheet-type-text:          rgba(255, 255, 255, 0.9);
  --color-financial-sheet-date-text:          rgba(255, 255, 255, 0.9);
  --color-financial-sheet-footer-text:        rgba(255, 255, 255, 0.55);
  --color-financial-sheet-minimal-title-text: #fff;

  // ─── Transaction locking ──────────────────────────────────
  --color-transaction-locking-item-background:      rgba(255, 255, 255, 0.04);
  --color-transaction-locking-item-border:          rgba(255, 255, 255, 0.06);
  --color-transaction-locking-item-icon-border:     rgba(255, 255, 255, 0.10);
  --color-transaction-locking-item-enabled-border:  rgba(255, 255, 255, 0.10);

  // ─── Report items ─────────────────────────────────────────
  --color-report-section-title-text: rgba(255, 255, 255, 0.9);
  --color-report-item-background:    rgba(255, 255, 255, 0.04);
  --color-report-item-border:        rgba(255, 255, 255, 0.06);
  --color-report-item-top-border:    rgba(255, 255, 255, 0.06);
  --color-report-item-text:          rgba(255, 255, 255, 0.85);

  --color-financial-report-drawer-tab-text: rgba(255, 255, 255, 0.7);

  // ─── Element customize (typo `ekement` fixed) ─────────────
  --color-element-customize-header-background:        rgba(255, 255, 255, 0.04);
  --color-element-customize-header-title-text:        rgba(255, 255, 255, 0.9);
  --color-element-customize-background:               var(--vv-slate-900);
  --color-element-customize-preview-background:       rgba(255, 255, 255, 0.04);
  --color-element-customize-header-tabs-background:   rgba(255, 255, 255, 0.04);
  --color-element-customize-header-tabs-text:         rgba(255, 255, 255, 0.55);
  --color-element-customize-divider:                  rgba(255, 255, 255, 0.06);

  // ─── Universal search ─────────────────────────────────────
  --color-universal-search-background:      var(--vv-slate-800);
  --color-universal-search-footer-divider:  rgba(255, 255, 255, 0.06);
  --color-universal-search-icon:            rgba(255, 255, 255, 0.5);
  --color-universal-search-tag-background:  rgba(255, 255, 255, 0.10);
  --color-universal-search-tag-text:        #fff;
  --color-universal-search-menu-border:     rgba(255, 255, 255, 0.10);

  // ─── Content tabs ─────────────────────────────────────────
  --color-content-tab-background:       rgba(255, 255, 255, 0.04);
  --color-content-tab-border:           rgba(255, 255, 255, 0.06);
  --color-content-tab-hover-border:     rgba(34, 197, 94, 0.4);
  --color-content-tab-active-border:    var(--vv-emerald-500);
  --color-content-tab-text:             rgba(255, 255, 255, 0.85);
  --color-content-tab-active-text:      #fff;

  // ─── Aside ────────────────────────────────────────────────
  --color-aside-background:        var(--vv-slate-900);
  --color-aside-title-background:  var(--vv-slate-900);
  --color-aside-divider:           rgba(255, 255, 255, 0.06);

  // ─── App shell ────────────────────────────────────────────
  --color-app-shell-divider: rgba(255, 255, 255, 0.06);

  // ─── Select (FIX: was #fff in dark mode) ──────────────────
  --color-select-button-background: rgba(255, 255, 255, 0.04);
  --color-select-button-border:     rgba(255, 255, 255, 0.06);

  // ─── Stepper ──────────────────────────────────────────────
  --color-stepper-step-title-text:           rgba(255, 255, 255, 0.7);
  --color-stepper-step-title-active-text:    var(--color-primary);
  --color-stepper-step-description-text:     rgba(255, 255, 255, 0.6);
  --color-stepper-step-description-active-text: var(--color-primary);
  --color-stepper-step-background:           rgba(255, 255, 255, 0.10);
  --color-stepper-step-active-background:    var(--color-primary);
  --color-stepper-separator:                 rgba(255, 255, 255, 0.10);
  --color-stepper-step-text:                 #fff;

  // ─── Drawer ───────────────────────────────────────────────
  --color-drawer-border-left:        transparent;
  --color-drawer-header-background:  transparent;
  --color-drawer-header-border:      rgba(255, 255, 255, 0.10);
  --color-drawer-header-text:        #fff;
  --color-drawer-insider-background: var(--vv-slate-900);
  --color-drawer-tabs-background:    transparent;

  // ─── Skeleton ─────────────────────────────────────────────
  --color-skeleton-background-start: rgba(255, 255, 255, 0.06);
  --color-skeleton-background-end:   rgba(255, 255, 255, 0.12);
  --color-skeleton-border-start:     rgba(255, 255, 255, 0.06);
  --color-skeleton-border-end:       rgba(255, 255, 255, 0.12);
  --color-skeleton-border-radius:    var(--radius-sm);  // referenced by Skeleton.scss
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_dark-tokens.scss
git commit -m "feat(theme): add VV-mapped dark-mode semantic tokens"
```

---

### Task 2.3: Create the (initially empty) `theme/_overrides.scss` placeholder

This file gets populated in Phase 4. We create an empty stub now so `theme.scss` compiles in the wiring step.

**Files:**
- Create: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Create the file**

```scss
// packages/webapp/src/style/theme/_overrides.scss
// Blueprint Sass variable overrides (Layer A) + targeted CSS overrides (Layer B).
// Populated in Phase 4.
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): add overrides placeholder for Phase 4"
```

---

### Task 2.4: Reduce `_variables.scss` and wire `_base.scss`

**Files:**
- Modify: `packages/webapp/src/style/_variables.scss`
- Modify: `packages/webapp/src/style/_base.scss`

- [ ] **Step 1: Replace the entire content of `_variables.scss` with the legacy Sass-only content**

The `_variables.scss` file should now contain only the Sass `$variable` declarations and Blueprint Sass imports — no `--color-*` CSS custom properties. Replace the whole file with:

```scss
// packages/webapp/src/style/_variables.scss
// Legacy Sass-only variables. CSS custom property tokens have moved to theme/.
// Files referencing the symbols below continue to work unchanged.

@import '@blueprintjs/colors/lib/scss/colors';
@import '@blueprintjs/core/src/common/variables';

$ns: bp4;

// Box shadow (used by popover overrides)
$pt-popover-box-shadow:
  0 0 0 1px rgba(16, 22, 26, 0.02),
  0 2px 4px rgba(16, 22, 26, 0.1),
  0 8px 24px rgba(16, 22, 26, 0.1);

$blue1: #0069ff;
$blue2: #0052ff;
$blue3: rgb(0, 82, 204);

$pt-link-color: $blue3;
$pt-intent-primary: $blue1;
$menu-item-color-hover: $light-gray4;
$menu-item-color-active: $light-gray3;

$breadcrumbs-collapsed-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#6B8193' enable-background='new 0 0 16 16' xml:space='preserve'><g><circle cx='2' cy='8.03' r='2'/><circle cx='14' cy='8.03' r='2'/><circle cx='8' cy='8.03' r='2'/></g></svg>");

$sidebar-zindex: 16;

// pt-font-family is overridden by Sass var in theme/_overrides.scss (Phase 4).

$button-box-shadow: 0 0 0 !default;
$button-box-shadow-active: 0 0 0 !default;
$button-intent-box-shadow: 0 0 0 !default;
$button-intent-box-shadow-active: 0 0 0 !default;

$button-background-color-disabled: #e9ecef !default;
$button-background-color: #e6effb !default;
$button-background-color-hover: #cfdcee !default;

$app-bg: var(--color-app-body);

$sidebar-background: var(--color-sidebar-background);
$sidebar-text-color: var(--color-sidebar-text);
$sidebar-width: 100%;
$sidebar-menu-item-color: var(--color-sidebar-menu-item-text);
$sidebar-menu-item-color-active: var(--color-sidebar-menu-item-active-text);
$sidebar-popover-submenu-bg: rgb(1, 20, 62);
$sidebar-menu-label-color: var(--color-sidebar-menu-label-color);
$sidebar-submenu-item-color: rgba(255, 255, 255, 0.85);
$sidebar-submenu-item-hover-color: rgb(255, 255, 255);
$sidebar-logo-opacity: 0.5;
$sidebar-submenu-item-bg-color: rgba(255, 255, 255, 0.2);

$form-check-input-checked-color: #fff;
$form-check-input-checked-bg-color: $blue1;
$form-check-input-checked-bg-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'><g id='small_tick_1_'><g><path fill='#{$form-check-input-checked-color}' fill-rule='evenodd' clip-rule='evenodd' d='M12,5c-0.28,0-0.53,0.11-0.71,0.29L7,9.59L4.71,7.29C4.53,7.11,4.28,7,4,7C3.45,7,3,7.45,3,8c0,0.28,0.11,0.53,0.29,0.71l3,3C6.47,11.89,6.72,12,7,12s0.53-0.11,0.71-0.29l5-5C12.89,6.53,13,6.28,13,6C13,5.45,12.55,5,12,5z'/></g></g></svg>") !default;
$form-check-input-indeterminate-bg-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'><g id='small_tick_1_'><g><path fill='#{$form-check-input-checked-color}' fill-rule='evenodd' clip-rule='evenodd' d='M11,7H5C4.45,7,4,7.45,4,8c0,0.55,0.45,1,1,1h6c0.55,0,1-0.45,1-1C12,7.45,11.55,7,11,7z'/></g></g></svg>") !default;

// z-indexes
$zindex-dashboard-splash-screen: 39;
$zindex-toast: 40;

// Controls
$control-checked-background-color: #0069ff !default;
$control-checked-background-color-hover: #0069ff !default;
$control-checked-background-color-active: #0069ff !default;
$control-box-shadow: inset 0 0 0 1px #666 !default;

// Drawer
$drawer-background-color: $white !default;
$dark-drawer-background-color: $dark-gray2 !default;
```

- [ ] **Step 2: Update `_base.scss` to also import the new theme entry**

The current `_base.scss` imports `_variables`. We also need it to bring in `theme/theme.scss` so the `--color-*` CSS custom properties exist when component SCSS files reference them.

Replace `_base.scss` with:

```scss
// packages/webapp/src/style/_base.scss

@import '_variables';
@import 'theme/theme';
@import '_functions';
```

- [ ] **Step 3: Verify the SCSS compiles**

```bash
cd packages/webapp
pnpm run build 2>&1 | tail -40
```

Expected: build completes without Sass errors. If any error about a missing `var(--color-*)` reference shows up, add the missing token to BOTH `_light-tokens.scss` and `_dark-tokens.scss`.

- [ ] **Step 4: Commit**

```bash
git add packages/webapp/src/style/_variables.scss packages/webapp/src/style/_base.scss
git commit -m "refactor(theme): reduce _variables.scss to Sass-only, wire theme entry"
```

---

### Task 2.5: Verify the running app still renders

- [ ] **Step 1: Start the dev server**

```bash
cd packages/webapp
pnpm run dev
```

- [ ] **Step 2: Open http://localhost:4000 in a browser and confirm the app loads without console errors**

Expected: app renders. Initial theme depends on existing `localStorage.theme` (or OS preference if absent). Tokens now read from `theme/_light-tokens.scss` or `_dark-tokens.scss`.

- [ ] **Step 3: Confirm no visual regression worse than current state**

Visual identical to pre-migration is the bar — we have not yet applied the Blueprint overrides (Phase 4). Brand-emerald sidebar active state may appear if you navigate, which is intentional.

- [ ] **Step 4: Commit (no changes — just a verification gate)**

If there are any compilation fixes required during this step, commit them with:

```bash
git add packages/webapp/src/style/theme/
git commit -m "fix(theme): patch missing tokens flagged during build verification"
```

---

## Phase 3 — Theme switching (mode resolution)

### Task 3.1: Update `preload-theme.js` to handle three-state preference

**Files:**
- Modify: `packages/webapp/public/preload-theme.js`

- [ ] **Step 1: Replace the file content**

```javascript
// packages/webapp/public/preload-theme.js
// Pre-paint theme resolution. Runs before the JS bundle loads.
//
// Preference state:
//   localStorage['theme'] === 'dark'    → force dark
//   localStorage['theme'] === 'light'   → force light
//   localStorage['theme'] absent        → follow OS via prefers-color-scheme
//
// Payment portal pages always render light (legacy behaviour, preserved).

(function () {
  var stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var effective = stored != null ? stored : prefersDark ? 'dark' : 'light';

  if (window.location.pathname.indexOf('/payment') === 0) {
    effective = 'light';
  }

  var html = document.documentElement;
  var body = document.body;

  if (effective === 'dark') {
    html.classList.add('bp4-dark');
    if (body) body.classList.add('bp4-dark');
  } else {
    html.classList.remove('bp4-dark');
    if (body) body.classList.remove('bp4-dark');
  }
})();
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/public/preload-theme.js
git commit -m "feat(theme): three-state pref handling in preload-theme.js"
```

---

### Task 3.2: Remove hardcoded `bp4-dark` from `index.html`

**Files:**
- Modify: `packages/webapp/index.html`

- [ ] **Step 1: Change the `<body>` opening tag**

In `packages/webapp/index.html`, find:
```html
<body class="bp4-dark">
```
Replace with:
```html
<body>
```

The `bp4-dark` class is now applied (or removed) by `preload-theme.js` based on user preference. Hardcoding it caused light-preference users to flash dark on cold start.

- [ ] **Step 2: Verify cold-start in both modes**

```bash
cd packages/webapp
pnpm run dev
```

Test 1 — light preference:
```bash
# In browser devtools console:
localStorage.setItem('theme', 'light');
location.reload();
```
Expected: app loads light, no flash of dark.

Test 2 — dark preference:
```bash
localStorage.setItem('theme', 'dark');
location.reload();
```
Expected: app loads dark, no flash of light.

Test 3 — system follow:
```bash
localStorage.removeItem('theme');
location.reload();
```
Expected: app matches OS preference. Toggle OS dark mode → reload → app follows.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/index.html
git commit -m "fix(theme): remove hardcoded bp4-dark class from body"
```

---

### Task 3.3: Create `ThemePreferenceContext.tsx`

**Files:**
- Create: `packages/webapp/src/components/Dashboard/ThemePreferenceContext.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/webapp/src/components/Dashboard/ThemePreferenceContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setPreference: (next: ThemePreference) => void;
}

const STORAGE_KEY = 'theme';

const Ctx = createContext<ThemePreferenceContextValue | null>(null);

function readPreference(): ThemePreference {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (raw === 'light' || raw === 'dark') return raw;
  return 'system';
}

function readSystemEffective(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffective(pref: ThemePreference): EffectiveTheme {
  return pref === 'system' ? readSystemEffective() : pref;
}

function applyClass(effective: EffectiveTheme) {
  const html = document.documentElement;
  const body = document.body;
  if (effective === 'dark') {
    html.classList.add('bp4-dark');
    body.classList.add('bp4-dark');
  } else {
    html.classList.remove('bp4-dark');
    body.classList.remove('bp4-dark');
  }
}

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [systemEffective, setSystemEffective] = useState<EffectiveTheme>(readSystemEffective);

  const effectiveTheme: EffectiveTheme = preference === 'system' ? systemEffective : preference;

  // Listen to OS-level changes (only relevant when preference === 'system').
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemEffective(mq.matches ? 'dark' : 'light');
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setPreferenceState(readPreference());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Apply the class whenever the resolved theme changes.
  useEffect(() => {
    applyClass(effectiveTheme);
  }, [effectiveTheme]);

  const setPreference = (next: ThemePreference) => {
    if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
    setPreferenceState(next);
  };

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({ preference, effectiveTheme, setPreference }),
    [preference, effectiveTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemePreference(): ThemePreferenceContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useThemePreference must be used inside ThemePreferenceProvider');
  return value;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/components/Dashboard/ThemePreferenceContext.tsx
git commit -m "feat(theme): ThemePreferenceProvider with prefers-color-scheme listener"
```

---

### Task 3.4: Compose `ThemePreferenceProvider` into `DashboardThemeProvider`

**Files:**
- Modify: `packages/webapp/src/components/Dashboard/DashboardThemeProvider.tsx`

- [ ] **Step 1: Update the file to wrap children with the new provider**

Replace the file with:

```tsx
// packages/webapp/src/components/Dashboard/DashboardThemeProvider.tsx
import React from 'react';
import {
  ThemeProvider as StyleComponentsThemeProvider,
  StyleSheetManager,
} from 'styled-components';
import rtlcss from 'stylis-rtlcss';
import {
  defaultTheme,
  ThemeProvider as XStyledEmotionThemeProvider,
} from '@xstyled/emotion';
import { useAppIntlContext } from '../AppIntlProvider';
import { ThemePreferenceProvider } from './ThemePreferenceContext';

const theme = {
  ...defaultTheme,
  bpPrefix: 'bp4',
};

interface DashboardThemeProviderProps {
  children: React.ReactNode;
}

export function DashboardThemeProvider({
  children,
}: DashboardThemeProviderProps) {
  const { direction } = useAppIntlContext();

  return (
    <ThemePreferenceProvider>
      <StyleSheetManager
        {...(direction === 'rtl' ? { stylisPlugins: [rtlcss] } : {})}
      >
        <StyleComponentsThemeProvider theme={{ dir: direction }}>
          <XStyledEmotionThemeProvider theme={theme}>
            {children}
          </XStyledEmotionThemeProvider>
        </StyleComponentsThemeProvider>
      </StyleSheetManager>
    </ThemePreferenceProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript still compiles**

```bash
cd packages/webapp
pnpm exec tsc --noEmit 2>&1 | tail -20
```

Expected: no errors related to `DashboardThemeProvider` or `ThemePreferenceContext`.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/components/Dashboard/DashboardThemeProvider.tsx
git commit -m "feat(theme): compose ThemePreferenceProvider into DashboardThemeProvider"
```

---

### Task 3.5: Create `ThemeAppearanceSection.tsx`

**Files:**
- Create: `packages/webapp/src/containers/Preferences/General/ThemeAppearanceSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
// packages/webapp/src/containers/Preferences/General/ThemeAppearanceSection.tsx
import React from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import {
  useThemePreference,
  ThemePreference,
} from '@/components/Dashboard/ThemePreferenceContext';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeAppearanceSection() {
  const { preference, setPreference } = useThemePreference();

  return (
    <section style={{ padding: '16px 0', borderTop: '1px solid var(--color-app-shell-divider)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <label
          style={{ minWidth: 160, fontWeight: 500, color: 'var(--color-preferences-topbar-title)' }}
        >
          Appearance
        </label>
        <ButtonGroup>
          {OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              active={preference === opt.value}
              onClick={() => setPreference(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
        <span style={{ color: 'var(--color-muted-text)', fontSize: 12 }}>
          Stored on this device only.
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/containers/Preferences/General/ThemeAppearanceSection.tsx
git commit -m "feat(theme): ThemeAppearanceSection component"
```

---

### Task 3.6: Render `ThemeAppearanceSection` on Preferences/General page

**Files:**
- Modify: `packages/webapp/src/containers/Preferences/General/GeneralFormPage.tsx`

- [ ] **Step 1: Modify the file**

The toggle renders **outside** the Formik form (theme is a client-only preference, not server-persisted org data).

Replace the file with:

```tsx
// @ts-nocheck
import React, { useEffect } from 'react';
import intl from 'react-intl-universal';
import { Formik } from 'formik';
import { Intent } from '@blueprintjs/core';

import '@/style/pages/Preferences/GeneralForm.scss';

import { AppToaster } from '@/components';
import GeneralForm from './GeneralForm';
import { PreferencesGeneralSchema } from './General.schema';
import { useGeneralFormContext } from './GeneralFormProvider';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { ThemeAppearanceSection } from './ThemeAppearanceSection';

import { compose, transformToForm } from '@/utils';

const defaultValues = {
  name: '',
  industry: '',
  location: '',
  base_currency: '',
  language: '',
  fiscal_year: '',
  date_format: '',
  timezone: '',
  tax_number: '',
  address: {},
};

function GeneralFormPage({ changePreferencesPageTitle }) {
  const { updateOrganization, organization } = useGeneralFormContext();

  useEffect(() => {
    changePreferencesPageTitle(intl.get('general'));
  }, [changePreferencesPageTitle]);

  const initialValues = {
    ...defaultValues,
    ...transformToForm(organization.metadata, defaultValues),
  };

  const handleFormSubmit = (values, { setSubmitting }) => {
    const onSuccess = () => {
      AppToaster.show({
        message: intl.get('preferences.general.success_message'),
        intent: Intent.SUCCESS,
      });
      setSubmitting(false);
      if (organization.metadata?.language !== values.language) {
        window.location.reload();
      }
    };
    const onError = () => setSubmitting(false);
    updateOrganization({ ...values }).then(onSuccess).catch(onError);
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={PreferencesGeneralSchema}
        onSubmit={handleFormSubmit}
        component={GeneralForm}
      />
      <ThemeAppearanceSection />
    </>
  );
}

export default compose(withDashboardActions)(GeneralFormPage);
```

- [ ] **Step 2: Manual verification**

```bash
cd packages/webapp
pnpm run dev
```

Navigate to Preferences → General. Confirm:
- The form renders unchanged
- Below the form, the "Appearance" row appears with Light / System / Dark buttons
- Clicking each button: applies immediately, persists across reload, syncs across open tabs
- "System" removes the localStorage entry and reverts to OS preference

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/containers/Preferences/General/GeneralFormPage.tsx
git commit -m "feat(theme): render appearance toggle on Preferences/General page"
```

---

## Phase 4 — Component overrides

### Task 4.1: Add Layer A — Sass variable overrides to `_overrides.scss`

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Replace file content**

```scss
// packages/webapp/src/style/theme/_overrides.scss
// Layer A: Sass variable overrides (apply before Blueprint compiles).
// Layer B: CSS selector overrides (apply after Blueprint compiles).

// ─── Layer A ──────────────────────────────────────────────
// These override Blueprint's pre-compile Sass variables and cascade
// through 100% of Blueprint components.

$pt-border-radius:           8px !default;
$pt-border-radius-large:     14px !default;
$pt-intent-primary:          #22C55E !default;  // var(--vv-emerald-500), but Sass needs concrete value
$pt-outline-color:           rgba(34, 197, 94, 0.30) !default;
$pt-font-family:             'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif !default;
$pt-monospace-font-family:   'Fira Code', Menlo, 'Courier New', monospace !default;

// Note: !default means a previous `_variables.scss` definition would win.
// _variables.scss does NOT redefine these, so our values apply.
```

- [ ] **Step 2: Verify build still compiles**

```bash
cd packages/webapp
pnpm run build 2>&1 | tail -20
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): Layer A Sass overrides (radius, intent, fonts)"
```

---

### Task 4.2: Layer B-1 — Button primary override

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append the Layer B section header + Button block**

Append to the bottom of `_overrides.scss`:

```scss
// ─── Layer B ──────────────────────────────────────────────
// CSS selector overrides for surfaces that Sass variables don't reach.
// Each block is independently commentable for regression isolation.

// Button — primary intent fill + states
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

body.bp4-dark .bp4-button.bp4-intent-primary {
  color: var(--vv-slate-900);

  &:hover:not(:disabled) {
    background-color: var(--vv-emerald-400);
  }

  &:active:not(:disabled),
  &.bp4-active {
    background-color: var(--vv-emerald-300);
  }
}
```

- [ ] **Step 2: Manual verification at http://localhost:4000**

Find a primary Button (e.g., "New Account" on Accounts Chart page). Confirm:
- Emerald fill in both modes
- Hover darkens (or lightens, in dark mode)
- Focus shows a soft 2px ring with 2px gap to body
- Border-radius is now 8px

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): override Button primary states (Layer B-1)"
```

---

### Task 4.3: Layer B-2 — Input focus override

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// Input — focus ring + tabular numerals on numeric inputs
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

- [ ] **Step 2: Manual verification**

Open any form input (search box, customer name, an amount field). Confirm:
- Default state: soft border
- Focus: 1px emerald + 3px soft halo, no harsh Blueprint blue glow
- Number inputs use tabular numerals (digits align in columns)

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): override Input focus + tnum on numerics (Layer B-2)"
```

---

### Task 4.4: Layer B-3 — DataTable polish

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// DataTable — head tint, row hover, focus cell border, tabular nums on amounts
.bp4-html-table,
.DataTable {
  thead th,
  .table-thead .tr {
    background-color: var(--color-datatable-head-background);
    color: var(--color-datatable-head-text);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 11px;
    font-weight: var(--font-weight-semibold);
  }

  tbody tr,
  .table-tbody .tr {
    transition: background-color 100ms ease;
  }

  tbody tr:hover,
  .table-tbody .tr:hover {
    background-color: var(--color-datatable-cell-hover-background);
  }

  // Tabular nums on every column that contains amount-style content.
  td.amount,
  td[data-type='amount'],
  .td-amount,
  .DataTable-cell--amount {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
}
```

- [ ] **Step 2: Manual verification**

Navigate to Accounts Chart. Confirm:
- Head row: uppercase, slate background, small caps appearance
- Row hover: subtle background shift
- Balance column digits align in columns (tabular)

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): polish DataTable head/hover/tnum (Layer B-3)"
```

---

### Task 4.5: Layer B-4 — Sidebar active item pill

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

The Bigcapital sidebar uses Blueprint's `.bp4-active.bp4-intent-primary` for the active state. Background/color already pull from our tokens (set in Task 2.1/2.2). This task adds the missing `border-radius` so the active state renders as a pill, not a slab.

```scss
// Sidebar — round the active item to an emerald pill
// Active background/color tokens are already remapped in _light-tokens.scss / _dark-tokens.scss.
.sidebar-menu .bp4-button.bp4-active.bp4-intent-primary {
  border-radius: var(--radius-md);
}
```

(If the sidebar item is rendered with a different wrapper class than `.sidebar-menu`, locate the wrapper via DevTools and update the parent selector.)

- [ ] **Step 2: Manual verification**

Click any sidebar item. Confirm the active state renders as an emerald-tinted pill with emerald text, not a slab.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): sidebar active emerald pill (Layer B-4)"
```

---

### Task 4.6: Layer B-5 — Card surface

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// Card — soft surface for hierarchy in light mode, subtle border in both modes
.bp4-card {
  background-color: var(--color-card-background);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-card-border);
  box-shadow: none;

  &.bp4-elevation-1,
  &.bp4-elevation-2,
  &.bp4-elevation-3 {
    box-shadow: none;  // brand.md: no shadows on body cards
  }
}
```

- [ ] **Step 2: Manual verification**

Navigate to Dashboard (KPI cards) and Bank Accounts (account cards). Confirm:
- Cards have a 14px corner radius
- Subtle border (slate-200 light / 6% white dark)
- No drop shadow

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): card surface radius + flat shadow (Layer B-5)"
```

---

### Task 4.7: Layer B-6 — Dialog & Drawer headers

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// Dialog & Drawer headers — emerald left rule + refined padding
.bp4-dialog .bp4-dialog-header,
.bp4-drawer .bp4-drawer-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-drawer-header-border);
  background-color: var(--color-drawer-header-background);
  color: var(--color-drawer-header-text);
  font-weight: var(--font-weight-semibold);
  border-left: 3px solid var(--color-drawer-border-left);
}

body.bp4-dark .bp4-dialog .bp4-dialog-header,
body.bp4-dark .bp4-drawer .bp4-drawer-header {
  border-left-color: transparent;
}
```

- [ ] **Step 2: Manual verification**

Open any drawer (e.g., open a customer detail). Confirm:
- Header has slim emerald left rule in light mode
- Header padding is consistent

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): Dialog/Drawer header treatment (Layer B-6)"
```

---

### Task 4.8: Layer B-7 — Scrollbar theming

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// Scrollbar — both modes (today's dark mode scrollbars remained white)
:root {
  scrollbar-color: var(--vv-slate-300) transparent;
  scrollbar-width: thin;
}

body.bp4-dark {
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--vv-slate-300);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

body.bp4-dark ::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
}
```

- [ ] **Step 2: Manual verification**

Open a scrollable list (Accounts Chart with many rows). Confirm scrollbars are themed in both modes.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): scrollbar coloring for both modes (Layer B-7)"
```

---

### Task 4.9a: Print stylesheet — force light mode

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// Print — force light theme regardless of preference (brand.md convention)
@media print {
  html, body {
    background: #fff !important;
    color: #0F172A !important;
  }
  body.bp4-dark {
    // Strip dark-mode token overrides while printing.
    // Re-apply light-mode key values for print fidelity.
    --color-app-body: #fff;
    --color-card-background: #fff;
    --color-card-border: #E2E8F0;
    --color-datatable-text: #0F172A;
    --color-financial-sheet-title-text: #0F172A;
    --color-financial-sheet-type-text: #0F172A;
    --color-financial-sheet-date-text: #0F172A;
    --color-report-item-text: #0F172A;
  }
}
```

- [ ] **Step 2: Manual verification**

In the running app, navigate to a financial report (Reports → Balance Sheet) in dark mode. Trigger browser print preview (⌘P / Ctrl+P). Confirm: the preview renders with a white background and dark text, not the dark theme.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): force light mode in print stylesheet"
```

---

### Task 4.9: Layer B-8 — Skeleton loader

**Files:**
- Modify: `packages/webapp/src/style/theme/_overrides.scss`

- [ ] **Step 1: Append**

```scss
// Skeleton — align loading placeholders with new palette
.bp4-skeleton,
.TableSkeletonRows {
  background: linear-gradient(
    90deg,
    var(--color-skeleton-background-start) 0%,
    var(--color-skeleton-background-end) 50%,
    var(--color-skeleton-background-start) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 2: Manual verification**

Reload Accounts Chart with throttled network (Network → Slow 3G in DevTools). Observe the skeleton rows. Confirm they shimmer in the right tonal range for each mode.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/style/theme/_overrides.scss
git commit -m "feat(theme): skeleton loader palette alignment (Layer B-8)"
```

---

## Phase 5 — Parity check script

### Task 5.1: Create `scripts/theme-parity-check.mjs`

**Files:**
- Create: `packages/webapp/scripts/theme-parity-check.mjs`

- [ ] **Step 1: Create the file**

```javascript
#!/usr/bin/env node
// packages/webapp/scripts/theme-parity-check.mjs
//
// Parity audit for theme tokens. Parses _light-tokens.scss and _dark-tokens.scss,
// extracts every `--color-*` declaration name, and fails if any name exists
// in one mode but not the other.
//
// Usage: pnpm theme:check

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LIGHT_PATH = resolve(ROOT, 'src/style/theme/_light-tokens.scss');
const DARK_PATH = resolve(ROOT, 'src/style/theme/_dark-tokens.scss');

// Match `--color-foo:` and `--color-foo :` declarations. Ignore comments / vars in values.
const TOKEN_RE = /^\s*(--color-[a-z0-9-]+)\s*:/im;

async function extractTokens(path) {
  const content = await readFile(path, 'utf8');
  const seen = new Set();
  for (const line of content.split('\n')) {
    if (line.trimStart().startsWith('//')) continue;
    const m = line.match(TOKEN_RE);
    if (m) seen.add(m[1]);
  }
  return seen;
}

function diff(a, b) {
  return [...a].filter((x) => !b.has(x)).sort();
}

const light = await extractTokens(LIGHT_PATH);
const dark = await extractTokens(DARK_PATH);

const onlyLight = diff(light, dark);
const onlyDark = diff(dark, light);

let exitCode = 0;

if (onlyLight.length) {
  exitCode = 1;
  console.error(`\n❌ ${onlyLight.length} token(s) defined in LIGHT only:`);
  for (const t of onlyLight) console.error(`   ${t}`);
}

if (onlyDark.length) {
  exitCode = 1;
  console.error(`\n❌ ${onlyDark.length} token(s) defined in DARK only:`);
  for (const t of onlyDark) console.error(`   ${t}`);
}

if (exitCode === 0) {
  console.log(`✅ theme parity: ${light.size} tokens, both modes aligned`);
} else {
  console.error(
    `\nFix: add the missing token(s) to the mode where they're absent, or remove from the mode they shouldn't be in.`,
  );
}

process.exit(exitCode);
```

- [ ] **Step 2: Make the script executable**

```bash
chmod +x packages/webapp/scripts/theme-parity-check.mjs
```

- [ ] **Step 3: Add the npm script**

In `packages/webapp/package.json`, find the `"scripts"` block and add `"theme:check"`:

```diff
   "scripts": {
     "dev": "cross-env PORT=4000 vite",
     "build": "vite build",
+    "theme:check": "node scripts/theme-parity-check.mjs",
     ...
   }
```

- [ ] **Step 4: Run the script and verify it passes**

```bash
cd packages/webapp
pnpm theme:check
```

Expected:
```
✅ theme parity: <N> tokens, both modes aligned
```

If it fails, add the missing tokens to the absent mode (re-edit `_light-tokens.scss` or `_dark-tokens.scss`).

- [ ] **Step 5: Verify the script catches a regression**

Temporarily delete one token from `_dark-tokens.scss`, re-run `pnpm theme:check`. Expected: exit 1, error names the missing token. Then restore the token.

- [ ] **Step 6: Commit**

```bash
git add packages/webapp/scripts/theme-parity-check.mjs packages/webapp/package.json
git commit -m "feat(theme): theme-parity-check.mjs + pnpm theme:check script"
```

---

## Phase 6 — Visual QA pass

### Task 6.1: Tier 1 manual checklist

**Files:**
- Create: `docs/superpowers/plans/theme-qa-tier1.md`

- [ ] **Step 1: Create a checklist file at `docs/superpowers/plans/theme-qa-tier1.md`**

```markdown
# Theme refresh — Tier 1 QA checklist

For each screen below, verify in **both modes** (toggle via Preferences → General) at **1100px** and **1440px** widths:

- [ ] No console errors
- [ ] No element renders against a white-on-white or dark-on-dark surface
- [ ] Primary buttons are emerald in both modes
- [ ] Focus rings on inputs are emerald, not blue
- [ ] Tables show tabular nums on $ columns
- [ ] Sidebar active item is an emerald pill
- [ ] Card surfaces have rounded corners (14px) and 1px border
- [ ] Scrollbars are themed in both modes

## Screens

- [ ] Dashboard
- [ ] Accounts Chart
- [ ] Invoice list
- [ ] Invoice detail
- [ ] Invoice create form
- [ ] Reports viewer
- [ ] Bank transactions
- [ ] Items list
- [ ] Sidebar navigation
- [ ] Login / Setup

## Notes
Document any regressions or open issues at the bottom of this file.
```

- [ ] **Step 2: Walk through the checklist with the running app and check every box**

```bash
cd packages/webapp
pnpm run dev
```

Open each screen, take a quick screenshot (recommend: macOS ⌘⇧4 to a screenshots folder), and tick the box if it passes.

- [ ] **Step 3: Commit the completed checklist**

```bash
git add docs/superpowers/plans/theme-qa-tier1.md
git commit -m "docs(theme): Tier 1 QA checklist completed"
```

---

### Task 6.2: Tier 2 manual checklist

**Files:**
- Create: `docs/superpowers/plans/theme-qa-tier2.md`

- [ ] **Step 1: Create the file with the same template as Tier 1 but for these screens**

```markdown
# Theme refresh — Tier 2 QA checklist

Same verification template as Tier 1. Both modes, both breakpoints.

## Screens

- [ ] Customers list
- [ ] Vendors list
- [ ] Estimates
- [ ] Expenses
- [ ] Payments Received
- [ ] Preferences (General, Branding, Currencies, Branches, Warehouses)
- [ ] Drawer: Invoice quick-view
- [ ] Drawer: Bill quick-view
- [ ] Drawer: Customer detail
- [ ] Drawer: Vendor detail
- [ ] Drawer: Payment detail
- [ ] Universal Search dialog
- [ ] Tax Rates
```

- [ ] **Step 2: Walk through and tick boxes**

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/theme-qa-tier2.md
git commit -m "docs(theme): Tier 2 QA checklist completed"
```

---

### Task 6.3: WCAG AA contrast verification

**Files:**
- Modify: `docs/superpowers/plans/theme-qa-tier1.md` (append a contrast section)

- [ ] **Step 1: Install axe DevTools or use the WebAIM contrast checker (https://webaim.org/resources/contrastchecker/)**

- [ ] **Step 2: Test these critical pairs in both modes**

| Pair | Light expected | Dark expected |
|---|---|---|
| Body text on `--color-app-body` | slate-900 on white ≥ 14:1 | white-90% on slate-900 ≥ 14:1 |
| Primary button text on emerald | white on emerald-700 ≥ 4.7:1 | slate-900 on emerald-500 ≥ 9:1 |
| Sidebar inactive item on slate-900 | rgba(255,255,255,0.85) on slate-900 ≥ 11:1 | same |
| Sidebar active text on emerald-tint | emerald-300 on rgba(34,197,94,0.18) ≥ 4.5:1 | same |
| Muted text on body | slate-500 on white ≥ 4.6:1 | white-55% on slate-900 ≥ 4.5:1 |
| Focus ring on body | emerald-500 vs body bg ≥ 3:1 | same |

- [ ] **Step 3: Document results**

Append to `docs/superpowers/plans/theme-qa-tier1.md`:

```markdown
## WCAG AA contrast — verified

| Pair | Light | Dark |
|---|---|---|
| Body text | <ratio> ✅ | <ratio> ✅ |
| Primary button | ... | ... |
| Sidebar items | ... | ... |
| Muted text | ... | ... |
| Focus ring | ... | ... |
```

- [ ] **Step 4: If any pair fails AA, adjust the corresponding token and re-test**

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/theme-qa-tier1.md
git commit -m "docs(theme): WCAG AA contrast verification logged"
```

---

## Final verification gate

Once Phases 1-6 are complete:

- [ ] `pnpm theme:check` exits 0
- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm run build` succeeds
- [ ] All Tier 1 + Tier 2 checkboxes are ticked
- [ ] All WCAG AA contrast pairs are documented and pass
- [ ] No new console errors in production build
- [ ] `localStorage.removeItem('theme'); location.reload();` resolves to OS preference correctly

If all pass, the theme refresh is complete. Open a PR from your working branch into `develop`.
