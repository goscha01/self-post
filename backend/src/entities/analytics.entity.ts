import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Post } from './post.entity';
import { SocialProfile } from './social-profile.entity';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, post => post.id)
  post: Post;

  @ManyToOne(() => SocialProfile, profile => profile.id)
  socialProfile: SocialProfile;

  @Column()
  platform: string;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  sharesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  viewsCount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  engagementRate: number;

  @Column()
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
