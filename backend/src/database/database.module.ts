import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { SocialProfile } from '../entities/social-profile.entity';
import { PostSocialMapping } from '../entities/post-social-mapping.entity';
import { Analytics } from '../entities/analytics.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('SUPABASE_DATABASE_URL'),
        entities: [User, Post, SocialProfile, PostSocialMapping, Analytics],
        synchronize: false, // Disabled to prevent schema conflicts with existing tables
        logging: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
