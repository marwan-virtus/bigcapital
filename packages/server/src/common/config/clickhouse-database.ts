import { registerAs } from '@nestjs/config';

export default registerAs('clickhouse', () => ({
  enabled: process.env.CLICKHOUSE_ENABLED === 'true',
  host: process.env.CLICKHOUSE_HOST || 'localhost',
  port: parseInt(process.env.CLICKHOUSE_PORT || '8123', 10),
  user: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'bigcapital_analytics',
}));
