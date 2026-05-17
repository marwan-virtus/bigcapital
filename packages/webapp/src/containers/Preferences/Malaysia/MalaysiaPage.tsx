// packages/webapp/src/containers/Preferences/Malaysia/MalaysiaPage.tsx
import React, { useEffect } from 'react';
import intl from 'react-intl-universal';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';
import { MalaysiaSetupChecklist } from './MalaysiaSetupChecklist';
import { MalaysiaUsageTips } from './MalaysiaUsageTips';

interface MalaysiaPageProps {
  changePreferencesPageTitle?: (title: string) => void;
}

function MalaysiaPageJSX({ changePreferencesPageTitle }: MalaysiaPageProps) {
  useEffect(() => {
    if (changePreferencesPageTitle) {
      changePreferencesPageTitle(intl.get('preferences.malaysia.title'));
    }
  }, [changePreferencesPageTitle]);

  return (
    <div style={{ padding: 24, maxWidth: 920 }}>
      <p style={{ marginBottom: 24, color: 'var(--color-muted-text, #888)', fontSize: 14, lineHeight: 1.6 }}>
        {intl.get('preferences.malaysia.intro')}
      </p>
      <MalaysiaSetupChecklist />
      <MalaysiaUsageTips />
    </div>
  );
}

export const MalaysiaPage = compose(withDashboardActions)(MalaysiaPageJSX);
export default MalaysiaPage;
