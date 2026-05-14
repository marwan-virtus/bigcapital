# Theme Improvement — VV-aligned visual refresh with light/dark parity

**Status:** Draft for approval
**Date:** 2026-05-14
**Scope:** `packages/webapp` (frontend only)

## Summary

A theme refresh of the Bigcapital webapp that:

1. Aligns the visual language with the Verus Virtus brand (emerald accent, slate neutrals, Fira Sans + Fira Code typography, rounded surfaces).
2. Makes both light and dark modes equally polished and respects the user's OS preference via `prefers-color-scheme`.
3. Fixes the known token-level inconsistencies in `_variables.scss` (broken references, dark-mode whites, typos, duplicate writes).

This is pure design work — no library changes, no feature changes, no infrastructure changes.

## Goals

- Visual cohesion with the Verus Virtus landing page (`vv-landing-page/docs/brand.md` is the source of truth for the brand system).
- First-class dark mode that matches light mode in polish, not bolted-on.
- Automatic OS-preference-driven mode resolution with a user override toggle.
- A clean, audit-able token layer that makes future theme work safe.
- Acceptance under WCAG AA contrast.

## Non-goals (constraints set by the user)

- **No library changes.** Blueprint.js v4 stays. Lucide does not replace Blueprint icons.
- **No feature changes.** No new functionality, no removed functionality.
- **No infrastructure changes.** No new build steps, no new CI gates, no backend changes, no DB migration, no schema additions.
- **No density / spacing changes.** Blueprint's `$pt-grid-size: 10px` stays. Row heights and paddings on data tables are not changed.
- **No type-scale changes.** Blueprint's font-size scale stays. Only the font *family* changes.
- **No component shape changes.** Button heights, input heights stay Blueprint default. Only border-radius and colors change.
- **No animations / motion library.** Hover transitions are simple 1-line CSS.
- **No visual regression infra** (Chromatic, Percy, Lost-Pixel, snapshot tests).
- **No Storybook revival.**

## 1. Architecture — file layout

Today the entire theme lives in `packages/webapp/src/style/_variables.scss` (~720 lines, mixed concerns, several bugs).

The refresh introduces a new `theme/` folder and reduces `_variables.scss` to legacy Sass-only content:

```
packages/webapp/src/style/
├── theme/                              ← NEW
│   ├── _palette.scss                   ← foundational palette: emerald + slate scales, functional, chart
│   ├── _typography.scss                ← Fira Sans + Fira Code @font-face declarations
│   ├── _radius.scss                    ← radius scale (sm/md/lg/xl)
│   ├── _light-tokens.scss              ← semantic mappings for light mode
│   ├── _dark-tokens.scss               ← semantic mappings for dark mode
│   ├── _overrides.scss                 ← targeted Blueprint component overrides (Sass + CSS)
│   └── theme.scss                      ← top-level entry: imports the above
│
├── _variables.scss                     ← reduced: Sass-only legacy vars still referenced elsewhere
│
└── App.scss                            ← imports `theme/theme.scss` (one line change)
```

**Why split it:**

- Parity audit becomes mechanical — `_light-tokens.scss` and `_dark-tokens.scss` are sibling files of the same shape, diffable for missing tokens.
- Today's bugs (`--color-base-sand-0` references, `ekement` typo, dark-mode whites) become trivial to spot when each concern is in its own file.
- A future theme variant (e.g., high-contrast accessibility) becomes a single-file addition.

**What does not move:**

- Component code (`.tsx` files).
- Build configuration.
- Existing `DashboardThemeProvider` API.
- The global selector `body.bp4-dark` — still the runtime switch.

## 2. Token surface

### Foundational tokens (new — `theme/_palette.scss`)

