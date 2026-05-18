# Theme Manifest — bigcapital fork

The single tracking document for every theme-related change in our fork.
Update this whenever you modify a theme file or sweeper rule.

---

## 1. Owned files (full control, no upstream conflict risk)

| File | Purpose |
|---|---|
| `packages/webapp/src/style/theme/_palette.scss` | VV emerald + slate scales — design system colour palette |
| `packages/webapp/src/style/theme/_typography.scss` | Fira Sans / Fira Code — custom font-face declarations |
| `packages/webapp/src/style/theme/_radius.scss` | Radius scale tokens (`--radius-*`) |
| `packages/webapp/src/style/theme/_tiers.scss` | `--surface-tier-0/1/2`, `--border-on-tier-*`, `--text-on-tier-*` |
| `packages/webapp/src/style/theme/_states.scss` | Hover / active / selected / focus / disabled overlay tokens |
| `packages/webapp/src/style/theme/_light-tokens.scss` | ~150 semantic `--color-*` mappings for light mode |
| `packages/webapp/src/style/theme/_dark-tokens.scss` | ~150 semantic `--color-*` mappings for dark mode |
| `packages/webapp/src/style/theme/_overrides.scss` | Blueprint Sass variable overrides + state CSS |
| `packages/webapp/src/style/theme/_surface-sweeper.scss` | Class-pattern catch-all that pins every common surface to a tier token; imported last in `theme.scss` |
| `packages/webapp/src/style/theme/theme.scss` | Import entry point — pulls all partials in dependency order, sweeper last |
| `packages/webapp/public/fonts/FiraCode-Medium.woff2` | Fira Code Medium web font |
| `packages/webapp/public/fonts/FiraCode-Regular.woff2` | Fira Code Regular web font |
| `packages/webapp/public/fonts/FiraSans-Bold.woff2` | Fira Sans Bold web font |
| `packages/webapp/public/fonts/FiraSans-Medium.woff2` | Fira Sans Medium web font |
| `packages/webapp/public/fonts/FiraSans-Regular.woff2` | Fira Sans Regular web font |
| `packages/webapp/public/fonts/FiraSans-SemiBold.woff2` | Fira Sans SemiBold web font |
| `packages/webapp/scripts/theme-parity-check.mjs` | Parity audit script — verifies all tokens exist in both light and dark tokens files |
| `packages/webapp/src/components/Dashboard/ThemePreferenceContext.tsx` | React context providing three-state (light/dark/system) mode preference + persistence |
| `packages/webapp/src/containers/Preferences/General/ThemeAppearanceSection.tsx` | Preferences UI section for toggling appearance mode |

---

## 2. Allowed-touch upstream files

Every upstream file we have modified, with the minimal-edit rationale.
Total: **21 files** (target ≤ 50).

**Category B — CSS Module `.module.scss` files (locally-scoped class names; sweeper cannot reach):**

| File | Diff | Reason kept |
|---|---|---|
| `packages/webapp/src/containers/CashFlow/CategorizeTransactionAside/MatchTransactionCheckbox.module.scss` | 5+/19- | Locally-scoped `--item-background`, `--item-border`, text color vars; replaced with tier tokens + removed dead dark-mode block |
| `packages/webapp/src/containers/CashFlow/CategorizeTransactionAside/MatchingReconcileTransactionAside/MatchingReconcileTransactionForm.module.scss` | 3+/9- | `.asideContent` and `.asideFooter` use locally-scoped `background`; hardcoded `#F6F7F9` replaced with `--surface-tier-1` |
| `packages/webapp/src/containers/Drawers/CustomerDetailsDrawer/CustomerDetailsDrawer.module.scss` | 2+/6- | Local `--x-color-content-primary-border` var; replaced with `--border-on-tier-1`, dead dark-mode block removed |
| `packages/webapp/src/containers/Drawers/PaymentMadeDetailDrawer/PaymentMadeDrawer.module.scss` | 3+/3- | Hardcoded `border-bottom: 1px solid #000` in total lines; replaced with `--border-on-tier-2` |
| `packages/webapp/src/containers/Drawers/PaymentReceiveDetailDrawer/PaymentReceiveDrawer.module.scss` | 2+/3- | Hardcoded `border-bottom: 1px solid #000` in total line; replaced with `--border-on-tier-2` |
| `packages/webapp/src/containers/Drawers/VendorDetailsDrawer/VendorDetailsDrawer.module.scss` | 2+/6- | Local `--x-color-content-primary-border` var; replaced with `--border-on-tier-1`, dead dark-mode block removed |
| `packages/webapp/src/containers/Import/ImportFileMapping.module.scss` | 4+/12- | `.groupTitle` and `thead th` use locally-scoped color; replaced with `--text-on-tier-1-muted` / `--border-on-tier-1`, dead dark-mode blocks removed |
| `packages/webapp/src/containers/Sales/Invoices/InvoiceCustomize/InvoiceCustomizeFields.module.scss` | 3+/3- | `.root { background: #fff }` and footer border; replaced with `--surface-tier-1` / `--border-on-tier-1` |
| `packages/webapp/src/containers/Sales/Invoices/InvoiceCustomize/InvoiceCustomizeGeneralFields.module.scss` | 2+/6- | Duplicate and conflicting local `--color-background` / `--color-divider` vars; simplified to direct tier token usage |
| `packages/webapp/src/containers/Sales/Invoices/InvoiceForm/InvoiceFormHeader.module.scss` | 2+/8- | Local `--color-invoice-form-header-background/border` vars with dark block; collapsed to `--surface-tier-1` / `--border-on-tier-1` |
| `packages/webapp/src/containers/Subscriptions/BillingSubscription.module.scss` | 8+/9- | Multiple hardcoded `#fff`, `#ccd6dd`, `#d2dde1`, text colors; replaced with tier tokens throughout |
| `packages/webapp/src/style/components/BigAmount.module.scss` | 6+/12- | Local `--x-color-amount-text` / `--x-color-label-text` vars with dark block; replaced with `--text-on-tier-1` / `--text-on-tier-1-muted` |
| `packages/webapp/src/style/components/Drawers/BillDrawer.module.scss` | 3+/3- | Hardcoded `border-bottom: 1px/#000` / `3px double #000` in total lines; replaced with `--border-on-tier-2` |
| `packages/webapp/src/style/components/Drawers/EstimateDetails.module.scss` | 1+/6- | Trailing whitespace / newline cleanup only (no functional change) |
| `packages/webapp/src/style/components/Drawers/ReceiptDrawer.module.scss` | 3+/3- | Hardcoded `border-bottom: 1px solid #000` / `3px double #000` in total lines; replaced with `--border-on-tier-2` |
| `packages/webapp/src/style/components/Drawers/VendorCreditDetail.module.scss` | 2+/2- | Hardcoded `border-bottom: 1px solid #000` / `3px double #000` in total lines; replaced with `--border-on-tier-2` |

