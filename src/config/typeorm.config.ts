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
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  dropSchema: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  logging: process.env.NODE_ENV !== 'production',
  maxQueryExecutionTime: 1000,
  poolSize: 20,
  retryAttempts: 3,
  retryDelay: 3000,
  connectTimeoutMS: 10000,
  extra: {
    statement_timeout: 10000,
  },
};

/**
 * TypeORM datasource for CLI commands and migrations
 */
export const dataSource = new DataSource({
  ...typeOrmConfig,
  migrations: ['dist/migrations/*.js'],
  entities: ['dist/**/*.entity.js'],
} as DataSourceOptions);
