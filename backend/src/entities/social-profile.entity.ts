import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PostSocialMapping } from './post-social-mapping.entity';

@Entity('social_profiles')
export class SocialProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.socialProfiles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  platform: string;

  @Column({ name: 'platform_user_id' })
  platformUserId: string;

  @Column({ name: 'access_token' })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'token_expires_at', type: 'timestamp', nullable: true })
  tokenExpiresAt: Date | null;

  @Column({ name: 'profile_data', type: 'jsonb', nullable: true })
  profileData: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => PostSocialMapping, mapping => mapping.socialProfile)
  postMappings: PostSocialMapping[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
