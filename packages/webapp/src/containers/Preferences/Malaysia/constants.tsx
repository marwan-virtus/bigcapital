// packages/webapp/src/containers/Preferences/Malaysia/constants.tsx
// Per-card metadata for the Malaysia setup page.
// Status detection lives in useMalaysiaSetupStatus.ts.

export type MalaysiaCardId =
  | 'currency'
  | 'fiscal_year'
  | 'identifiers'
  | 'coa'
  | 'tax_rates'
  | 'bank'
  | 'branding';

export interface MalaysiaCardMeta {
  id: MalaysiaCardId;
  titleKey: string;
  bodyKey: string;
  recommendedKey: string;
  targetRoute: string;
  // If true, an extra "Mark as reviewed" button is shown alongside the navigate button.
  // Used for cards where status can't be auto-detected (e.g., COA review).
  hasReviewToggle?: boolean;
  // localStorage key for the reviewed flag (only if hasReviewToggle is true).
  reviewLocalStorageKey?: string;
}

export const MALAYSIA_CARDS: MalaysiaCardMeta[] = [
  {
    id: 'currency',
    titleKey: 'preferences.malaysia.card.currency.title',
    bodyKey: 'preferences.malaysia.card.currency.body',
    recommendedKey: 'preferences.malaysia.card.currency.recommended',
    targetRoute: '/preferences/general',
  },
  {
    id: 'fiscal_year',
    titleKey: 'preferences.malaysia.card.fiscal_year.title',
    bodyKey: 'preferences.malaysia.card.fiscal_year.body',
    recommendedKey: 'preferences.malaysia.card.fiscal_year.recommended',
    targetRoute: '/preferences/general',
  },
  {
    id: 'identifiers',
    titleKey: 'preferences.malaysia.card.identifiers.title',
    bodyKey: 'preferences.malaysia.card.identifiers.body',
    recommendedKey: 'preferences.malaysia.card.identifiers.recommended',
    targetRoute: '/preferences/general',
  },
  {
    id: 'coa',
    titleKey: 'preferences.malaysia.card.coa.title',
    bodyKey: 'preferences.malaysia.card.coa.body',
    recommendedKey: 'preferences.malaysia.card.coa.recommended',
    targetRoute: '/accounts',
    hasReviewToggle: true,
    reviewLocalStorageKey: 'malaysia-setup-coa-reviewed',
  },
  {
    id: 'tax_rates',
    titleKey: 'preferences.malaysia.card.tax_rates.title',
    bodyKey: 'preferences.malaysia.card.tax_rates.body',
    recommendedKey: 'preferences.malaysia.card.tax_rates.recommended',
    targetRoute: '/tax-rates',
  },
  {
    id: 'bank',
    titleKey: 'preferences.malaysia.card.bank.title',
    bodyKey: 'preferences.malaysia.card.bank.body',
    recommendedKey: 'preferences.malaysia.card.bank.recommended',
    targetRoute: '/banking',
  },
  {
    id: 'branding',
    titleKey: 'preferences.malaysia.card.branding.title',
    bodyKey: 'preferences.malaysia.card.branding.body',
    recommendedKey: 'preferences.malaysia.card.branding.recommended',
    targetRoute: '/preferences/branding',
  },
];

export type CardStatus = 'configured' | 'needs_attention' | 'optional';

export const USAGE_TIPS: { titleKey: string; bodyKey: string }[] = [
  {
    titleKey: 'preferences.malaysia.tips.tip1.title',
    bodyKey: 'preferences.malaysia.tips.tip1.body',
  },
  {
    titleKey: 'preferences.malaysia.tips.tip2.title',
    bodyKey: 'preferences.malaysia.tips.tip2.body',
  },
  {
    titleKey: 'preferences.malaysia.tips.tip3.title',
    bodyKey: 'preferences.malaysia.tips.tip3.body',
  },
  {
    titleKey: 'preferences.malaysia.tips.tip4.title',
    bodyKey: 'preferences.malaysia.tips.tip4.body',
  },
  {
    titleKey: 'preferences.malaysia.tips.tip5.title',
    bodyKey: 'preferences.malaysia.tips.tip5.body',
  },
];
