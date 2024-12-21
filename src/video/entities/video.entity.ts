import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @ManyToOne(() => Category, (category) => category.videos, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid', nullable: false })
  categoryId: string;

  @Index()
  @Column({ type: 'date', nullable: false })
  uploadDate: Date;

  @Column({ type: 'integer', nullable: false })
  length: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  youtubeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
