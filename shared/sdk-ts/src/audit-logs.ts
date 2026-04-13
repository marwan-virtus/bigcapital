import type { ApiFetcher } from './fetch-utils';
import { paths } from './schema';
import { OpForPath, OpQueryParams, OpResponseBody } from './utils';

export const AUDIT_LOGS_ROUTES = {
  LIST: '/api/audit-logs',
  FILTER_OPTIONS: '/api/audit-logs/filter-options',
} as const satisfies Record<string, keyof paths>;

// --- Types (derived from OpenAPI schema) ---

export type GetAuditLogsQuery = OpQueryParams<OpForPath<typeof AUDIT_LOGS_ROUTES.LIST, 'get'>>;
export type AuditLogListResponse = OpResponseBody<OpForPath<typeof AUDIT_LOGS_ROUTES.LIST, 'get'>>;
export type AuditLogFilterOptionsResponse = OpResponseBody<OpForPath<typeof AUDIT_LOGS_ROUTES.FILTER_OPTIONS, 'get'>>;

// --- Fetchers ---

export async function fetchAuditLogs(
  fetcher: ApiFetcher,
  query?: GetAuditLogsQuery,
): Promise<AuditLogListResponse> {
  const getAuditLogs = fetcher.path(AUDIT_LOGS_ROUTES.LIST).method('get').create();
  const { data } = await getAuditLogs(query ?? {});
  return data;
}

export async function fetchAuditLogFilterOptions(
  fetcher: ApiFetcher,
): Promise<AuditLogFilterOptionsResponse> {
  const getFilterOptions = fetcher.path(AUDIT_LOGS_ROUTES.FILTER_OPTIONS).method('get').create();
  const { data } = await getFilterOptions({});
  return data;
}
