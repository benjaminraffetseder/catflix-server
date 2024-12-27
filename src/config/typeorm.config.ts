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
  synchronize: true,
};

/**
 * TypeORM datasource for CLI commands and migrations
 */
export const dataSource = new DataSource({
  ...typeOrmConfig,
  migrations: ['dist/migrations/*.js'],
  entities: ['dist/**/*.entity.js'],
} as DataSourceOptions);
