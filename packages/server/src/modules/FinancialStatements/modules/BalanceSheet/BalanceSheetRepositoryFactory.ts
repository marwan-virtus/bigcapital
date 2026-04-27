import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBalanceSheetRepository } from './IBalanceSheetRepository';
import { BalanceSheetRepository } from './BalanceSheetRepository';
import { BalanceSheetClickHouseRepository } from './BalanceSheetClickHouseRepository';

@Injectable()
export class BalanceSheetRepositoryFactory {
  constructor(
    @Inject(BalanceSheetRepository)
    private readonly mysqlRepository: BalanceSheetRepository,
    @Inject(BalanceSheetClickHouseRepository)
    private readonly clickHouseRepository: BalanceSheetClickHouseRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns the appropriate balance sheet repository based on configuration.
   */
  getRepository(): IBalanceSheetRepository {
    const enabled = this.configService.get<boolean>('clickhouse.enabled', false);
    if (enabled) {
      return this.clickHouseRepository;
    }
    return this.mysqlRepository;
  }
}
