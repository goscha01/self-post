import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Post } from './post.entity';
import { SocialProfile } from './social-profile.entity';

@Entity('post_social_mappings')
export class PostSocialMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, post => post.socialMappings)
  post: Post;

  @ManyToOne(() => SocialProfile, profile => profile.postMappings)
  socialProfile: SocialProfile;

  @Column({ nullable: true })
  externalPostId: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column('text', { nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
