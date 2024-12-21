import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

/**
 * TypeORM configuration object with best practices for NestJS
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false, // Never true in production
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  logging: process.env.NODE_ENV !== 'production',
  maxQueryExecutionTime: 1000, // Log slow queries
  // Connection pool settings
  poolSize: 20,
  // Retry settings
  retryAttempts: 3,
  retryDelay: 3000,
  // Timeouts
  connectTimeoutMS: 10000,
  extra: {
    // Statement timeout
    statement_timeout: 10000,
  },
};

/**
 * TypeORM datasource for CLI commands and migrations
 */
export const dataSource = new DataSource({
  ...typeOrmConfig,
  migrations: ['src/migrations/*{.ts,.js}'],
  entities: ['src/**/*.entity{.ts,.js}'],
} as DataSourceOptions);
