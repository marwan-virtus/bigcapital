# Theme System — Three-Tier Surface Model with Standardised States and Accent Policy

**Status:** Draft for approval
**Date:** 2026-05-14
**Scope:** `packages/webapp` — extends the existing token system at `packages/webapp/src/style/theme/`
**Builds on:** `docs/superpowers/specs/2026-05-14-theme-improvement-design.md` (the initial VV theme refresh)

## Summary

Define a comprehensive theme system that solves the visual ambiguity exposed by piecemeal token work — most acutely, the sidebar and body rendering as the same shade in dark mode. The system has four pillars:

1. **Three surface tiers** with deliberate elevation contrast (sidebar / body / elevated)
2. **Component-to-tier mapping** — every UI surface in the app maps to exactly one tier
3. **A unified state model** — hover/focus/active/selected/disabled defined once, applied consistently
4. **An accent policy** — explicit rules for where emerald is and isn't used

This sits on top of the existing ~240 semantic tokens. Implementation is **token-tier extension**: add new tier/state/accent tokens, re-map existing semantic tokens to point at them. No JSX changes, no library changes, no infra changes.

## Goals

- Clear visual hierarchy at every screen — sidebar, body, and elevated surfaces (cards, popovers) instantly distinguishable
- Same component-to-tier mapping in light and dark modes (no per-mode special casing)
- One source of truth for each interactive state (hover, focus, active, selected, disabled)
- Emerald used deliberately, never reflexively, so it retains meaning
- Continues to pass `pnpm theme:check` parity audit
- WCAG AA contrast on all surface/text combinations

## Non-goals

- **No library changes.** Blueprint v4 stays.
- **No feature changes.** No new functionality, no removed functionality.
- **No infra changes.** No build steps, CI gates, schema changes, backend work.
- **No JSX/TSX edits** except where wiring new tokens through `DashboardThemeProvider` (none expected).
- **No new visual regression tooling.**
- **No density / spacing changes.** Row heights, paddings, font-sizes stay Blueprint default.

## 1. Surface tier system

Three tiers, identical structure in both modes, opposite contrast direction.

### Tier definitions

```scss
// theme/_tiers.scss (NEW)
:root {
  // Light mode
  --surface-tier-0: var(--vv-slate-900);   // sidebar (#0F172A — brand dark, always)
  --surface-tier-1: var(--vv-slate-100);   // body, drawer body (#F1F5F9 — subtle off-white)
  --surface-tier-2: #FFFFFF;               // elevated (cards, popovers, dialogs)
}

body.bp4-dark {
  --surface-tier-0: var(--vv-slate-950);   // sidebar (#020617 — darkest)
  --surface-tier-1: var(--vv-slate-900);   // body, drawer body (#0F172A)
  --surface-tier-2: var(--vv-slate-800);   // elevated (#1E293B)
}
```

### Border tokens (per tier-pair)

```scss
// Light
:root {
  --border-on-tier-0: rgba(255, 255, 255, 0.06);   // dividers inside sidebar
  --border-on-tier-1: var(--vv-slate-200);         // body section dividers
  --border-on-tier-2: var(--vv-slate-200);         // card / popover outlines
}

// Dark
body.bp4-dark {
  --border-on-tier-0: rgba(255, 255, 255, 0.06);
  --border-on-tier-1: rgba(255, 255, 255, 0.06);
  --border-on-tier-2: rgba(255, 255, 255, 0.08);   // slightly stronger so cards lift
}
```

### Text tokens

```scss
// Light
:root {
  --text-on-tier-0: #FFFFFF;                       // sidebar text always white
  --text-on-tier-0-muted: rgba(255, 255, 255, 0.6);
  --text-on-tier-1: var(--vv-slate-900);           // body text
  --text-on-tier-1-muted: var(--vv-slate-500);
  --text-on-tier-2: var(--vv-slate-900);           // card text matches body
  --text-on-tier-2-muted: var(--vv-slate-500);
}

// Dark
body.bp4-dark {
  --text-on-tier-0: #FFFFFF;
  --text-on-tier-0-muted: rgba(255, 255, 255, 0.6);
  --text-on-tier-1: #F0F0F0;
  --text-on-tier-1-muted: rgba(255, 255, 255, 0.55);
  --text-on-tier-2: #F0F0F0;
  --text-on-tier-2-muted: rgba(255, 255, 255, 0.55);
}
```

