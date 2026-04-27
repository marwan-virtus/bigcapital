import { Global, Module } from '@nestjs/common';
import { ClickHouseService } from './ClickHouse.service';
import { ClickHouseMigrationService } from './ClickHouseMigration.service';

@Global()
@Module({
  providers: [ClickHouseService, ClickHouseMigrationService],
  exports: [ClickHouseService, ClickHouseMigrationService],
})
export class ClickHouseModule {}
