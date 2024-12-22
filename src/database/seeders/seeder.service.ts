import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as csv from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../../video/entities/category.entity';
import { Video } from '../../video/entities/video.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  private readCsvFile<T>(filename: string): T[] {
    const filePath = path.join(process.cwd(), 'data', filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as T[];
  }

  async onApplicationBootstrap() {
    try {
      this.logger.log('Checking database state...');
      await this.seed();
      this.logger.log('Database initialization completed');
    } catch (error) {
      this.logger.error('Failed to initialize database:', error);
      // We don't throw the error to allow the application to start
      // even if seeding fails
    }
  }

  async seed() {
    try {
      // Check if database is empty
      const categoryCount = await this.dataSource
        .getRepository(Category)
        .count();

      if (categoryCount > 0) {
        this.logger.log('Database already contains data, skipping seed');
        return;
      }

      // Read and create categories
      const categories = this.readCsvFile<Category>('categories.csv');
      const now = new Date();
      const categoriesWithTimestamps = categories.map((category) => ({
        ...category,
        createdAt: now,
        updatedAt: now,
      }));

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values(categoriesWithTimestamps)
        .orIgnore()
        .execute();

      this.logger.log('🌱 Categories seeded');

      // Read and create videos
      const videos = this.readCsvFile<Video>('videos.csv');
      const videosWithTimestamps = videos.map((video) => ({
        ...video,
        createdAt: now,
        updatedAt: now,
        uploadDate: new Date(video.uploadDate),
      }));

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Video)
        .values(videosWithTimestamps)
        .orIgnore()
        .execute();

      this.logger.log('🌱 Videos seeded');
      this.logger.log('🌱 Database seeding completed');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clean() {
    try {
      await this.dataSource.query('TRUNCATE TABLE "video" CASCADE');
      await this.dataSource.query('TRUNCATE TABLE "category" CASCADE');
      this.logger.log('🧹 Database cleanup completed');
    } catch (error) {
      this.logger.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }
}
