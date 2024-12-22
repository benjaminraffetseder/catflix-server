import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Channel } from '../../channel/entities/channel.entity';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    try {
      await this.seedCategories();
      await this.seedChannels();
      await this.seedVideos();
      this.logger.log('Seeding completed successfully');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    }
  }

  async clean() {
    try {
      await this.dataSource.query(
        'TRUNCATE TABLE video, category, channel RESTART IDENTITY CASCADE',
      );
      this.logger.log('Database cleaned successfully');
    } catch (error) {
      this.logger.error('Error during cleaning:', error);
      throw error;
    }
  }

  async export() {
    try {
      this.logger.log('Starting data export...');

      const categories = await this.dataSource
        .getRepository(Category)
        .find({ order: { createdAt: 'ASC' } });
      this.logger.log(`Found ${categories.length} categories to export`);

      const channels = await this.dataSource
        .getRepository(Channel)
        .find({ order: { createdAt: 'ASC' } });
      this.logger.log(`Found ${channels.length} channels to export`);

      const videos = await this.dataSource
        .getRepository(Video)
        .find({ order: { createdAt: 'ASC' } });
      this.logger.log(`Found ${videos.length} videos to export`);

      const dataDir = path.join(process.cwd(), 'data');
      this.logger.log(`Ensuring data directory exists at: ${dataDir}`);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
        this.logger.log('Created data directory');
      }

      if (categories.length > 0) {
        const categoriesPath = path.join(dataDir, 'categories.csv');
        fs.writeFileSync(
          categoriesPath,
          'id,title,createdAt,updatedAt\n' +
            categories
              .map(
                (c) =>
                  `${c.id},${c.title},${c.createdAt.toISOString()},${c.updatedAt.toISOString()}`,
              )
              .join('\n'),
        );
        this.logger.log(`Categories exported to: ${categoriesPath}`);
      }

      if (channels.length > 0) {
        const channelsPath = path.join(dataDir, 'channels.csv');
        fs.writeFileSync(
          channelsPath,
          'id,youtubeChannelId,name,description,thumbnailUrl,instagramUrl,twitterUrl,facebookUrl,websiteUrl,isActive,lastFetchedAt,createdAt\n' +
            channels
              .map(
                (c) =>
                  `${c.id},${c.youtubeChannelId},${c.name},${c.description || ''},${
                    c.thumbnailUrl || ''
                  },${c.isActive},${c.lastFetchedAt.toISOString()},${c.createdAt.toISOString()}`,
              )
              .join('\n'),
        );
        this.logger.log(`Channels exported to: ${channelsPath}`);
      }

      if (videos.length > 0) {
        const videosPath = path.join(dataDir, 'videos.csv');
        fs.writeFileSync(
          videosPath,
          'id,title,description,categoryId,channelId,uploadDate,length,youtubeId,createdAt,updatedAt\n' +
            videos
              .map(
                (v) =>
                  `${v.id},${v.title},${v.description || ''},${v.categoryId},${
                    v.channelId || ''
                  },${v.uploadDate.toISOString()},${v.length},${
                    v.youtubeId
                  },${v.createdAt.toISOString()},${v.updatedAt.toISOString()}`,
              )
              .join('\n'),
        );
        this.logger.log(`Videos exported to: ${videosPath}`);
      }

      this.logger.log('Data export completed successfully');
    } catch (error) {
      this.logger.error('Error during export:', error.stack);
      throw error;
    }
  }

  private async seedCategories() {
    const categoriesFile = path.join(process.cwd(), 'data', 'categories.csv');
    if (!fs.existsSync(categoriesFile)) {
      this.logger.warn(
        'No categories.csv file found, skipping categories seed',
      );
      return;
    }

    const content = fs.readFileSync(categoriesFile, { encoding: 'utf-8' });
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      quote: '"',
      ltrim: true,
      rtrim: true,
    });

    for (const record of records) {
      const category = this.dataSource.getRepository(Category).create({
        id: record.id,
        title: record.title,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      });
      await this.dataSource.getRepository(Category).save(category);
    }

    this.logger.log('Categories seeded successfully');
  }

  private async seedChannels() {
    const channelsFile = path.join(process.cwd(), 'data', 'channels.csv');
    if (!fs.existsSync(channelsFile)) {
      this.logger.warn('No channels.csv file found, skipping channels seed');
      return;
    }

    const content = fs.readFileSync(channelsFile, { encoding: 'utf-8' });
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      quote: '"',
      ltrim: true,
      rtrim: true,
    });

    for (const record of records) {
      const channel = this.dataSource.getRepository(Channel).create({
        id: record.id,
        youtubeChannelId: record.youtubeChannelId,
        name: record.name,
        description: record.description,
        thumbnailUrl: record.thumbnailUrl,
        isActive: record.isActive === 'true',
        lastFetchedAt: new Date(record.lastFetchedAt),
        createdAt: new Date(record.createdAt),
      });
      await this.dataSource.getRepository(Channel).save(channel);
    }

    this.logger.log('Channels seeded successfully');
  }

  private async seedVideos() {
    const videosFile = path.join(process.cwd(), 'data', 'videos.csv');
    if (!fs.existsSync(videosFile)) {
      this.logger.warn('No videos.csv file found, skipping videos seed');
      return;
    }

    const content = fs.readFileSync(videosFile, { encoding: 'utf-8' });
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      quote: '"',
      ltrim: true,
      rtrim: true,
    });

    for (const record of records) {
      const video = this.dataSource.getRepository(Video).create({
        id: record.id,
        title: record.title,
        description: record.description,
        categoryId: record.categoryId,
        channelId: record.channelId || null,
        uploadDate: new Date(record.uploadDate),
        length: parseInt(record.length),
        youtubeId: record.youtubeId,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      });
      await this.dataSource.getRepository(Video).save(video);
    }

    this.logger.log('Videos seeded successfully');
  }
}
