// packages/webapp/src/containers/Preferences/General/ThemeAppearanceSection.tsx
import React from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import {
  useThemePreference,
  ThemePreference,
} from '@/components/Dashboard/ThemePreferenceContext';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeAppearanceSection() {
  const { preference, setPreference } = useThemePreference();

  return (
    <section style={{ padding: '16px 0', borderTop: '1px solid var(--color-app-shell-divider)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <label
          style={{ minWidth: 160, fontWeight: 500, color: 'var(--color-preferences-topbar-title)' }}
        >
          Appearance
        </label>
        <ButtonGroup>
          {OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              active={preference === opt.value}
              onClick={() => setPreference(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
        <span style={{ color: 'var(--color-muted-text)', fontSize: 12 }}>
          Stored on this device only.
        </span>
      </div>
    </section>
  );
}
