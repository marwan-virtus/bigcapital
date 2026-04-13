// @ts-nocheck
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { flatten, map } from 'lodash';
import { useAuditLogsInfinityQuery } from '@/hooks/query';

function flattenInfinityPagesData(data) {
  return flatten(map(data.pages, (page) => page.data));
}

// Context for Audit Log
const AuditLogContext = React.createContext();

const useAuditLogContext = () => useContext(AuditLogContext);

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

export { AuditLogProvider, useAuditLogContext };
