import { css } from '@emotion/css';

const vendorFormSectionTitleClass = css`
  font-size: 14px;
  color: var(--text-on-tier-1-muted);
  margin-bottom: 18px;
  margin-top: 10px;
`;

export function VendorFormSectionTitle({ children }: { children: React.ReactNode | string }) {
  return <h4 className={vendorFormSectionTitleClass}>{children}</h4>;
}
