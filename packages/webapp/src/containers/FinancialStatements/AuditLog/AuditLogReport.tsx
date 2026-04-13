// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import {
  Button,
  NonIdealState,
  Spinner,
  Classes,
  NavbarGroup,
  NavbarDivider,
  Tabs,
  Tab,
} from '@blueprintjs/core';
import classNames from 'classnames';
import { flatten, map } from 'lodash';
import {
  Card,
  Can,
  DashboardPageContent,
  DashboardActionsBar,
  FormattedMessage as T,
  Icon,
  FinancialSheet,
  ReportDataTable,
  TableFastCell,
  TableVirtualizedListRows,
  FinancialStatement,
  FFormGroup,
  FInputGroup,
  FSelect,
  IntersectionObserver,
} from '@/components';
import { AbilitySubject, AuditLogAction } from '@/constants/abilityOption';
import { useAuditLogsInfinityQuery, useAuditLogFilterOptionsQuery } from '@/hooks/query';
import { TableStyle } from '@/constants';
import styled from 'styled-components';
import FinancialStatementHeader from '../FinancialStatementHeader';
import { Formik, Form } from 'formik';
import { compose, transformToForm, saveInvoke } from '@/utils';
import * as Yup from 'yup';
import { FinancialReportBody } from '../FinancialReportPage';
import FinancialLoadingBar from '../FinancialLoadingBar';

function flattenInfinityPagesData(data) {
  return flatten(map(data.pages, (page) => page.data));
}

// Default query for audit log
const getDefaultAuditLogQuery = () => ({
  subject: '',
  action: '',
  fromDate: '',
  toDate: '',
});

// Validation schema
const getAuditLogQuerySchema = () => {
  return Yup.object().shape({
    fromDate: Yup.date().optional(),
    toDate: Yup.date().min(Yup.ref('fromDate')).optional(),
  });
};

// Parse query from URL
const parseAuditLogQuery = (locationQuery) => {
  const defaultQuery = getDefaultAuditLogQuery();
  return {
    ...defaultQuery,
    ...transformToForm(locationQuery, defaultQuery),
  };
};

// Hook for managing query state
const useAuditLogQuery = () => {
  const [locationQuery, setLocationQuery] = useState({});

  const query = useMemo(
    () => parseAuditLogQuery(locationQuery),
    [locationQuery]
  );

  return { query, setLocationQuery };
};

// Context for Audit Log
const AuditLogContext = React.createContext();

const useAuditLogContext = () => React.useContext(AuditLogContext);

/**
 * Audit Log Provider
 */
