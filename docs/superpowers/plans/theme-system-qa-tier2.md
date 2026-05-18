# Theme system — Tier 2 QA checklist

Same verification template as Tier 1, focused on **elevated surfaces** (Tier 2) — drawers, dialogs, popovers, toasts.

## Surfaces / interactions to verify
- [ ] Open **Customer detail drawer** → drawer body is Tier 1 (slate-900 dark / slate-100 light), drawer header is Tier 2 (slate-800 dark / white light, slightly elevated)
- [ ] Open **Vendor detail drawer**
- [ ] Open **Payment Made drawer**
- [ ] Open **Bill drawer**
- [ ] Open **Invoice send mail drawer**
- [ ] Open any **dialog** (e.g., delete-confirm) → Tier 2 surface, no Blueprint `#2f343c` leak in dark
- [ ] **Trigger a toast** (save a form successfully) → Tier 2 surface with consistent border
- [ ] **Hover any tooltip target** → Tier 2 surface in both modes
- [ ] **Open universal search** (Cmd/Ctrl+K) → Tier 2 popover, clearly distinct from body
- [ ] **Open sidebar flyout** (hover a nav item with sub-items) → Tier 2 popover, opaque (no leak-through)
- [ ] **Open a Blueprint dropdown / select menu** → Tier 2 popover
- [ ] **Open the user avatar menu** (top-right) → Tier 2 popover

## Focus-visible behaviour
- [ ] **Click any primary button with mouse** → activates, NO emerald ring around it
- [ ] **Press Tab repeatedly** → each focusable element gets an emerald ring as focus moves
- [ ] **Click an input → type → Tab away** → no ring on the input during click-focus; ring appears on the next element when Tab moves

## Notes / regressions
