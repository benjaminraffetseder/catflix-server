import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { SeederService } from './seeder.service';

@Injectable()
@Command({
  name: 'seed',
  description: 'Seed the database with initial data',
})
export class SeedCommand extends CommandRunner {
  constructor(private readonly seederService: SeederService) {
    super();
  }

  async run(): Promise<void> {
    await this.seederService.seed();
  }
}