## 2. Component-to-tier mapping

### Tier 0 — Brand surface
- Sidebar (`.sidebar`, `.sidebar__scroll-wrapper`)
- Sidebar nav menu (`.sidebar .bp4-menu` — explicitly overrides Blueprint's default menu bg)

### Tier 1 — Working surface
- Main body / `--color-app-body`
- Topbar (`--color-dashboard-topbar-background`)
- Drawer body (the side-sheet content area)
- Preferences inner sidebar (page-level secondary nav, not the global sidebar)
- Bank transactions detail bar
- Splash screen / fallback loading background

### Tier 2 — Elevated surface
- Cards (`.bp4-card`)
- DataTable head row
- Popovers (sidebar flyout, dropdown menus, universal search, `.bp4-popover`)
- Dialogs (`.bp4-dialog`)
- Toast notifications (`.bp4-toast`)
- Tooltips (`.bp4-tooltip`)
- Drawer header (sits slightly elevated above the drawer body)
- Element customize panel

### Inherited (no tier of their own)
- Form inputs — `background: transparent`, render on parent tier
- Table rows — inherit from table's tier
- Buttons except primary intent — transparent
- Section dividers — borders only, no fill

## 3. Interactive state system

### State overlay tokens

```scss
// Light
:root {
  --state-hover-overlay:    rgba(15, 23, 42, 0.04);   // adds darkness on hover
  --state-active-overlay:   rgba(15, 23, 42, 0.08);   // pressed state
  --state-selected-bg:      rgba(34, 197, 94, 0.10);  // emerald tint for active/selected
  --state-selected-fg:      var(--vv-emerald-700);
  --state-focus-ring:       rgba(34, 197, 94, 0.30);
  --state-disabled-opacity: 0.5;
}

// Dark
body.bp4-dark {
  --state-hover-overlay:    rgba(255, 255, 255, 0.06);
  --state-active-overlay:   rgba(255, 255, 255, 0.10);
  --state-selected-bg:      rgba(34, 197, 94, 0.18);
  --state-selected-fg:      var(--vv-emerald-400);
  --state-focus-ring:       rgba(34, 197, 94, 0.30);
  --state-disabled-opacity: 0.4;
}
```

### Application matrix

| Element | Default | Hover | Active/Pressed | Focus (`:focus-visible`) | Disabled |
|---|---|---|---|---|---|
| Button (default) | transparent | + hover-overlay | + active-overlay | 2px focus-ring halo | opacity disabled |
| Button (intent-primary) | emerald fill | darker emerald | darker still | 2px focus-ring halo | opacity disabled |
| Input | tier-2 + 1px border | (no change) | (no change) | 2px emerald ring | opacity disabled |
| Nav item (sidebar) | transparent | + hover-overlay | + active-overlay | 2px focus-ring halo | n/a |
| Nav item (selected) | selected-bg + selected-fg | (no change) | (no change) | (no change) | n/a |
| Table row | transparent | + hover-overlay | n/a | (if selectable: focus-ring) | n/a |
| Card (clickable) | tier-2 | + 1px stronger border | scale(0.99) | + focus-ring | opacity disabled |
| Menu item | transparent | + hover-overlay | + active-overlay | focus = hover | opacity disabled |
| Dropdown trigger | tier-2 | + hover-overlay | + active-overlay | 2px focus-ring halo | opacity disabled |
| Toggle / Switch | tier-2 (off) / emerald (on) | (no change) | n/a | 2px focus-ring halo | opacity disabled |

### Rules

1. **Focus ring on `:focus-visible` only.** Mouse clicks don't show a ring; keyboard `Tab` does. Modern standard.
2. **Focus ring construction:**
   ```css
   box-shadow:
     0 0 0 1px var(--surface-tier-1),  /* gap to the underlying surface */
     0 0 0 3px var(--state-focus-ring);  /* the actual emerald halo */
   ```
3. **Disabled is single-source:** `opacity: var(--state-disabled-opacity); cursor: not-allowed; pointer-events: none;`
4. **Transitions:** `transition: background-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease;` — no transitions on color (instant), max 120ms.

## 4. Accent (emerald) policy

### Emerald appears at

| Context | Element | Value |
|---|---|---|
| Primary intent | Buttons with `intent="primary"` | emerald-500 dark / emerald-700 light |
| Active selection | Sidebar active nav, active tab | `state-selected-bg` + `state-selected-fg` |
| Links | `<a>` outside Blueprint | `--color-primary` (mode-aware) |
| Focus rings | All focusable elements (keyboard) | `--state-focus-ring` |
| Success status | Status pills, alerts | emerald-500/700 + emerald-50 bg |
| Toggle on-state | Switches in "on" position | emerald-500/700 |
| Charts | First data series | `--vv-chart-1` |
| Progress | Stepper completed, progress bars | emerald-500/700 |
| Brand accent | Sidebar org logo | emerald |

### Emerald does NOT appear at

- Body text (kept neutral: slate-900 light, white dark)
- Default / secondary buttons (transparent + border, no emerald)
- Default table cells
- Borders / dividers (neutral slate)
- Hover overlays (neutral translucent — hover is "might click", not affirmative)
- **Positive financial values** (kept neutral; only negatives get red — see below)
- Drop shadows
- Page backgrounds

### Text on emerald (WCAG AA pairs)

| Surface | Text |
|---|---|
| emerald-700 (`#15803D`) — light primary | white (`#FFFFFF`) → 4.7:1 ✅ |
| emerald-500 (`#22C55E`) — dark primary | slate-900 (`#0F172A`) → 9:1 ✅ |
| `state-selected-bg` (10-18% emerald) | emerald-700 (light) / emerald-400 (dark) ✅ |

### Functional colors

| Role | Token | Used for |
|---|---|---|
| Danger | `--vv-color-danger` `#EF4444` | Errors, delete confirmations, **negative financial values** |
| Warning | `--vv-color-warning` `#F59E0B` | Pending states, deadlines, careful banners |
| Info | `--vv-color-info` `#3B82F6` | Informational pills, doc links |
| Neutral muted | `--vv-slate-500` | Labels, captions, metadata |

These never substitute for emerald, and emerald never substitutes for them.

### Financial values rule

- **Positive amounts** (revenue, receivables): kept neutral (slate-900 / white). Avoid over-saturation in dense tables.
- **Negative amounts** (expenses, payables, refunds): danger red.
- **Zero / empty**: muted slate-500.

## 5. Implementation approach — token-tier extension

This spec adds 3 layers of tokens to the existing system:

```
theme/
├── _palette.scss             (existing — VV emerald/slate scales)
├── _typography.scss          (existing — Fira fonts)
├── _radius.scss              (existing — radius scale)
├── _tiers.scss               ← NEW (surface tiers + borders + text)
├── _states.scss              ← NEW (hover/active/selected/focus/disabled overlays)
├── _light-tokens.scss        (existing — semantic tokens, re-mapped to tiers)
├── _dark-tokens.scss         (existing — semantic tokens, re-mapped to tiers)
├── _overrides.scss           (existing — Blueprint Sass + Layer B CSS)
└── theme.scss                (existing — import order, now includes _tiers + _states)
```

### Re-mapping strategy

Every existing `--color-*-background` token gets re-mapped to point at a `--surface-tier-N` token. Every `--color-*-border` to `--border-on-tier-N`. Every text token to `--text-on-tier-N`. Existing token NAMES stay (no JSX changes); only their VALUES change.

Example:
```scss
// Before
--color-card-background: rgba(255, 255, 255, 0.04);
--color-card-border: rgba(255, 255, 255, 0.06);

// After
--color-card-background: var(--surface-tier-2);
--color-card-border: var(--border-on-tier-2);
```

### State token rollout

Every interactive component's hover/active/focus rules in `_overrides.scss` get rewritten to use `--state-*` tokens instead of inline rgba values. Example:

```scss
// Before
.bp4-button:hover { background-color: rgba(255, 255, 255, 0.06); }

// After
.bp4-button:hover { background-color: var(--state-hover-overlay); }
```

### What does not change

- The 240 existing semantic token NAMES — all preserved for backward compat
- Component SCSS files (`Sidebar.scss`, `Dashboard.scss`, etc.) — they still reference `var(--color-*)` exactly as today; the chain ends in tier tokens internally
- `DashboardThemeProvider.tsx` — no change
- `preload-theme.js` — no change

## 6. Acceptance criteria

1. `pnpm theme:check` passes — every semantic token defined in both light and dark modes
2. Three surface tiers visibly distinct on every screen, at both 1100px and 1440px widths
3. Sidebar and body **clearly differentiated** (the original bug is gone)
4. Hover/focus/active states visible on every interactive element in both modes
5. Focus ring shows only on `:focus-visible` (verify by clicking a button — no ring should flash)
6. WCAG AA on every text/surface combination
7. No regression in `pnpm run build` (Sass + Vite both succeed)
8. No JSX/TSX changes outside of token consumption
9. Toast, dialog, tooltip, dropdown all render at Tier 2 (slate-800 dark / white light)
10. Component-tier mapping table (Section 2) verified — every listed component sits at its assigned tier

## 7. Migration path from current state

Current state ends at branch `theme/hardcoded-color-migration` (head `d74e77be7`). The spec implementation lives on `theme/tier-system` (off `theme/hardcoded-color-migration`).

Phase breakdown (estimated):

| Phase | Work | Estimate |
|---|---|---|
| 1 | Create `_tiers.scss` and `_states.scss` with all new tokens | ½ day |
| 2 | Re-map 107 `-background` tokens to tier tokens | ½ day |
| 3 | Re-map `-border` tokens to border-on-tier tokens | ½ day |
| 4 | Re-map `-text` tokens to text-on-tier tokens | ½ day |
| 5 | Refactor `_overrides.scss` Layer B to use `--state-*` tokens for hover/focus/active | 1 day |
| 6 | Visual QA — Tier 1 + Tier 2 screens in both modes, both breakpoints | 1 day |
| 7 | WCAG AA contrast audit | ½ day |
| **Total** |  | **~4.5 days** |

## Appendix A — What changes visually

| Surface | Today (dark) | After (dark) | Today (light) | After (light) |
|---|---|---|---|---|
| Sidebar | slate-900 (= body, blends) | **slate-950** (distinct) | slate-900 (already correct) | slate-900 (unchanged) |
| Body | slate-900 | slate-900 (unchanged) | white | **slate-100** (subtle off-white) |
| Card | `rgba(255,255,255,0.04)` over slate-900 | **slate-800** (solid, lifts) | white | white (unchanged) |
| Datatable head | `rgba(255,255,255,0.04)` | **slate-800** | slate-100 | slate-100 (unchanged) |
| Drawer body | slate-900 | slate-900 (unchanged) | white | **slate-100** |
| Drawer header | transparent | **slate-800** (slight lift) | white | white |
| Dialog | slate-800 | slate-800 (unchanged) | white | white |
| Toast | `#2f343c` (Blueprint default) | **slate-800** (aligned) | Blueprint default | white |
| Tooltip | `#2f343c` | **slate-800** | Blueprint default | white + slate-200 border |
| Sidebar overlay (flyout) | slate-800 | slate-800 (unchanged) | white | white |

## Appendix B — File diff at a glance

**Added:**
- `packages/webapp/src/style/theme/_tiers.scss`
- `packages/webapp/src/style/theme/_states.scss`

**Modified:**
- `packages/webapp/src/style/theme/theme.scss` — imports `_tiers` and `_states`
- `packages/webapp/src/style/theme/_light-tokens.scss` — semantic tokens re-mapped to tiers
- `packages/webapp/src/style/theme/_dark-tokens.scss` — same
- `packages/webapp/src/style/theme/_overrides.scss` — Layer B state styles use `--state-*` tokens

**Unchanged:**
- All component SCSS (`Sidebar.scss`, `Dashboard.scss`, etc.) — token names they reference stay identical
- All TSX/JSX code
- All backend / config
