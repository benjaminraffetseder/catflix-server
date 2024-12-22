import { Injectable, Logger } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import { Command, CommandRunner } from 'nest-commander';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Channel } from '../../channel/entities/channel.entity';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';

@Injectable()
@Command({
  name: 'export',
  description: 'Export database data to CSV files for seeding',
})
export class ExportCommand extends CommandRunner {
  private readonly logger = new Logger(ExportCommand.name);

  constructor(private readonly dataSource: DataSource) {
    super();
  }

  private writeCsvFile<T>(filename: string, data: T[]): void {
    const filePath = path.join(process.cwd(), 'data', filename);
    const csvContent = stringify(data, {
      header: true,
      quoted_string: true,
    });

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(filePath, csvContent);
  }

  async run(): Promise<void> {
    try {
      // Export categories
      const categories = await this.dataSource.getRepository(Category).find({
        order: { title: 'ASC' },
      });

      this.writeCsvFile('categories.csv', categories);
      this.logger.log('📝 Categories exported to CSV');

      // Export channels
      const channels = await this.dataSource.getRepository(Channel).find({
        order: { name: 'ASC' },
        select: [
          'id',
          'youtubeChannelId',
          'name',
          'description',
          'thumbnailUrl',
          'isActive',
          'lastFetchedAt',
          'createdAt',
        ],
      });

      this.writeCsvFile('channels.csv', channels);
      this.logger.log('📝 Channels exported to CSV');

      // Export videos
      const videos = await this.dataSource.getRepository(Video).find({
        order: { uploadDate: 'DESC' },
        select: [
          'id',
          'title',
          'description',
          'categoryId',
          'channelId',
          'uploadDate',
          'length',
          'youtubeId',
          'createdAt',
          'updatedAt',
        ],
      });

      this.writeCsvFile('videos.csv', videos);
      this.logger.log('📝 Videos exported to CSV');

      this.logger.log('✅ Database export completed');
    } catch (error) {
      this.logger.error('❌ Database export failed:', error);
      throw error;
    }
  }
}