```scss
// Brand scales
--vv-emerald-50  through  --vv-emerald-900
--vv-slate-50    through  --vv-slate-900

// Functional (from VV brand.md)
--vv-color-success: var(--vv-emerald-500);   // #22C55E
--vv-color-danger:  #EF4444;                 // red-500
--vv-color-warning: #F59E0B;                 // amber-500
--vv-color-info:    #3B82F6;                 // blue-500

// Data viz
--vv-chart-1: var(--vv-emerald-500);
--vv-chart-2: #3B82F6;   // blue-500
--vv-chart-3: #F59E0B;   // amber-500
--vv-chart-4: #8B5CF6;   // violet-500
--vv-chart-5: #EC4899;   // pink-500
```

### Typography tokens (new — `theme/_typography.scss`)

```scss
--font-family-sans: 'Fira Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
--font-family-mono: 'Fira Code', Menlo, 'Courier New', monospace;

--font-weight-regular:  400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

**Font hosting:** self-host woff2 files at `packages/webapp/public/fonts/`. No Google CDN runtime dependency. Adds ~80kB to the bundle. Weights shipped: 400, 500, 600, 700 (Sans); 400, 500 (Code).

### Radius tokens (new — `theme/_radius.scss`)

```scss
--radius-sm: 6px;     // pills, badges
--radius-md: 8px;     // buttons, inputs (default)
--radius-lg: 10px;    // base
--radius-xl: 14px;    // cards (default)
```

### Semantic tokens (existing surface, re-mapped per mode)

The ~150 existing `--color-*` tokens (`--color-primary`, `--color-sidebar-background`, `--color-datatable-head-background`, etc.) **keep their names** — zero JSX impact. Only their values change, and they get split into `_light-tokens.scss` and `_dark-tokens.scss`.

Example:
```scss
// _light-tokens.scss
:root {
  --color-primary: var(--vv-emerald-700);   // #16803C — AA contrast on white
  --color-sidebar-background: var(--vv-slate-900);
  --color-card-background: #FFFFFF;
  // … remaining ~150 tokens
}

