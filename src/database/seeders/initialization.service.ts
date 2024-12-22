import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Injectable()
export class InitializationService implements OnModuleInit {
  private readonly logger = new Logger(InitializationService.name);

  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    try {
      const needsSeeding = await this.seederService.needsSeeding();

      if (needsSeeding) {
        this.logger.log('Database is empty, starting seeding process...');
        await this.seederService.seed();
        this.logger.log('Database seeding completed successfully');
      } else {
        this.logger.log('Database already contains data, skipping seeding');
      }
    } catch (error) {
      this.logger.error('Error during database initialization:', error);
    }
  }
}
