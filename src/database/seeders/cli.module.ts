import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../../config/typeorm.config';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';
import { CleanCommand } from './clean.command';
import { ExportCommand } from './export.command';
import { SeedCommand } from './seed.command';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: [Category, Video],
    }),
    TypeOrmModule.forFeature([Category, Video]),
  ],
  providers: [SeederService, SeedCommand, ExportCommand, CleanCommand],
})
export class CliModule {}
