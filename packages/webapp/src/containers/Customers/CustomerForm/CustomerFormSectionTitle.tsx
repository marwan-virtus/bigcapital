import React from 'react';
import { css } from '@emotion/css';

const customerFormSectionTitleClass = css`
  font-size: 14px;
  color: var(--text-on-tier-1-muted);
  margin-bottom: 18px;
  margin-top: 10px;
`;

export function CustomerFormSectionTitle({ children }: { children: React.ReactNode | string }) {
  return <h4 className={customerFormSectionTitleClass}>{children}</h4>;
}
