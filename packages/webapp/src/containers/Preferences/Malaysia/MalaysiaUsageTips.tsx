// packages/webapp/src/containers/Preferences/Malaysia/MalaysiaUsageTips.tsx
import React, { useState } from 'react';
import { Card, Collapse, Button } from '@blueprintjs/core';
import intl from 'react-intl-universal';
import { USAGE_TIPS } from './constants';

interface TipItemProps {
  titleKey: string;
  bodyKey: string;
}

function TipItem({ titleKey, bodyKey }: TipItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: 8 }}>
      <Button
        fill
        minimal
        alignText="left"
        rightIcon={isOpen ? 'chevron-up' : 'chevron-down'}
        onClick={() => setIsOpen((v) => !v)}
        style={{ fontWeight: 500 }}
      >
        {intl.get(titleKey)}
      </Button>
      <Collapse isOpen={isOpen}>
        <p style={{ padding: '12px 16px', margin: 0, lineHeight: 1.6, fontSize: 14, whiteSpace: 'pre-line' }}>
          {intl.get(bodyKey)}
        </p>
      </Collapse>
    </div>
  );
}

export function MalaysiaUsageTips() {
  return (
    <Card style={{ marginTop: 32, padding: 20 }}>
      <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
        {intl.get('preferences.malaysia.tips.title')}
      </h3>
      {USAGE_TIPS.map((tip) => (
        <TipItem key={tip.titleKey} titleKey={tip.titleKey} bodyKey={tip.bodyKey} />
      ))}
    </Card>
  );
}