// _dark-tokens.scss
body.bp4-dark {
  --color-primary: var(--vv-emerald-500);   // #22C55E — full saturation on dark
  --color-sidebar-background: var(--vv-slate-950);
  --color-card-background: rgba(255, 255, 255, 0.04);
  // … remaining ~150 tokens
}
```

Every semantic token is **defined in both files**. The audit script (Section 5) enforces this.

### Out of scope (token-wise)

- Spacing scale — Blueprint defaults stay.
- Type scale — Blueprint defaults stay.
- Component shape — only border-radius and colors change.
- Shadow tokens — Blueprint's popover shadow stays; no new shadow tokens.

## 3. Theme switching (mode resolution)

### State model

```
localStorage['bc-theme-preference'] ∈ {'light', 'dark', 'system'}  (default: 'system')
```

### Resolution logic

```
effectiveTheme = preference === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : preference
```

When `effectiveTheme === 'dark'`, the `bp4-dark` class is applied to `<body>`. Blueprint's existing convention; we are reusing it, not replacing it.

### Layers

1. **Pre-paint inline script in `packages/webapp/index.html`** (NEW, ~15 lines)
   Runs *before* the JS bundle loads. Reads localStorage + matchMedia, applies the `bp4-dark` class to body if needed. Prevents FOUC on cold start.

2. **`DashboardThemeProvider`** (EXISTING, modified)
   Adds:
   - A `matchMedia('(prefers-color-scheme: dark)')` change-event listener that updates the class when OS preference changes (only when `preference === 'system'`).
   - A React context exposing `{ preference, effectiveTheme, setPreference }`.

   No API rename, no new container.

3. **Toggle UI** (NEW, in existing Preferences page)
   A single new row in the existing General preferences section:
   ```
   Appearance:  [ Light ]  [ System ]  [ Dark ]
   ```
   Implemented with Blueprint's existing `<Button>` group. ~30 lines of TSX, no new route.

### Edge cases handled

| Case | Behavior |
|---|---|
| First-ever load, no localStorage | Default to `'system'`, follow OS |
| OS appearance flipped while app is open | Auto-switches if preference is `'system'`; ignored otherwise |
| User picks "Dark" in preferences | Stays dark regardless of OS, persisted across sessions |
| Multiple tabs open | `storage` event listener keeps tabs in sync |
| Print stylesheet | Forced to light regardless of preference |

### What does not change

- No new React provider tree.
- No backend changes, no DB migration, no API endpoint. Preference is client-only.
- No xstyled / emotion swap.
- No new global state library.

## 4. Components touched

Two override layers, both small surface area, both reversible by commenting out a single `@use` line in `theme.scss`.

### Layer A — Sass variable overrides

```scss
// theme/_overrides.scss (Sass section, applied before Blueprint compiles)
$pt-border-radius:         8px;                       // from 2-3px
$pt-border-radius-large:   14px;                      // for cards
$pt-intent-primary:        var(--vv-emerald-500);
$pt-outline-color:         rgba(34, 197, 94, 0.30);   // focus glow, softer
$pt-font-family:           var(--font-family-sans);
$pt-monospace-font-family: var(--font-family-mono);
```

Reach: 100% of Blueprint components inherit these. Zero JSX changes.

### Layer B — CSS selector overrides

| # | Surface | What changes | Selector scope |
|---|---|---|---|
| 1 | **Button** primary | Emerald fill, hover-darken, active-darken-more, soft focus glow | `.bp4-button.bp4-intent-primary` |
| 2 | **Input** focus | 2px emerald ring (not Blueprint's blue glow), `tnum` on number inputs | `.bp4-input:focus` |
| 3 | **DataTable** | Head background tinted, row hover, cell focus border, tabular nums on amount cells | `.bp4-html-table`, `.DataTable` |
| 4 | **Sidebar active item** | Emerald-pill background + emerald text | `.sidebar-menu-item--active` |
| 5 | **Card surface** | Subtle slate-50 tint in light mode for hierarchy | `.bp4-card` |
| 6 | **Dialog & Drawer headers** | Slim emerald border-left, refined header padding | `.bp4-dialog-header`, `.bp4-drawer-header` |
| 7 | **Scrollbar** | Webkit + Firefox scrollbar coloring for both modes (today's dark mode scrollbars stay white) | `::-webkit-scrollbar`, `scrollbar-color` |
| 8 | **Skeleton loader** | Background/end colors aligned with new palette | `.bp4-skeleton`, `.TableSkeletonRows` |

Each override is 5-20 lines of CSS. Total `_overrides.scss` ≈ 200 lines.

### Explicitly NOT touched

- No JSX/TSX edits except the toggle UI from Section 3.
- No component renames or new wrappers.
- No new theme-token JS objects, no theme provider rewrite.
- No animation library. Hover/active transitions are 1-line `transition: background-color 120ms ease`.

### Reversibility

`theme.scss` imports each layer:

```scss
@use 'theme/palette';
@use 'theme/typography';
@use 'theme/radius';
@use 'theme/light-tokens';
@use 'theme/dark-tokens';
@use 'theme/overrides';   // comment to disable just the polish layer
```

Per-override regression is isolated by commenting that specific block inside `_overrides.scss`.

## 5. Light/dark parity + verification

### Parity audit (mechanical)

`packages/webapp/scripts/theme-parity-check.mjs` — a small Node script.

What it does:
- Parses `_light-tokens.scss` and `_dark-tokens.scss`.
- Extracts every `--color-*` declaration from each.
- Diffs the sets.
- Exits 1 with a per-token report if any token is defined in one mode but not the other.

Invoked via `pnpm theme:check` (one new line in `packages/webapp/package.json`). Local-only, not wired to CI per the no-infra constraint.

### Visual QA matrix

Each surface verified in both modes × both `prefers-color-scheme` states × 1100px and 1440px widths.

**Tier 1 — deep review (must look great):**
Dashboard, Accounts Chart, Invoice list & detail, Invoice create form, Reports viewer, Bank transactions, Items list, Sidebar navigation, Login/Setup.

**Tier 2 — deep review (must be functional):**
Customers, Vendors, Estimates, Expenses, Payments, Preferences page, top-5 Drawers, Universal Search, Tax Rates.

**Tier 3 — smoke check:** All remaining feature containers.

Roughly **20 priority screens × 2 modes = 40 deep checks**. Estimated 6-8 hours of focused review.

### Contrast / accessibility

All text-on-surface combinations verified against **WCAG AA**:

- Body text on body bg: ≥ 4.5:1
- Large/bold text ≥ 18px: ≥ 3:1
- UI controls (borders, focus rings): ≥ 3:1 against adjacent surface

Notable: **emerald in light mode shifts to `#16803C`** (emerald-700) for AA on white; dark mode keeps `#22C55E` (emerald-500). Both via semantic tokens, never hardcoded.

