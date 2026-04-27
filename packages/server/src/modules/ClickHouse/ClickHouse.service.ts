import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import * as LRUCache from 'lru-cache';
import { ClsService } from 'nestjs-cls';

@Injectable({ scope: Scope.DEFAULT })
export class ClickHouseService {
  private readonly cache: LRUCache<string, ClickHouseClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {
    this.cache = new LRUCache({ max: 100 });
  }

  /**
   * Retrieves or creates a ClickHouse client.
   * If database is not specified, uses the tenant-specific database.
   */
  getClient(database?: string): ClickHouseClient {
    const organizationId = this.cls.get('organizationId');
    const tenantId = organizationId ? String(organizationId) : 'system';
    const dbName = database || this.getTenantDatabaseName(tenantId);
    const cacheKey = `${tenantId}:${dbName}`;
    const cachedClient = this.cache.get(cacheKey);

    if (cachedClient) {
      return cachedClient;
    }

    const host = this.configService.get<string>('clickhouse.host', 'localhost');
    const port = this.configService.get<number>('clickhouse.port', 8123);
    const user = this.configService.get<string>('clickhouse.user', 'default');
    const password = this.configService.get<string>('clickhouse.password', '');

    const client = createClient({
      host: `http://${host}:${port}`,
      username: user,
      password,
      database: dbName,
      request_timeout: 30000,
      max_open_connections: 10,
    });

    this.cache.set(cacheKey, client);
    return client;
  }

  /**
   * Returns the default ClickHouse database name for a tenant.
   */
  getTenantDatabaseName(tenantId: string): string {
    const prefix = this.configService.get<string>(
      'tenantDatabase.dbNamePrefix',
      'bigcapital_tenant_',
    );
    return `${prefix}${tenantId}`;
  }

  /**
   * Executes a query and returns the result.
   * Uses the tenant database by default.
   */
  async query<T = any>(
    query: string,
    params?: Record<string, unknown>,
    database?: string,
  ): Promise<T[]> {
    const client = this.getClient(database);
    const resultSet = await client.query({
      query,
      query_params: params,
      format: 'JSONEachRow',
    });
    return await resultSet.json<T>();
  }

  /**
   * Executes a command (DDL, INSERT, etc.).
   */
  async command(query: string, database?: string): Promise<void> {
    const client = this.getClient(database);
    await client.command({ query });
  }

  /**
   * Inserts data into a table.
   */
  async insert<T = any>(table: string, values: T[], database?: string): Promise<void> {
    const client = this.getClient(database);
    await client.insert({
      table,
      values,
      format: 'JSONEachRow',
    });
  }
}
