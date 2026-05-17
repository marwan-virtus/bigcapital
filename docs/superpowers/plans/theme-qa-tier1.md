# Theme refresh — Tier 1 QA checklist

For each screen below, verify in **both modes** (toggle via Preferences → General → Appearance) at **1100px** and **1440px** widths.

## Per-screen checks

For each screen:

- [ ] No console errors
- [ ] No element renders against a white-on-white or dark-on-dark surface (text legible)
- [ ] Primary buttons are emerald in both modes
- [ ] Focus rings on inputs are emerald (soft 2-3px halo), not Blueprint's harsh blue
- [ ] Tables show tabular nums on $ columns (digits align)
- [ ] Sidebar active item is an emerald pill, not a slab
- [ ] Card surfaces have rounded corners (14px) and 1px border
- [ ] Scrollbars are themed in both modes (not white in dark)

## Screens

- [ ] Dashboard
- [ ] Accounts Chart
- [ ] Invoice list
- [ ] Invoice detail
- [ ] Invoice create form
- [ ] Reports viewer (Balance Sheet, P&L)
- [ ] Bank transactions
- [ ] Items list
- [ ] Sidebar navigation (hover, active, sub-items)
- [ ] Login / Setup (unauth pages)

## WCAG AA contrast — log results here

Use https://webaim.org/resources/contrastchecker/ or axe DevTools. Test pairs:

| Pair | Light | Dark |
|---|---|---|
| Body text on `--color-app-body` | ? | ? |
| Primary button text on emerald | ? | ? |
| Sidebar inactive item on slate-900 | ? | ? |
| Sidebar active text on emerald-tint | ? | ? |
| Muted text on body | ? | ? |
| Focus ring vs body bg | ? | ? |

Target: body text ≥ 4.5:1, large/bold text ≥ 3:1, UI controls ≥ 3:1.

## Notes / regressions

(Add findings below.)
