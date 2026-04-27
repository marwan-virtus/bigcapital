import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClickHouseService } from './ClickHouse.service';

@Injectable()
export class ClickHouseMigrationService {
  constructor(
    private readonly clickHouse: ClickHouseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Bootstraps MaterializedMySQL replication for a tenant database.
   */
  async bootstrapTenantReplication(tenantDbName: string): Promise<void> {
    const enabled = this.configService.get<boolean>('clickhouse.enabled', false);
    if (!enabled) {
      return;
    }
    const mariadbHost = this.configService.get<string>('tenantDatabase.host', 'mariadb');
    const mariadbPort = this.configService.get<number>('tenantDatabase.port', 3306);
    const mariadbUser = this.configService.get<string>('tenantDatabase.user', 'clickpipes_user');
    const mariadbPassword = this.configService.get<string>('tenantDatabase.password', 'clickpipes_password');

    // MaterializedMySQL requires the database to not exist before creation
    const checkQuery = `SELECT count() FROM system.databases WHERE name = {tenantDb:String}`;
    const exists = await this.clickHouse.query<{ count: number }>(checkQuery, {
      tenantDb: tenantDbName,
    });
    if (exists[0]?.count > 0) {
      return;
    }
    const createQuery = `
      CREATE DATABASE IF NOT EXISTS ${tenantDbName}
      ENGINE = MaterializedMySQL('${mariadbHost}:${mariadbPort}', '${tenantDbName}', '${mariadbUser}', '${mariadbPassword}')
      SETTINGS
        materialized_mysql_tables_list = 'accounts_transactions',
        materialized_mysql_wait_for replication,
        materialized_mysql_snapshot_mode = 'standard'
    `;

    await this.clickHouse.command(createQuery);
  }

  /**
   * Creates pre-aggregated balance tables for a tenant.
   * These tables are populated from MaterializedMySQL replicated data.
   */
  async createPreAggregatedTables(tenantDbName: string): Promise<void> {
    const enabled = this.configService.get<boolean>('clickhouse.enabled', false);
    if (!enabled) {
      return;
    }

    // SummingMergeTree for daily account balances
    const createBalancesTable = `
      CREATE TABLE IF NOT EXISTS ${tenantDbName}.account_balances_daily (
        account_id UInt32,
        date Date,
        credit_sum Decimal(15, 5),
        debit_sum Decimal(15, 5),
        branch_id Nullable(UInt32)
      ) ENGINE = SummingMergeTree()
      ORDER BY (account_id, date, branch_id)
    `;

    await this.clickHouse.command(createBalancesTable);

    // Materialized view to auto-populate from replicated transactions
    const createMv = `
      CREATE MATERIALIZED VIEW IF NOT EXISTS ${tenantDbName}.mv_account_balances_daily
      TO ${tenantDbName}.account_balances_daily
      AS SELECT
        account_id,
        date,
        sum(credit) AS credit_sum,
        sum(debit) AS debit_sum,
        branch_id
      FROM ${tenantDbName}.accounts_transactions
      GROUP BY account_id, date, branch_id
    `;
    await this.clickHouse.command(createMv);
  }
}
