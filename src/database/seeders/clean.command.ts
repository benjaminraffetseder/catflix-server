import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { SeederService } from './seeder.service';

@Injectable()
@Command({
  name: 'clean',
  description: 'Clean the database',
})
export class CleanCommand extends CommandRunner {
  constructor(private readonly seederService: SeederService) {
    super();
  }

  async run(): Promise<void> {
    await this.seederService.clean();
  }
}
