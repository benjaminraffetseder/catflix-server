import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';

/**
 * Repository for managing Channel entities in the database.
 * Extends TypeORM's Repository to provide custom methods for channel-specific operations.
 */
@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }

  /**
   * Finds a channel by its YouTube channel ID.
   * @param youtubeChannelId - The unique identifier of the channel on YouTube
   * @returns Promise resolving to the found Channel entity or null if not found
   */
  async findByYoutubeChannelId(
    youtubeChannelId: string,
  ): Promise<Channel | null> {
    return this.findOne({ where: { youtubeChannelId } });
  }

  /**
   * Retrieves a paginated list of channels with their video counts.
   * @param params - Query parameters for filtering and pagination
   * @param params.page - The page number for pagination (optional)
   * @param params.pageSize - The number of items per page (optional)
   * @param params.isActive - Filter channels by their active status (optional)
   * @returns Promise resolving to a tuple containing the list of channels with video counts and the total count
   */
  async getChannels(params: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
  }) {
    const query = this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.videos', 'video')
      .select([
        'channel.id',
        'channel.name',
        'channel.description',
        'channel.thumbnailUrl',
        'channel.isActive',
        'channel.lastFetchedAt',
      ])
      .addSelect('COUNT(DISTINCT video.id)', 'videoCount')
      .groupBy('channel.id');

    if (params.isActive !== undefined) {
      query.andWhere('channel.isActive = :isActive', {
        isActive: params.isActive,
      });
    }

    if (params.page && params.pageSize) {
      query.skip((params.page - 1) * params.pageSize).take(params.pageSize);
    }

    const [channels, total] = await query.getManyAndCount();

    // Transform the raw results to include videoCount
    const channelsWithCount = await Promise.all(
      channels.map(async (channel) => {
        const { videoCount } = await this.createQueryBuilder('channel')
          .leftJoin('channel.videos', 'video')
          .where('channel.id = :id', { id: channel.id })
          .select('COUNT(DISTINCT video.id)', 'videoCount')
          .getRawOne();

        console.log(`Channel ${channel.id} has ${videoCount} videos`);

        return {
          ...channel,
          videoCount: parseInt(videoCount, 10),
        };
      }),
    );

    return [channelsWithCount, total];
  }

  /**
   * Finds an existing channel by YouTube ID or creates a new one if it doesn't exist.
   * @param youtubeChannelId - The unique identifier of the channel on YouTube
   * @param name - The name of the channel
   * @returns Promise resolving to the found or newly created Channel entity
   */
  async findOrCreate(youtubeChannelId: string, name: string): Promise<Channel> {
    let channel = await this.findByYoutubeChannelId(youtubeChannelId);

    if (!channel) {
      channel = this.create({
        youtubeChannelId,
        name,
      });
      await this.save(channel);
    }

    return channel;
  }

  /**
   * Retrieves a single channel by ID with its video count
   * @param id - The unique identifier of the channel
   * @returns Promise resolving to the channel with video count or null if not found
   */
  async getChannelById(id: string) {
    const query = this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.videos', 'video')
      .select([
        'channel.id',
        'channel.name',
        'channel.description',
        'channel.thumbnailUrl',
        'channel.isActive',
        'channel.lastFetchedAt',
      ])
      .where('channel.id = :id', { id })
      .addSelect('COUNT(DISTINCT video.id)', 'videoCount')
      .groupBy('channel.id');

    const channel = await query.getRawAndEntities();

    if (!channel.entities[0]) {
      return null;
    }

    return {
      ...channel.entities[0],
      videoCount: parseInt(channel.raw[0].videoCount, 10),
    };
  }
}
