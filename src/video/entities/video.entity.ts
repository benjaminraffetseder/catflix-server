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
import { Channel } from '../../channel/entities/channel.entity';
import { Category } from './category.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @ManyToOne(() => Category, (category) => category.videos, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid', nullable: false })
  categoryId: string;

  @ManyToOne(() => Channel, (channel) => channel.videos, { nullable: true })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column({ type: 'uuid', nullable: true })
  channelId: string;

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
