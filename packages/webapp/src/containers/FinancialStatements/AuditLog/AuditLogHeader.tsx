// @ts-nocheck
import React, { useMemo } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { Button, Tabs, Tab } from '@blueprintjs/core';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import {
  FormattedMessage as T,
  FFormGroup,
  FInputGroup,
  FSelect,
} from '@/components';
import { useAuditLogFilterOptionsQuery } from '@/hooks/query';
import { saveInvoke, transformToForm } from '@/utils';
import FinancialStatementHeader from '../FinancialStatementHeader';
import { getDefaultAuditLogQuery, getAuditLogQuerySchema } from './common';

const AuditLogDrawerHeader = styled(FinancialStatementHeader)`
  .bp4-drawer {
    max-height: 420px;
  }
`;

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
      byValue.set(s.key, { value: s.key, name: s.label });
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
      byValue.set(a.key, { value: a.key, name: a.label });
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

export default AuditLogHeader;
