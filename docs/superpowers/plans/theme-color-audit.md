# Hardcoded color audit — `packages/webapp`

**Date:** 2026-05-14
**Branch:** `theme/verus-virtus`
**Scope:** Read-only audit. No fixes in this report.

## Summary

| Surface | Files with hardcoded colors | Color references |
|---|---:|---:|
| `src/style/` tree (excl. `theme/` and `_variables.scss`) | **69** | **374** |
| `*.module.scss` in `src/` (containers + components) | **35** | **133** |
| **Total** | **~104** | **~507** |

These references are the reason the new theme doesn't fully cover the app — Phase 1-5 swapped the **token layer** clean, but every hardcoded `#fff`, `#d2dce2`, `#0052cc`, etc. baked into component SCSS is invisible to the token system and stays the same regardless of light/dark mode.

## Top 12 worst offenders (style/ tree)

| Refs | File |
|---:|---|
| 43 | `style/pages/Dashboard/Dashboard.scss` |
| 32 | `style/objects/form.scss` |
| 27 | `style/components/DataTable/DataTableEditable.scss` |
| 17 | `style/containers/Dashboard/Sidebar.scss` |
| 13 | `style/components/Drawers/DrawerTemplate.scss` |
| 12 | `style/pages/Setup/SetupPage.scss` |
| 10 | `style/pages/HomePage/HomePage.scss` |
| 10 | `style/components/DataTable/DataTable.scss` |
|  9 | `style/components/PageForm.scss` |
|  9 | `style/components/DataTable/Pagination.scss` |
|  8 | `style/containers/FinancialStatements/DrawerHeader.scss` |
|  8 | `style/components/Drawers/ManualJournalDrawer.scss` |

Tackle the top ~6 first — they contain over 35% of all hardcoded colors.

## Top 8 worst offenders (`.module.scss` outside `style/`)

| Refs | File |
|---:|---|
| 20 | `containers/PaymentPortal/PaymentPortal.module.scss` |
| 12 | `containers/CashFlow/CategorizeTransactionAside/MatchTransactionCheckbox.module.scss` |
| 11 | `containers/Sales/Invoices/InvoiceCustomize/InvoicePaperTemplate.module.scss` |
|  9 | `components/PricingPlan/PricingPlan.module.scss` |
|  8 | `containers/Subscriptions/BillingSubscription.module.scss` |
|  7 | `containers/Attachments/UploadAttachmentPopoverContent.module.scss` |
|  5 | `containers/Setup/SetupLeftSection.module.scss` |
|  5 | `containers/Import/ImportFileMapping.module.scss` |

## Most recurring hardcoded values

These specific hex values appear repeatedly across files — each is a candidate for a single search-and-replace migration to a semantic token.

| Count | Hex | Suggested replacement | Notes |
|---:|---|---|---|
| 16 | `#d2dce2` | `var(--vv-slate-200)` | Old slate-200-ish border — used in `--color-page-form-header-border`, drawer borders |
| 10 | `#db3737` | `var(--vv-color-danger)` | Blueprint's old danger red — used in form validation borders |
| 9 | `#116cd0` | `var(--color-primary)` | Old Blueprint focus blue — used in form focus rings (already fixed at the Sass-var level but still bare in component CSS) |
| 6 | `rgba(255,255,255,0.2)` | (keep) | Translucent white overlay — mode-agnostic, OK to leave |
| 5 | `#c06361` | `var(--color-red-300)` | Custom red used in error text |
| 5 | `#0052cc` | `var(--color-primary)` | Old primary blue — most visible offender |
| 5 | `#000000` | `var(--vv-slate-900)` or `currentColor` | Black borders in drawer separators (look harsh in dark mode) |
| 4 | `#727983` | `var(--vv-slate-500)` | Old slate-500-ish secondary text |
| 4 | `#666666` | `var(--vv-slate-500)` | Generic gray text |
| 4 | `#1d9bd1` | `var(--vv-color-info)` | Resize handle cyan accent |
| 3 | `#ffffff` | `var(--color-card-background)` | Surface background hardcoded |
| 3 | `#f0f2f8` | `var(--vv-slate-100)` | Editable cell hover background |

## Sample sites (top values)

`#d2dce2` — 16x — borders / separators
```
style/components/PageForm.scss:7        --color-page-form-header-border: #d2dce2;
style/components/Drawers/ExpenseDrawer.scss:67    border-bottom: 1px solid #d2dce2;
style/components/Drawers/ManualJournalDrawer.scss:34    border-bottom: 1px solid #d2dce2;
```

