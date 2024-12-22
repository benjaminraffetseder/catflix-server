import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../../../src/config/typeorm.config';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
    }),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