### Acceptance criteria — "done" means

1. `pnpm theme:check` passes (parity audit clean).
2. All ~150 semantic tokens defined in both modes; no broken `var(--undefined)` references.
3. All 8 Layer-B overrides ship for both modes (no light-only or dark-only polish).
4. Tier 1 + Tier 2 screens manually verified in both modes; sign-off in a checklist committed alongside the work.
5. WCAG AA contrast verified on all text and interactive surface combinations.
6. Existing dev workflow unaffected: `pnpm dev:webapp` runs, HMR works, no new build steps.
7. Theme toggle in Preferences page works end-to-end: Light / System / Dark.
8. Cold-start with localStorage `'dark'` does not flash light theme (FOUC prevention works).

### Not in the testing plan

- No Chromatic / Percy / Lost-Pixel.
- No snapshot tests for component appearance.
- No Storybook revival.
- No new CI workflow steps.

## Appendix A — Known bugs in existing `_variables.scss` that this work fixes

| Issue | Where | Fix |
|---|---|---|
| `--color-base-sand-0` referenced but never defined | 3 token mappings in `:root` | Define in `_palette.scss` or replace ref |
| `--color-ui-html-select-background: #fff` in dark mode | Line 393 | Map to dark surface |
| `--color-select-button-background: #fff` in dark mode | Line 622 | Map to dark surface |
| `--color-danger: red` | Line 8 | Replace with hex |
| `--color-primary: #8abbff` in light mode | Line 7 | Replace with `var(--vv-emerald-700)` |
| Typo `--color-ekement-customize-*` (should be `element`) | Lines 258, 584 | Rename to `--color-element-customize-*` |
| Duplicate property assignments | ~15 properties in dark block | Deduplicate |
| `--color-skeleton-border-radius: 2px` | Lines 313, 648 | Move to `_radius.scss` as `--radius-skeleton` |

## Appendix B — File diff at a glance

**Added:**
- `packages/webapp/src/style/theme/_palette.scss`
- `packages/webapp/src/style/theme/_typography.scss`
- `packages/webapp/src/style/theme/_radius.scss`
- `packages/webapp/src/style/theme/_light-tokens.scss`
- `packages/webapp/src/style/theme/_dark-tokens.scss`
- `packages/webapp/src/style/theme/_overrides.scss`
- `packages/webapp/src/style/theme/theme.scss`
- `packages/webapp/public/fonts/FiraSans-{400,500,600,700}.woff2`
- `packages/webapp/public/fonts/FiraCode-{400,500}.woff2`
- `packages/webapp/scripts/theme-parity-check.mjs`

**Modified:**
- `packages/webapp/src/style/_variables.scss` — emptied of `--color-*` tokens; reduced to legacy Sass-only content
- `packages/webapp/src/style/App.scss` — imports `theme/theme.scss`
- `packages/webapp/index.html` — adds the pre-paint inline script
- `packages/webapp/src/components/Dashboard/DashboardThemeProvider.tsx` — adds matchMedia listener + React context
- `packages/webapp/src/containers/Preferences/General/` — adds the appearance toggle row
- `packages/webapp/package.json` — adds `"theme:check"` script

**Unchanged:**
- All other `.tsx` files.
- All backend code.
- Build configuration.
- CI configuration.
