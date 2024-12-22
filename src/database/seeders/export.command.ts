import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import { Command, CommandRunner } from 'nest-commander';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';

@Injectable()
@Command({
  name: 'export',
  description: 'Export database data to CSV files for seeding',
})
export class ExportCommand extends CommandRunner {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  private writeCsvFile<T>(filename: string, data: T[]): void {
    const filePath = path.join(__dirname, 'data', filename);
    const csvContent = stringify(data, {
      header: true,
      quoted_string: true,
    });
    fs.writeFileSync(filePath, csvContent);
  }

  async run(): Promise<void> {
    try {
      // Export categories
      const categories = await this.dataSource.getRepository(Category).find({
        order: { title: 'ASC' },
      });

      this.writeCsvFile('categories.csv', categories);
      console.log('📝 Categories exported to CSV');

      // Export videos
      const videos = await this.dataSource.getRepository(Video).find({
        order: { uploadDate: 'DESC' },
        select: [
          'id',
          'title',
          'categoryId',
          'uploadDate',
          'length',
          'youtubeId',
        ],
      });

      this.writeCsvFile('videos.csv', videos);
      console.log('📝 Videos exported to CSV');

      console.log('✅ Database export completed');
    } catch (error) {
      console.error('❌ Database export failed:', error);
      throw error;
    }
  }
}
