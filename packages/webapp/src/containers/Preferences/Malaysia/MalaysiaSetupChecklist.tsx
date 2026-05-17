// packages/webapp/src/containers/Preferences/Malaysia/MalaysiaSetupChecklist.tsx
import React from 'react';
import { MALAYSIA_CARDS } from './constants';
import { useMalaysiaSetupStatus } from './useMalaysiaSetupStatus';
import { MalaysiaSetupCard } from './MalaysiaSetupCard';

export function MalaysiaSetupChecklist() {
  const statuses = useMalaysiaSetupStatus();

  return (
    <div>
      {MALAYSIA_CARDS.map((card) => {
        const s = statuses[card.id];
        return (
          <MalaysiaSetupCard
            key={card.id}
            meta={card}
            status={s.status}
            markReviewed={s.markReviewed}
          />
        );
      })}
    </div>
  );
}