`#0052cc` — 5x — old primary blue (this is what's showing up as "blue" links in dark mode)
```
style/pages/register-organizaton.scss:78  background-color: #0052cc;
style/pages/PaymentMade/PageForm.scss:38  color: #0052cc;
style/pages/Dashboard/Dashboard.scss:551  color: #0052cc;
```

`#116cd0` — 9x — old focus ring color
```
style/objects/form.scss:44   box-shadow: 0 0 0 1px #116cd0;
style/objects/form.scss:45   border-color: #116cd0;
style/objects/form.scss:220  box-shadow: 0 0 0 1px #116cd0;
```

`#000000` — 5x — pure black borders (harsh in dark mode)
```
style/components/Drawers/ExpenseDrawer.scss:55   border-bottom: 1px solid #000000;
style/components/Drawers/ExpenseDrawer.scss:56   border-top: 1px solid #000000;
style/components/Drawers/ManualJournalDrawer.scss:22  border-bottom: 1px solid #000000;
```

## Recommended approach for the follow-up branch

Open a new branch `theme/hardcoded-color-migration` off `theme/verus-virtus` and work through this in **four** roughly equal phases.

### Phase 1 — Bulk safe replacements (1 day)
For values where the semantic mapping is obvious and unambiguous, do a project-wide `sed` replacement, then verify with the dev server:
- `#d2dce2` → `var(--vv-slate-200)`
- `#db3737` → `var(--vv-color-danger)`
- `#0052cc` → `var(--color-primary)`
- `#116cd0` → `var(--color-primary)`
- `#727983` → `var(--vv-slate-500)`
- `#666666` → `var(--vv-slate-500)`

After this, total refs should drop ~50%.

### Phase 2 — Top 6 worst offenders (1-2 days)
File-by-file pass on `Dashboard.scss`, `form.scss`, `DataTableEditable.scss`, `Sidebar.scss`, `DrawerTemplate.scss`, `SetupPage.scss`. These contain heavy custom styling — each needs a careful read to map every literal to the right semantic token (some `#fff` belongs to a card surface, some to text on dark, etc.). Expect token additions for surfaces that don't have a name yet.

### Phase 3 — `.module.scss` files (1-2 days)
Same approach as Phase 2 but on the CSS-modules files. Start with `PaymentPortal.module.scss` (20 refs) and `InvoicePaperTemplate.module.scss` (11 refs).

### Phase 4 — Long tail + final audit (½ day)
Knock out the files with 1-3 refs each (~60 files but ~120 references total). Re-run a grep to confirm only intentional values remain (translucent overlays like `rgba(255,255,255,0.x)`, scrim values, illustration colors).

**Estimated total: 4-6 days.** Comparable in size to the original theme refresh.

### Quality gates per file
For each file touched:
1. Replace literal with the semantic token (or add a new one if none fits).
2. Verify the page renders correctly in BOTH modes.
3. `pnpm theme:check` continues to pass.
4. Commit per file (so a regression on one screen is a small revert, not a 4-day rollback).

## What NOT to migrate

- **SVG fill / xmlns colors inside data: URIs** — these are functional graphics, not theming concerns.
- **Translucent white/black overlays** (`rgba(255, 255, 255, 0.x)`, `rgba(0, 0, 0, 0.x)`) — these stay mode-agnostic.
- **Print stylesheet overrides** — intentionally hardcoded for fidelity in printed documents.
- **Brand-customer assets** (e.g., 3rd-party logos) inside component code.

## Appendix A — full per-file count

See:
- `/tmp/style-tree-counts.txt` — 69 files in the `style/` tree
- `/tmp/module-scss-counts.txt` — 35 `.module.scss` files

(Run the audit script from `git show ...` to regenerate.)

## Appendix B — regeneration script

```bash
cd packages/webapp/src
find style -type f -name "*.scss" ! -path "*/theme/*" \
  ! -name "_variables.scss" ! -name "normalize.scss" -print0 \
| while IFS= read -r -d '' f; do
    count=$(grep -hE "#[0-9a-fA-F]{3,8}\b|rgba?\(" "$f" \
      | grep -vE "^\s*//|data:image/svg|xmlns" | wc -l | tr -d ' ')
    [ "$count" -gt 0 ] && printf "%4d  %s\n" "$count" "$f"
  done | sort -rn
```