**Category C — CSS Module `.module.css` files (plain CSS modules; sweeper cannot reach):**

| File | Diff | Reason kept |
|---|---|---|
| `packages/webapp/src/containers/PaymentPortal/PaymentPortal.module.scss` | 2+/5- | Removed `:root` block with `--payment-page-background-color`; reverted to direct `background: #fff`. Public-facing payment portal — always light by design. Comment added to document intent. |

**Category D — TSX files with inline `style={{}}` setting local CSS variables (inline styles win over all CSS):**

| File | Diff | Reason kept |
|---|---|---|
| `packages/webapp/src/containers/Sales/CreditNotes/CreditNoteForm/CreditNoteFormHeader.tsx` | 2+/12- | Removed `useIsDarkMode` conditional + `style={{}}` block; replaced inline `bg` and `borderBottom` props with direct tier token values |
| `packages/webapp/src/containers/Sales/Estimates/EstimateForm/EstimateFormHeader.tsx` | 2+/12- | Same pattern as CreditNote: removed `useIsDarkMode` + `style={{}}` block; replaced with tier tokens |
| `packages/webapp/src/containers/Sales/PaymentsReceived/PaymentReceiveForm/PaymentReceiveFormHeader.tsx` | 2+/12- | Same pattern: removed `useIsDarkMode` + `style={{}}` block; replaced with tier tokens |
| `packages/webapp/src/containers/Sales/Receipts/ReceiptForm/ReceiptFormHeader.tsx` | 2+/12- | Same pattern: removed `useIsDarkMode` + `style={{}}` block; replaced with tier tokens |
| `packages/webapp/src/components/PageForm/PageForm.tsx` | 4+/16- | Shared `<PageForm.Header>` and `<PageForm.FooterActions>` painted form header strip + floating actions bar via emotion css setting local CSS variables (`--color-invoice-form-header-background: #fff` light / `var(--color-dark-gray1)` dark). Replaced with direct `var(--surface-tier-1)` / `var(--border-on-tier-1)`. Drives every Sales/Purchases form header. |
| `packages/webapp/src/components/PageForm/FormTopbar.tsx` | 8+/20- | Top bar above page-form header (`<FormTopbar>` styled-Navbar). Had local CSS variables for bg/border that resolved to `#fff` / `--color-dark-gray1`. Replaced with `var(--surface-tier-1)` / `var(--border-on-tier-1)`. |

---

## 3. Surface sweeper rule inventory

Every rule block in `packages/webapp/src/style/theme/_surface-sweeper.scss`.

