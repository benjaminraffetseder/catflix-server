import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YouTubeModule } from '../youtube/youtube.module';
import { Category } from './entities/category.entity';
import { Video } from './entities/video.entity';
import { CategoryRepository } from './repositories/category.repository';
import { VideoRepository } from './repositories/video.repository';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, Category]),
    ConfigModule,
    YouTubeModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository, CategoryRepository],
  exports: [VideoService, VideoRepository],
})
export class VideoModule {}
