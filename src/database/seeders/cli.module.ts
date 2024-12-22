import { Module } from '@nestjs/common';
import { CleanCommand } from './clean.command';
import { ExportCommand } from './export.command';
import { SeedCommand } from './seed.command';
import { SeederModule } from './seeder.module';

@Module({
  imports: [SeederModule],
  providers: [SeedCommand, ExportCommand, CleanCommand],
})
export class CliModule {}
