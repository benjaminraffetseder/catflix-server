import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../../channel/entities/channel.entity';
import { typeOrmConfig } from '../../config/typeorm.config';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: [Category, Video, Channel],
    }),
    TypeOrmModule.forFeature([Category, Video, Channel]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
