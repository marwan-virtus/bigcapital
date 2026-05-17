// packages/webapp/src/containers/Preferences/Malaysia/MalaysiaSetupCard.tsx
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Card, Button, Tag, Intent } from '@blueprintjs/core';
import intl from 'react-intl-universal';
import type { MalaysiaCardMeta, CardStatus } from './constants';

interface MalaysiaSetupCardProps {
  meta: MalaysiaCardMeta;
  status: CardStatus;
  markReviewed?: () => void;
}

function getStatusIntent(status: CardStatus): Intent {
  switch (status) {
    case 'configured':
      return Intent.SUCCESS;
    case 'needs_attention':
      return Intent.WARNING;
    case 'optional':
    default:
      return Intent.NONE;
  }
}

function getStatusLabel(status: CardStatus): string {
  switch (status) {
    case 'configured':
      return intl.get('preferences.malaysia.status.configured');
    case 'needs_attention':
      return intl.get('preferences.malaysia.status.needs_attention');
    case 'optional':
    default:
      return intl.get('preferences.malaysia.status.optional');
  }
}

export function MalaysiaSetupCard({ meta, status, markReviewed }: MalaysiaSetupCardProps) {
  const history = useHistory();

  return (
    <Card style={{ marginBottom: 16, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          {intl.get(meta.titleKey)}
        </h3>
        <Tag intent={getStatusIntent(status)} minimal>
          {getStatusLabel(status)}
        </Tag>
      </div>
      <p style={{ marginBottom: 12, lineHeight: 1.55, fontSize: 14 }}>
        {intl.get(meta.bodyKey)}
      </p>
      <p style={{ marginBottom: 16, fontSize: 13, fontStyle: 'italic', color: 'var(--color-muted-text, #888)' }}>
        <strong>Recommended:</strong> {intl.get(meta.recommendedKey)}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          intent={Intent.PRIMARY}
          onClick={() => history.push(meta.targetRoute)}
        >
          {intl.get('preferences.malaysia.action.go_to_setting')}
        </Button>
        {meta.hasReviewToggle && status !== 'configured' && markReviewed && (
          <Button minimal onClick={markReviewed}>
            {intl.get('preferences.malaysia.action.mark_reviewed')}
          </Button>
        )}
      </div>
    </Card>
  );
}
