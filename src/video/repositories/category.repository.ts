import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async findOrCreate(title: string): Promise<Category> {
    let category = await this.findOne({ where: { title } });

    if (!category) {
      category = this.create({ title });
      await this.save(category);
    }

    return category;
  }

  async getCategoriesWithVideoCount(): Promise<
    Array<{ id: string; title: string; videoCount: number }>
  > {
    return this.createQueryBuilder('category')
      .select('category.id', 'id')
      .addSelect('category.title', 'title')
      .addSelect('COUNT(videos.id)', 'videoCount')
      .leftJoin('category.videos', 'videos')
      .groupBy('category.id')
      .getRawMany();
  }
}
