import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';

@Injectable()
export class SeederService {
  constructor(private readonly dataSource: DataSource) {}

  private readCsvFile<T>(filename: string): T[] {
    const filePath = path.join(__dirname, 'data', filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as T[];
  }

  async seed() {
    try {
      // Read and create categories
      const categories = this.readCsvFile<Category>('categories.csv');
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values(categories)
        .orIgnore()
        .execute();

      console.log('🌱 Categories seeded');

      // Read and create videos
      const videos = this.readCsvFile<Video>('videos.csv');
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Video)
        .values(videos)
        .orIgnore()
        .execute();

      console.log('🌱 Videos seeded');
      console.log('🌱 Database seeding completed');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clean() {
    try {
      await this.dataSource.query('TRUNCATE TABLE "video" CASCADE');
      await this.dataSource.query('TRUNCATE TABLE "category" CASCADE');
      console.log('🧹 Database cleanup completed');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }
}
