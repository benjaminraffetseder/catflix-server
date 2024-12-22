import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from '../video/repositories/category.repository';
import { VideoRepository } from '../video/repositories/video.repository';
import { YouTubeService } from '../youtube/youtube.service';
import { YOUTUBE_CHANNELS } from './config/channel.config';
import { GetChannelsDto } from './dto/get-channels.dto';
import { ChannelRepository } from './repositories/channel.repository';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private isJobRunning = false;

  constructor(
    @InjectRepository(ChannelRepository)
    private readonly channelRepository: ChannelRepository,
    @InjectRepository(VideoRepository)
    private readonly videoRepository: VideoRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly youtubeService: YouTubeService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'fetchChannelVideos',
    timeZone: 'UTC',
  })
  async fetchAndStoreChannelVideos(): Promise<void> {
    if (this.isJobRunning) {
      this.logger.warn('Previous job still running, skipping...');
      return;
    }

    this.isJobRunning = true;
    try {
      // Check YouTube quota before starting
      const { used, total } = this.youtubeService.getCurrentQuotaUsage();
      if (used >= total * 0.9) {
        this.logger.warn('YouTube quota nearly exhausted, skipping fetch');
        return;
      }

      for (const channelName of YOUTUBE_CHANNELS) {
        try {
          await this.fetchVideosForChannel(channelName);
        } catch (channelError) {
          this.logger.error(
            `Error fetching channel ${channelName}:`,
            channelError,
          );
          continue;
        }
      }

      this.logger.log(
        'Successfully fetched and stored videos for all channels',
      );
    } catch (error) {
      this.logger.error('Critical error in channel video fetch job:', error);
    } finally {
      this.isJobRunning = false;
    }
  }

  private async fetchVideosForChannel(channelName: string): Promise<void> {
    try {
      const channelInfo = await this.youtubeService.getChannelInfo(channelName);
      const channel = await this.channelRepository.findOrCreate(
        channelInfo.id,
        channelInfo.name,
      );

      // Get or create the default category for this channel
      const category = await this.categoryRepository.findOrCreate(
        `Channel: ${channel.name}`,
      );

      // Update channel info
      channel.description = channelInfo.description;
      channel.thumbnailUrl = channelInfo.thumbnailUrl;
      channel.lastFetchedAt = new Date();
      await this.channelRepository.save(channel);

      const videos = await this.youtubeService.getChannelVideos(channelInfo.id);

      for (const video of videos) {
        try {
          const existingVideo = await this.videoRepository.findByYoutubeId(
            video.youtubeId,
          );

          if (existingVideo) {
            await this.videoRepository.save({
              ...existingVideo,
              title: video.title,
              description: video.description,
              uploadDate: video.uploadDate,
              length: video.length,
              channelId: channel.id,
              categoryId: category.id,
            });
          } else {
            const newVideo = this.videoRepository.create({
              title: video.title,
              description: video.description,
              channelId: channel.id,
              categoryId: category.id,
              uploadDate: video.uploadDate,
              length: video.length,
              youtubeId: video.youtubeId,
            });
            await this.videoRepository.save(newVideo);
          }
        } catch (videoError) {
          this.logger.error(
            `Error processing video ${video.youtubeId}:`,
            videoError,
          );
          throw videoError;
        }
      }

      this.logger.log(
        `Successfully fetched videos for channel: ${channelName}`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching videos for channel ${channelName}:`,
        error,
      );
      throw error;
    }
  }

  async getChannels(params: GetChannelsDto) {
    const [channels, total] = await this.channelRepository.getChannels(params);

    return {
      data: channels,
      total,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    };
  }

  async getChannel(id: string) {
    return this.channelRepository.findOne({
      where: { id },
      relations: ['videos'],
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        isActive: true,
        lastFetchedAt: true,
      },
    });
  }

  async triggerFetchAndStore() {
    await this.fetchAndStoreChannelVideos();
    return { message: 'Channel videos fetched and stored successfully.' };
  }
}