| Rule (selector summary) | Target tier / value | Components / surfaces covered |
|---|---|---|
| `:where(.dashboard__insider, .dashboard__topbar, .dashboard__content, .page-form__header, [class*="PageForm"][class*="Header"]:not([class*="Big"]), [class*="FormHeader"]:not(Mail/Receipt/PreviewHeader), .bp4-dialog-body, .bp4-drawer .bp4-drawer-body, .bp4-drawer-footer)` | `--surface-tier-1` | Dashboard shell, page-form header strips, dialog bodies, drawer bodies and footers |
| `:where(.bp4-card, .bp4-popover-content, .bp4-popover2-content, .bp4-popover .bp4-popover-content, .bp4-popover2 .bp4-popover2-content, .bp4-dialog, .bp4-toast, .bp4-tooltip .bp4-popover2-content, .bp4-tooltip .bp4-popover-content, .bp4-html-select select, .bp4-numeric-input .bp4-input-group, .bp4-tabs > .bp4-tab-list, .page-form__footer, .page-form__floating-actions, [class*="FloatingActions"], [class*="Paper"]:not(PaperPreview/PaperTemplate/MailPaper))` | `--surface-tier-2` | Cards, popovers, dialogs, toasts, tooltips, select controls, tab lists, page-form footer / floating actions, non-mail paper containers |
| `.sidebar .bp4-menu, body.bp4-dark .sidebar .bp4-menu` | `transparent` | Sidebar nav menu — inherits Tier 0 sidebar background instead of Tier 2 |
| `:where(.page-form__header, [class*="FormHeader"]:not(Mail/Receipt/PreviewHeader))` | `border-bottom: 1px solid --border-on-tier-1` | Bottom divider on form header strip |
| `:where(.bp4-card, .bp4-dialog, [class*="Paper"]:not(PaperPreview/PaperTemplate/MailPaper))` | `border: 1px solid --border-on-tier-2` | Full border ring on cards, dialogs, non-mail Paper surfaces |
| `body .bp4-input, body .bp4-text-area, body .bp4-tag-input, body .bp4-input-group .bp4-input, body.bp4-dark [same]` | `transparent` | All Blueprint inline text controls — transparent so they inherit the parent tier background |
| `:where(.bp4-html-table, .DataTable) thead, :where(.bp4-html-table, .DataTable) .table-thead` | `--surface-tier-2` | Table header row on both Blueprint HTML tables and legacy DataTable |
| `:where(.bp4-html-table, .DataTable) tbody tr, :where(.bp4-html-table, .DataTable) .table-tbody .tr` | `transparent` | Table body rows — transparent to let parent tier show through |
| `:where(.datatable-editor) .table` | `--surface-tier-2` | Editable entries datatable in Bills / Invoices / Estimates forms |
| `body.bp4-dark .bp4-tag:not(.bp4-intent-*)` | `rgba(255,255,255,0.08)` bg + `--text-on-tier-1` | Neutral tag pills in dark mode |
| `body.bp4-dark .bp4-control .bp4-control-indicator` | `--surface-tier-2` | Checkbox and radio indicator box in dark mode |

**Total rule blocks: 11** (across ~111 lines)

---

## 4. Known leaks deliberately not drained

Intentionally left as hardcoded light values — not bugs.

| File | Reason |
|---|---|
| `containers/Sales/Invoices/InvoiceCustomize/InvoicePaperTemplate.module.scss` | Paper invoice template — printed / exported output, always white |
| `containers/PaymentPortal/PaymentPortal.module.scss` | Public-facing payment portal — always light by design (see comment in file) |
| `containers/Setup/WorkflowIcon.tsx` (and similar SVG illustrations) | Decorative SVG fills — mode-agnostic brand illustrations |
| All Mail Receipt / Mail Drawer template files | Email preview pane — always light to match email client rendering |
| `containers/Setup/SetupLeftSection.module.scss` (translucent overlays only) | Mode-agnostic by design; translucent overlays work in both modes |
| `containers/Authentication/_components.tsx` | Auth / landing pages — intentionally always light |
| `containers/PaymentMethods/StripePaymentMethod.tsx` | Stripe brand mark — must stay on white per Stripe brand guidelines |

---

## 5. Upstream merge procedure

```bash
# 1. Pull
git fetch upstream
git checkout develop
git merge upstream/develop          # accept any new upstream code

# 2. Switch back to feature branch
git checkout theme/tier-system
git merge develop                   # may produce conflicts on Section 2 files

# 3. Resolve conflicts
git status                          # list conflicting files
# For each conflict:
#   - if file is in Section 2 above  → re-apply our minimal edit
#     (use `git log --all --oneline -- <file>` to find our original commit)
#   - if file is NOT in Section 2    → take upstream version
#     (our sweeper covers theme; no manual re-edit needed)

# 4. Verify
pnpm --filter @bigcapital/webapp theme:check
pnpm --filter @bigcapital/webapp run build
# Visual QA: /bills/new, /credit-notes/new, /invoices/new in both modes
```

---

## 6. Audit baseline (as of cleanup completion)

| Source | Count | Notes |
|---|---:|---|
| Owned theme SCSS files (`theme/*.scss`) | 10 | Source of truth for all design tokens + sweeper |
| Owned font files (`public/fonts/*.woff2`) | 6 | Fira Sans + Fira Code |
| Owned scripts (`scripts/`) | 1 | `theme-parity-check.mjs` |
| Owned TSX files (new) | 2 | `ThemePreferenceContext.tsx`, `ThemeAppearanceSection.tsx` |
| **Owned total** | **19** | No upstream conflict risk |
| Allowed-touch upstream files | 21 | Minimal surgical edits; all ≤ 20 diff lines |
| Surface sweeper rule blocks | 11 | All surfaces in `_surface-sweeper.scss` |
| Parity tokens verified | 240 | Both modes aligned (`theme:check`) |
