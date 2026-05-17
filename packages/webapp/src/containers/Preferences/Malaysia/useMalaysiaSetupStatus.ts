// packages/webapp/src/containers/Preferences/Malaysia/useMalaysiaSetupStatus.ts
import { useMemo, useState, useEffect } from 'react';
import { useCurrentOrganization } from '@/hooks/query/organization';
import { useTaxRates } from '@/hooks/query/taxRates';
import { useAccounts } from '@/hooks/query/accounts';
import type { MalaysiaCardId, CardStatus } from './constants';

const COA_REVIEWED_KEY = 'malaysia-setup-coa-reviewed';

/**
 * Reads the COA-reviewed flag from localStorage with a state hook so the
 * card re-renders when the user clicks "Mark as reviewed".
 */
function useCoaReviewedFlag(): [boolean, () => void] {
  const [reviewed, setReviewed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(COA_REVIEWED_KEY) === 'true';
  });

  const markReviewed = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COA_REVIEWED_KEY, 'true');
    }
    setReviewed(true);
  };

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === COA_REVIEWED_KEY) {
        setReviewed(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [reviewed, markReviewed];
}

export interface MalaysiaSetupStatusItem {
  status: CardStatus;
  /** Action to invoke when the user clicks "Mark as reviewed" on review-toggle cards. */
  markReviewed?: () => void;
}

export type MalaysiaSetupStatuses = Record<MalaysiaCardId, MalaysiaSetupStatusItem>;

/**
 * Returns the live status for each Malaysia setup card by inspecting existing
 * org/data state through standard React Query hooks. No new endpoints.
 *
 * useCurrentOrganization returns { data: { metadata: { base_currency, fiscal_year, tax_number, ... } } }
 * useAccounts returns an array of accounts, each with account_type field ('bank', 'cash', etc.)
 * useTaxRates returns an array of tax rate objects.
 */
export function useMalaysiaSetupStatus(): MalaysiaSetupStatuses {
  const { data: orgData } = useCurrentOrganization(undefined);
  // org.metadata contains: base_currency, fiscal_year, tax_number, name, etc.
  const metadata = (orgData as any)?.metadata ?? orgData ?? null;

  const { data: taxRates } = useTaxRates(undefined);
  // useAccounts(query, props) — pass undefined for both to get all accounts
  const { data: accounts } = useAccounts(undefined, undefined);

  const [coaReviewed, markCoaReviewed] = useCoaReviewedFlag();

  return useMemo<MalaysiaSetupStatuses>(() => {
    const baseCurrencyOk =
      typeof metadata?.base_currency === 'string' &&
      metadata.base_currency.toUpperCase() === 'MYR';
    const fiscalYearOk = !!metadata?.fiscal_year;
    const identifiersOk =
      !!metadata?.registration_number && !!metadata?.tax_number;
    const taxRatesOk = Array.isArray(taxRates) && taxRates.length > 0;
    const bankAccountsOk =
      Array.isArray(accounts) &&
      accounts.some((a: any) => {
        const type = (a?.account_type ?? a?.type ?? '').toString().toLowerCase();
        return type === 'bank' || type === 'cash';
      });
    // Brand settings check — org may not expose this field; treat as optional
    const brandingOk =
      !!(
        (orgData as any)?.brand_settings &&
        Object.keys((orgData as any).brand_settings).length > 0
      ) ||
      !!(metadata?.logo_uri);

    return {
      currency: { status: baseCurrencyOk ? 'configured' : 'needs_attention' },
      fiscal_year: { status: fiscalYearOk ? 'configured' : 'needs_attention' },
      identifiers: { status: identifiersOk ? 'configured' : 'needs_attention' },
      coa: {
        status: coaReviewed ? 'configured' : 'needs_attention',
        markReviewed: markCoaReviewed,
      },
      tax_rates: { status: taxRatesOk ? 'configured' : 'optional' },
      bank: { status: bankAccountsOk ? 'configured' : 'needs_attention' },
      branding: { status: brandingOk ? 'configured' : 'needs_attention' },
    };
  }, [orgData, metadata, taxRates, accounts, coaReviewed, markCoaReviewed]);
}
