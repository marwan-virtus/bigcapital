# Theme system — Tier 1 QA checklist

For each screen below, verify at **1100px and 1440px widths**, in BOTH light and dark modes (toggle via Preferences → General → Appearance).

## Tier verification (do once per screen)
- [ ] **Sidebar (Tier 0)** is clearly darker than body in dark mode (slate-950 vs slate-900); in light mode, sidebar stays dark navy
- [ ] **Body (Tier 1)** reads as the main working surface (slate-900 dark / slate-100 light)
- [ ] **Cards / popovers / dialogs (Tier 2)** clearly lifted from body (slate-800 dark / pure white light)
- [ ] All three tiers feel intentional, not random shades

## Per-screen checks (apply to every screen)
- [ ] No console errors
- [ ] No element renders against same-tier surface without a border (e.g., white card on white body must have a visible border)
- [ ] Hover on interactive elements shows the neutral overlay (white wash on dark / dark wash on light)
- [ ] Focus rings appear ONLY on keyboard Tab, NOT on mouse click
- [ ] Primary buttons are emerald; default buttons are transparent + border
- [ ] Disabled controls reduce opacity to ~40-50%

## Screens
- [ ] Dashboard
- [ ] Accounts Chart
- [ ] Invoice list
- [ ] Invoice detail
- [ ] Invoice create form (verify Tier 2 form footer)
- [ ] Reports viewer (Balance Sheet, P&L)
- [ ] Bank transactions
- [ ] Items list
- [ ] Sidebar navigation (verify Tier 0 darker, active pill emerald)
- [ ] Login / Setup pages (unauth)

## WCAG AA contrast (Phase 7)

Use https://webaim.org/resources/contrastchecker/ or axe DevTools. Test these pairs:

| Pair | Light expected | Dark expected | Light measured | Dark measured |
|---|---|---|---|---|
| `--text-on-tier-1` on `--surface-tier-1` | slate-900 on slate-100 ≥ 14:1 | #F0F0F0 on slate-900 ≥ 13:1 | ? | ? |
| `--text-on-tier-2` on `--surface-tier-2` | slate-900 on white ≥ 17:1 | #F0F0F0 on slate-800 ≥ 11:1 | ? | ? |
| `--text-on-tier-0` on `--surface-tier-0` | white on slate-900 ≥ 17:1 | white on slate-950 ≥ 19:1 | ? | ? |
| `--text-on-tier-1-muted` on `--surface-tier-1` | slate-500 on slate-100 ≥ 4.6:1 | 55%-white on slate-900 ≥ 7:1 | ? | ? |
| Primary button text on emerald-700 (light) | white on `#15803D` ≥ 4.7:1 | n/a | ? | n/a |
| Primary button text on emerald-500 (dark) | n/a | slate-900 on `#22C55E` ≥ 9:1 | n/a | ? |
| `--state-selected-fg` on `--state-selected-bg` | emerald-700 on 10%-emerald over white | emerald-400 on 18%-emerald over slate-900 | ? | ? |

## Notes / regressions
(Add findings below.)
