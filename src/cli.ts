import { CommandFactory } from 'nest-commander';
import { CliModule } from './database/seeders/cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule);
}

bootstrap();
