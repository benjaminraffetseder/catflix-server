import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }

  async findByYoutubeChannelId(
    youtubeChannelId: string,
  ): Promise<Channel | null> {
    return this.findOne({ where: { youtubeChannelId } });
  }

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
        'channel.instagramUrl',
        'channel.twitterUrl',
        'channel.facebookUrl',
        'channel.websiteUrl',
        'channel.isActive',
        'channel.lastFetchedAt',
      ])
      .addSelect('COUNT(video.id)', 'videoCount');

    if (params.isActive !== undefined) {
      query.andWhere('channel.isActive = :isActive', {
        isActive: params.isActive,
      });
    }

    query.groupBy('channel.id');

    if (params.page && params.pageSize) {
      query.skip((params.page - 1) * params.pageSize).take(params.pageSize);
    }

    const [channels, total] = await query.getManyAndCount();
    return [channels, total];
  }

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
}
