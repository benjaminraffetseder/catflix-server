import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { GetVideosDto } from './dto/get-videos.dto';
import { CategoryRepository } from './repositories/category.repository';
import { VideoRepository } from './repositories/video.repository';
import { YouTubeService } from './services/youtube.service';

const CATEGORIES = [
  {
    title: 'Featured',
    query: 'cats entertainment',
  },
  {
    title: 'Birds',
    query: 'birds for cats to watch',
  },
  {
    title: 'Fish',
    query: 'aquarium for cats',
  },
  {
    title: 'Squirrels',
    query: 'squirrels for cats to watch',
  },
] as const;

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private isJobRunning = false;

  constructor(
    @InjectRepository(VideoRepository)
    private readonly videoRepository: VideoRepository,
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    private readonly youtubeService: YouTubeService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'fetchVideos',
    timeZone: 'UTC',
  })
  async fetchAndStoreVideos(): Promise<void> {
    if (this.isJobRunning) {
      this.logger.warn('Previous job still running, skipping...');
      return;
    }

    this.isJobRunning = true;
    try {
      // Check YouTube quota before starting
      const { used, total } = this.youtubeService.getCurrentQuotaUsage();
      if (used >= total * 0.9) {
        // 90% quota threshold
        this.logger.warn('YouTube quota nearly exhausted, skipping fetch');
        return;
      }

      for (const category of CATEGORIES) {
        try {
          await this.fetchVideosForCategory(category);
        } catch (categoryError) {
          this.logger.error(
            `Error fetching category ${category.title}:`,
            categoryError,
          );
          // Continue with next category instead of failing completely
          continue;
        }
      }

      this.logger.log(
        'Successfully fetched and stored videos for all categories',
      );
    } catch (error) {
      this.logger.error('Critical error in video fetch job:', error);
      // Here you might want to add monitoring/alerting
    } finally {
      this.isJobRunning = false;
    }
  }

  private async fetchVideosForCategory(
    category: (typeof CATEGORIES)[number],
  ): Promise<void> {
    try {
      const savedCategory = await this.categoryRepository.findOrCreate(
        category.title,
      );
      const videos = await this.youtubeService.searchVideos(category.query);

      for (const video of videos) {
        try {
          const existingVideo = await this.videoRepository.findByYoutubeId(
            video.youtubeId,
          );

          if (existingVideo) {
            await this.videoRepository.save({
              ...existingVideo,
              title: video.title,
              uploadDate: video.uploadDate,
              length: video.length,
              categoryId: savedCategory.id,
            });
          } else {
            const newVideo = this.videoRepository.create({
              title: video.title,
              categoryId: savedCategory.id,
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
        `Successfully fetched videos for category: ${category.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching videos for category ${category.title}:`,
        error,
      );
      throw error;
    }
  }

  async getVideos(params: GetVideosDto) {
    const [videos, total] = await this.videoRepository.getVideos({
      ...params,
      uploadDateFrom: params.uploadDateFrom
        ? new Date(params.uploadDateFrom)
        : undefined,
      uploadDateTo: params.uploadDateTo
        ? new Date(params.uploadDateTo)
        : undefined,
    });

    return {
      data: videos,
      total,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    };
  }

  async getVideo(id: string) {
    return this.videoRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async getCategories() {
    return this.categoryRepository.getCategoriesWithVideoCount();
  }

  async triggerFetchAndStore() {
    await this.fetchAndStoreVideos();
    return { message: 'Videos fetched and stored successfully.' };
  }
}
