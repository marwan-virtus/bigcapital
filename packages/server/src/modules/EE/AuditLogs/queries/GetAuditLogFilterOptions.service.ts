import { Inject, Injectable } from '@nestjs/common';
import { AuditLog } from '../models/AuditLog.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

export interface AuditLogFilterOption {
  key: string;
  label: string;
}

export interface AuditLogFilterOptions {
  subjects: AuditLogFilterOption[];
  actions: AuditLogFilterOption[];
}

/**
 * Converts a camelCase/PascalCase/snake_case string to a readable label.
 * e.g. "SaleInvoice" → "Sale Invoice", "writtenoff_canceled" → "Writtenoff Canceled"
 */
function toLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

@Injectable()
export class GetAuditLogFilterOptionsService {
  constructor(
    @Inject(AuditLog.name)
    private readonly auditLogModel: TenantModelProxy<typeof AuditLog>,
  ) {}

  async getFilterOptions(): Promise<AuditLogFilterOptions> {
    const subjectRows = await this.auditLogModel()
      .query()
      .select('subject')
      .groupBy('subject')
      .orderBy('subject', 'asc');

    const actionRows = await this.auditLogModel()
      .query()
      .select('action')
      .groupBy('action')
      .orderBy('action', 'asc');

    return {
      subjects: subjectRows
        .map((r) => r.subject)
        .filter(Boolean)
        .map((key) => ({ key, label: toLabel(key) })),
      actions: actionRows
        .map((r) => r.action)
        .filter(Boolean)
        .map((key) => ({ key, label: toLabel(key) })),
    };
  }
}
