// @ts-nocheck
import React from 'react';
import { ProgressBar, Intent } from '@blueprintjs/core';
import * as R from 'ramda';
import { x } from '@xstyled/emotion';
import { css } from '@emotion/css';

import { useJob, useCurrentOrganization } from '@/hooks/query';
import { FormattedMessage as T } from '@/components';

import { withOrganizationActions } from '@/containers/Organization/withOrganizationActions';
import { withCurrentOrganization } from '@/containers/Organization/withCurrentOrganization';
import { withOrganization } from '../Organization/withOrganization';

/**
 * Setup initializing step form.
 */
function SetupInitializingForm({
  setOrganizationSetupCompleted,
  organization,
}) {
  const { refetch, isSuccess } = useCurrentOrganization({ enabled: false });

  // Job done state.
  const [isJobDone, setIsJobDone] = React.useState(false);

  const {
    data: { isRunning, isWaiting, isFailed, isCompleted },
    isFetching: isJobFetching,
  } = useJob(organization?.build_job_id, {
    refetchInterval: 2000,
    enabled: !!organization?.build_job_id,
  });

  React.useEffect(() => {
    if (isCompleted) {
      refetch();
      setIsJobDone(true);
    }
  }, [refetch, isCompleted, setOrganizationSetupCompleted]);

  React.useEffect(() => {
    if (isSuccess && isJobDone) {
      setOrganizationSetupCompleted(true);
      setIsJobDone(false);
    }
  }, [setOrganizationSetupCompleted, isJobDone, isSuccess]);

  return (
    <x.div w="95%" mx="auto" pt="16%">
      {isFailed ? (
        <SetupInitializingFailed />
      ) : isRunning || isWaiting || isJobFetching ? (
        <SetupInitializingRunning />
      ) : isCompleted ? (
        <SetupInitializingCompleted />
      ) : (
        <SetupInitializingFailed />
      )}
    </x.div>
  );
}

export default R.compose(
  withOrganizationActions,
  withCurrentOrganization(({ organizationTenantId }) => ({
    organizationId: organizationTenantId,
  })),
  withOrganization(({ organization }) => ({ organization })),
)(SetupInitializingForm);

/**
 * State initializing failed state.
 */
function SetupInitializingFailed() {
  return (
    <x.div>
      <x.div textAlign="center" mt={35}>
        <x.h1
          fontSize={'22px'}
          fontWeight={500}
          color={'var(--text-on-tier-1)'}
          mt={0}
          mb={'14px'}
        >
          <T id={'setup.initializing.something_went_wrong'} />
        </x.h1>
        <x.p
          w="70%"
          mx="auto"
          color={'var(--text-on-tier-1-muted)'}
        >
          <T id={'setup.initializing.please_refresh_the_page'} />
        </x.p>
      </x.div>
    </x.div>
  );
}

/**
 * Setup initializing running state.
 */
function SetupInitializingRunning() {
  const progressBarStyles = css`
    .bp4-progress-bar {
      border-radius: 40px;
      display: block;
      height: 6px;
      overflow: hidden;
      position: relative;
      width: 80%;
      margin: 0 auto;

      .bp4-progress-meter {
        background-color: var(--vv-slate-400);
      }
    }
  `;

  return (
    <x.div>
      <x.div className={progressBarStyles}>
        <ProgressBar intent={Intent.NONE} value={null} />
      </x.div>

      <x.div textAlign="center" mt={35}>
        <x.h1
          fontSize={'22px'}
          fontWeight={500}
          color={'var(--text-on-tier-1)'}
          mt={0}
          mb={'14px'}
        >
          <T id={'setup.initializing.title'} />
        </x.h1>
        <x.p
          w="70%"
          mx="auto"
          color={'var(--text-on-tier-1-muted)'}
        >
          <T id={'setup.initializing.description'} />
        </x.p>
      </x.div>
    </x.div>
  );
}

/**
 * Setup initializing completed state.
 */
function SetupInitializingCompleted() {
  return (
    <x.div>
      <x.div textAlign="center" mt={35}>
        <x.h1
          fontSize={'22px'}
          fontWeight={600}
          color={'var(--text-on-tier-1)'}
          mt={0}
          mb={'14px'}
        >
          <T id={'setup.initializing.waiting_to_redirect'} />
        </x.h1>
        <x.p
          w="70%"
          mx="auto"
          color={'var(--text-on-tier-1-muted)'}
        >
          <T
            id={'setup.initializing.refresh_the_page_if_redirect_not_worked'}
          />
        </x.p>
      </x.div>
    </x.div>
  );
}
