import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Video } from '../entities/video.entity';

interface GetVideosParams {
  categoryId?: string;
  channelId?: string;
  uploadDateFrom?: Date;
  uploadDateTo?: Date;
  minLength?: number;
  maxLength?: number;
  search?: string;
  sortBy?: 'uploadDate' | 'title' | 'length';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

@Injectable()
export class VideoRepository extends Repository<Video> {
  constructor(private dataSource: DataSource) {
    super(Video, dataSource.createEntityManager());
  }

  async findByYoutubeId(youtubeId: string): Promise<Video | undefined> {
    return this.findOne({ where: { youtubeId } });
  }

  async getVideos(params: GetVideosParams = {}): Promise<[Video[], number]> {
    const {
      categoryId,
      channelId,
      uploadDateFrom,
      uploadDateTo,
      minLength,
      maxLength,
      search,
      sortBy = 'uploadDate',
      sortOrder = 'DESC',
      page = 1,
      pageSize = 20,
    } = params;

    const query = this.createQueryBuilder('video')
      .leftJoinAndSelect('video.category', 'category')
      .leftJoinAndSelect('video.channel', 'channel');

    this.applyFilters(query, {
      categoryId,
      channelId,
      uploadDateFrom,
      uploadDateTo,
      minLength,
      maxLength,
      search,
    });

    query
      .orderBy(`video.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    return query.getManyAndCount();
  }

  private applyFilters(
    query: SelectQueryBuilder<Video>,
    filters: Partial<GetVideosParams>,
  ): void {
    const {
      categoryId,
      channelId,
      uploadDateFrom,
      uploadDateTo,
      minLength,
      maxLength,
      search,
    } = filters;

    if (categoryId) {
      query.andWhere('video.categoryId = :categoryId', { categoryId });
    }

    if (channelId) {
      query.andWhere('video.channelId = :channelId', { channelId });
    }

    if (uploadDateFrom) {
      query.andWhere('video.uploadDate >= :uploadDateFrom', { uploadDateFrom });
    }

    if (uploadDateTo) {
      query.andWhere('video.uploadDate <= :uploadDateTo', { uploadDateTo });
    }

    if (minLength) {
      query.andWhere('video.length >= :minLength', { minLength });
    }

    if (maxLength) {
      query.andWhere('video.length <= :maxLength', { maxLength });
    }

    if (search) {
      query.andWhere('LOWER(video.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }
  }

  async getRandomVideo(): Promise<Video | null> {
    // First get a random ID
    const randomVideo = await this.createQueryBuilder('video')
      .select('video.id')
      .orderBy('RANDOM()')
      .take(1)
      .getOne();

    if (!randomVideo) {
      return null;
    }

    // Then fetch the complete video with its relations
    return this.findOne({
      where: { id: randomVideo.id },
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
}
