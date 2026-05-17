// @ts-nocheck
import React from 'react';
import intl from 'react-intl-universal';

import EstimateFormHeaderFields from './EstimateFormHeaderFields';
import { Group, PageFormBigNumber } from '@/components';
import { useEstimateTotalFormatted } from './utils';
// Estimate form top header.
function EstimateFormHeader() {
  return (
    <Group
      position="apart"
      align={'flex-start'}
      p="25px 32px"
      bg="var(--surface-tier-1)"
      borderBottom="1px solid var(--border-on-tier-1)"
    >
      <EstimateFormHeaderFields />
      <EstimateFormBigTotal />
    </Group>
  );
}

/**
 * Big total of estimate form header.
 * @returns {React.ReactNode}
 */
function EstimateFormBigTotal() {
  const totalFormatted = useEstimateTotalFormatted();

  return (
    <PageFormBigNumber label={intl.get('amount')} amount={totalFormatted} />
  );
}

export default EstimateFormHeader;
