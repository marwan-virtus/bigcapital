import { css } from '@emotion/css';
import { Tabs } from '@blueprintjs/core';

interface SendMailViewPreviewTabsProps {
  children: React.ReactNode;
}

export function SendMailViewPreviewTabs({
  children,
}: SendMailViewPreviewTabsProps) {
  return (
    <Tabs
      id={'preview'}
      defaultSelectedTabId={'payment-page'}
      className={css`
        --x-color-background: var(--surface-tier-1);
        --x-color-border: var(--border-on-tier-1);
        --x-color-tab-text: var(--text-on-tier-1-muted);
        overflow: hidden;
        flex: 1 1;
        display: flex;
        flex-direction: column;

        .bp4-tab-list {
          padding: 0 20px;
          background: var(--x-color-background);
          border-bottom: 1px solid var(--x-color-border);
        }
        .bp4-tab {
          line-height: 40px;
        }
        .bp4-tab:not([aria-selected='true']) {
          color: var(--x-color-tab-text);
        }
        .bp4-tab-indicator-wrapper .bp4-tab-indicator {
          height: 2px;
        }
        .bp4-tab-panel {
          margin: 0;
          overflow: auto;
        }
      `}
    >
      {children}
    </Tabs>
  );
}