function AuditLogProvider({ query, children }) {
  const httpQuery = useMemo(() => {
    return {
      pageSize: 20,
      subject: query.subject || undefined,
      action: query.action || undefined,
      from: query.fromDate || undefined,
      to: query.toDate || undefined,
    };
  }, [query]);

  const {
    data: auditLogsPages,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useAuditLogsInfinityQuery(httpQuery);

  const auditLogs = useMemo(
    () =>
      auditLogsPages
        ? flattenInfinityPagesData(auditLogsPages)
        : [],
    [auditLogsPages],
  );

  const handleObserverInteract = useCallback(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  const provider = {
    auditLogs,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleObserverInteract,
    sheetRefresh: refetch,
    httpQuery,
  };

  return (
    <AuditLogContext.Provider value={provider}>
      {children}
    </AuditLogContext.Provider>
  );
}

/**
 * Audit Log Header - Filter drawer
 */
function AuditLogHeader({ onSubmitFilter, pageFilter, isFilterDrawerOpen, toggleFilterDrawer }) {
  const { data: filterOptions, isLoading: isFilterOptionsLoading } =
    useAuditLogFilterOptionsQuery({
      enabled: isFilterDrawerOpen,
    });

  const subjectSelectItems = useMemo(() => {
    const anyRow = { value: '', name: intl.get('all') };
    const byValue = new Map();
    for (const s of filterOptions.subjects ?? []) {
      byValue.set(s, { value: s, name: s });
    }
    if (pageFilter.subject) {
      const s = pageFilter.subject;
      if (!byValue.has(s)) {
        byValue.set(s, { value: s, name: s });
      }
    }
    const sorted = Array.from(byValue.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return [anyRow, ...sorted];
  }, [filterOptions.subjects, pageFilter.subject]);

  const actionSelectItems = useMemo(() => {
    const anyRow = { value: '', name: intl.get('all') };
    const byValue = new Map();
    for (const a of filterOptions.actions ?? []) {
      byValue.set(a, { value: a, name: a });
    }
    if (pageFilter.action) {
      const act = pageFilter.action;
      if (!byValue.has(act)) {
        byValue.set(act, { value: act, name: act });
      }
    }
    const sorted = Array.from(byValue.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return [anyRow, ...sorted];
  }, [filterOptions.actions, pageFilter.action]);

  const defaultValues = getDefaultAuditLogQuery();

  const initialValues = transformToForm(
    {
      ...defaultValues,
      ...pageFilter,
      fromDate: pageFilter.fromDate ? moment(pageFilter.fromDate).toDate() : '',
      toDate: pageFilter.toDate ? moment(pageFilter.toDate).toDate() : '',
    },
    defaultValues
  );

  const validationSchema = getAuditLogQuerySchema();

  const handleSubmit = (values, { setSubmitting }) => {
    const parsedFilter = {
      ...values,
      fromDate: values.fromDate ? moment(values.fromDate).format('YYYY-MM-DD') : '',
      toDate: values.toDate ? moment(values.toDate).format('YYYY-MM-DD') : '',
    };
    saveInvoke(onSubmitFilter, parsedFilter);
    toggleFilterDrawer(false);
    setSubmitting(false);
  };

  const handleCancelClick = () => {
    toggleFilterDrawer(false);
  };

  const handleDrawerClose = () => {
    toggleFilterDrawer(false);
  };

  return (
    <AuditLogDrawerHeader
      isOpen={isFilterDrawerOpen}
      drawerProps={{ onClose: handleDrawerClose }}
    >
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        <Form>
          <Tabs animate={true} vertical={true} renderActiveTabPanelOnly={true}>
            <Tab
              id="general"
              title={<T id={'general'} />}
              panel={
                <div style={{ maxWidth: '400px' }}>
                  <FFormGroup
                    name="subject"
                    label={intl.get('audit_log.filter_subject')}
                  >
                    <FSelect
                      name="subject"
                      items={subjectSelectItems}
                      valueAccessor="value"
                      textAccessor="name"
                      placeholder={intl.get('all')}
                      popoverProps={{ minimal: true }}
                      disabled={isFilterOptionsLoading}
                      fill
                    />
                  </FFormGroup>
                  <FFormGroup
                    name="action"
                    label={intl.get('audit_log.filter_action')}
                  >
                    <FSelect
                      name="action"
                      items={actionSelectItems}
                      valueAccessor="value"
                      textAccessor="name"
                      placeholder={intl.get('all')}
                      popoverProps={{ minimal: true }}
                      disabled={isFilterOptionsLoading}
                      fill
                    />
                  </FFormGroup>
                  <FFormGroup
                    name="fromDate"
                    label={intl.get('audit_log.filter_from')}
                  >
                    <FInputGroup name="fromDate" type="date" />
                  </FFormGroup>
                  <FFormGroup
                    name="toDate"
                    label={intl.get('audit_log.filter_to')}
                  >
                    <FInputGroup name="toDate" type="date" />
                  </FFormGroup>
                </div>
              }
            />
          </Tabs>

          <div className="financial-header-drawer__footer">
            <Button className={'mr1'} intent="primary" type="submit">
              <T id={'calculate_report'} />
            </Button>
            <Button onClick={handleCancelClick} minimal={true}>
              <T id={'cancel'} />
            </Button>
          </div>
        </Form>
      </Formik>
    </AuditLogDrawerHeader>
  );
}

const AuditLogDrawerHeader = styled(FinancialStatementHeader)`
  .bp4-drawer {
    max-height: 420px;
  }
`;

/**
 * Audit Log Actions Bar
 */
function AuditLogActionsBar({
  isFilterDrawerOpen,
  toggleFilterDrawer,
}) {
  const { sheetRefresh } = useAuditLogContext();

  const handleCustomizeClick = () => {
    toggleFilterDrawer();
  };

  const handleRecalcReport = () => {
    sheetRefresh();
  };

  return (
    <DashboardActionsBar>
      <NavbarGroup>
        <Button
          className={classNames(Classes.MINIMAL)}
          text={"Reload"}
          onClick={handleRecalcReport}
          icon={<Icon icon="refresh-16" iconSize={16} />}
        />
        <NavbarDivider />
        <Button
          className={classNames(Classes.MINIMAL)}
          icon={<Icon icon="cog-16" iconSize={16} />}
          text={"Filter"}
          onClick={handleCustomizeClick}
          active={isFilterDrawerOpen}
        />
      </NavbarGroup>
    </DashboardActionsBar>
  );
}

// Dynamic columns for audit log
const useAuditLogTableColumns = () => {
  return useMemo(
    () => [
      {
        Header: intl.get('audit_log.col_time'),
        accessor: 'created_at_formatted',
        width: 180,
        textOverview: true,
      },
      {
        Header: intl.get('audit_log.col_user'),
        accessor: 'user_name',
        width: 150,
        textOverview: true,
      },
      {
        Header: intl.get('audit_log.col_action'),
        accessor: 'action',
        width: 100,
        textOverview: true,
      },
      {
        Header: intl.get('audit_log.col_subject'),
        accessor: 'subject',
        width: 120,
        textOverview: true,
      },
      {
        Header: intl.get('audit_log.col_summary'),
        accessor: 'summary',
        width: 350,
        textOverview: true,
        Cell: ({ value }) => (
          <div
            style={{
              maxWidth: 330,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={value || ''}
          >
            {value || ''}
          </div>
        ),
      },
      {
        Header: intl.get('audit_log.col_ip'),
        accessor: 'ip',
        width: 120,
        textOverview: true,
        Cell: ({ value }) => value || '—',
      },
    ],
    []
  );
};

/**
 * Audit Log Table
 */
function AuditLogTable() {
  const { auditLogs, isLoading, isFetchingNextPage, handleObserverInteract } = useAuditLogContext();
  const columns = useAuditLogTableColumns();

  return (
    <FinancialSheet
      loading={isLoading}
      fullWidth={true}
      currentDate={false}
    >
      <AuditLogDataTable
        noResults={intl.get('audit_log.empty')}
        columns={columns}
        data={auditLogs}
        virtualizedRows={true}
        fixedItemSize={30}
        fixedSizeHeight={1000}
        sticky={true}
        TableRowsRenderer={TableVirtualizedListRows}
        vListrowHeight={28}
        vListOverscanRowCount={2}
        TableCellRenderer={TableFastCell}
        styleName={TableStyle.Constrant}
      />
      <IntersectionObserver
        onIntersect={handleObserverInteract}
      />
      {isFetchingNextPage && (
        <div style={{ textAlign: 'center', padding: 10 }}>
          <Spinner size={20} />
        </div>
      )}
    </FinancialSheet>
  );
}

const AuditLogDataTable = styled(ReportDataTable)`
  --color-table-text-color: #252a31;
  --color-table-border-color: #ececec;

  .bp4-dark & {
    --color-table-text-color: var(--color-light-gray1);
    --color-table-border-color: var(--color-dark-gray4);
  }

  .tbody {
    .tr .td {
      padding-top: 0.2rem;
      padding-bottom: 0.2rem;
    }
    .tr:not(.no-results) .td:not(:first-of-type) {
      border-left: 1px solid var(--color-table-border-color);
    }
    .tr:last-child .td {
      border-bottom: 1px solid var(--color-table-border-color);
    }
  }
`;

/**
 * Audit Log Loading Bar
 */
function AuditLogLoadingBar() {
  const { isFetching, isFetchingNextPage } = useAuditLogContext();

  if (!isFetching || isFetchingNextPage) return null;
  return (
    <div className={'financial-progressbar'}>
      <FinancialLoadingBar />
    </div>
  );
}

/**
 * Audit Log Body
 */
function AuditLogBody() {
  const { isLoading } = useAuditLogContext();

  return (
    <FinancialReportBody  >
      {isLoading ? (
        <div style={{ padding: 20 }}>
          <Spinner size={24} />
        </div>
      ) : (
        <AuditLogTable />
      )}
    </FinancialReportBody>
  );
}

/**
 * Audit Log Report Content
 */
function AuditLogReportContent() {
  const { query, setLocationQuery } = useAuditLogQuery();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const handleFilterSubmit = useCallback(
    (filter) => {
      setLocationQuery(filter);
    },
    [setLocationQuery]
  );

  const toggleFilterDrawer = useCallback((toggle) => {
    setIsFilterDrawerOpen((prev) =>
      typeof toggle !== 'undefined' ? toggle : !prev
    );
  }, []);

  // Hide filter drawer on unmount
  useEffect(() => {
    return () => setIsFilterDrawerOpen(false);
  }, []);

  return (
    <AuditLogProvider query={query}>
      <AuditLogActionsBar
        isFilterDrawerOpen={isFilterDrawerOpen}
        toggleFilterDrawer={toggleFilterDrawer}
      />

      <DashboardPageContent>
        <FinancialStatement>
          <AuditLogHeader
            pageFilter={query}
            onSubmitFilter={handleFilterSubmit}
            isFilterDrawerOpen={isFilterDrawerOpen}
            toggleFilterDrawer={toggleFilterDrawer}
          />
          <AuditLogLoadingBar />
          <AuditLogBody />
        </FinancialStatement>
      </DashboardPageContent>
    </AuditLogProvider>
  );
}

/**
 * Audit Log Report page (in Financial Reports section).
 */
function AuditLogReport() {
  return (
    <>
      <Can I={AuditLogAction.View} a={AbilitySubject.AuditLog}>
        <AuditLogReportContent />
      </Can>

      <Can not I={AuditLogAction.View} a={AbilitySubject.AuditLog}>
        <DashboardPageContent>
          <Card style={{ padding: 20 }}>
            <NonIdealState title={intl.get('audit_log.no_access')} />
          </Card>
        </DashboardPageContent>
      </Can>
    </>
  );
}

export default AuditLogReport;
