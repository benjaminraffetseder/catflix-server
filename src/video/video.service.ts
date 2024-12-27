import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { YouTubeService } from '../youtube/youtube.service';
import { GetVideosDto } from './dto/get-videos.dto';
import { CategoryRepository } from './repositories/category.repository';
import { VideoRepository } from './repositories/video.repository';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectRepository(VideoRepository)
    private readonly videoRepository: VideoRepository,
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    private readonly youtubeService: YouTubeService,
  ) {}

  async fetchAndStoreVideos(
    query: string,
    categoryTitle: string,
  ): Promise<void> {
    try {
      const savedCategory =
        await this.categoryRepository.findOrCreate(categoryTitle);
      const videos = await this.youtubeService.searchVideos(query);

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
              categoryId: savedCategory.id,
            });
          } else {
            const newVideo = this.videoRepository.create({
              title: video.title,
              description: video.description,
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
        `Successfully fetched videos for category: ${categoryTitle}`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching videos for category ${categoryTitle}:`,
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
      relations: ['category', 'channel'],
      select: {
        id: true,
        title: true,
        description: true,
        uploadDate: true,
        length: true,
        category: { id: true, title: true },
        youtubeId: true,
        channel: { id: true, name: true },
      },
    });
  }

  async getCategories() {
    return this.categoryRepository.getCategoriesWithVideoCount();
  }

  async getRandomVideo() {
    return this.videoRepository.getRandomVideo();
  }
}
