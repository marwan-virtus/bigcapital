// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { Navbar } from '@blueprintjs/core';

/**
 * Form the topbar.
 * @param   {JSX.Element} children
 * @returns {JSX.Element}
 */
export function FormTopbar({ className, children }) {
  return <FormTopBarRoot className={className}>{children}</FormTopBarRoot>;
}

const FormTopBarRoot = styled(Navbar)`
  height: 35px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-on-tier-1);
  background-color: var(--surface-tier-1);
  box-shadow: 0 0 0;

  .bp4-navbar-group {
    height: 35px;
  }
  .bp4-navbar-divider {
    border-left-color: var(--border-on-tier-1);
  }
  .bp4-skeleton {
    max-height: 10px;
  }
  .bp4-button:hover {
    background: var(--state-hover-overlay);
  }
`;

export const DetailsBarSkeletonBase = styled.div`
  letter-spacing: 10px;
  margin-right: 10px;
  margin-left: 10px;
  font-size: 8px;
  width: 140px;
  height: 10px;
`;
