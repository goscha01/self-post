import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { PostSocialMapping } from './post-social-mapping.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.posts)
  user: User;

  @Column({ nullable: true })
  title: string;

  @Column('text')
  content: string;

  @Column('text', { array: true, default: [] })
  mediaUrls: string[];

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: 'draft' })
  status: string;

  @OneToMany(() => PostSocialMapping, mapping => mapping.post)
  socialMappings: PostSocialMapping[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
