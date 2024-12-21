import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Video } from './entities/video.entity';
import { CategoryRepository } from './repositories/category.repository';
import { VideoRepository } from './repositories/video.repository';
import { YouTubeService } from './services/youtube.service';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Category]), ConfigModule],
  controllers: [VideoController],
  providers: [
    VideoService,
    YouTubeService,
    VideoRepository,
    CategoryRepository,
  ],
  exports: [VideoService],
})
export class VideoModule {}
