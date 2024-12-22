import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from '../video/repositories/category.repository';
import { VideoModule } from '../video/video.module';
import { YouTubeModule } from '../youtube/youtube.module';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';
import { ChannelRepository } from './repositories/channel.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    VideoModule,
    YouTubeModule,
    ConfigModule,
  ],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelRepository, CategoryRepository],
  exports: [ChannelService],
})
export class ChannelModule {}
