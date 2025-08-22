import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialProfilesService } from './social-profiles.service';
import { SocialProfilesController } from './social-profiles.controller';
import { SocialProfile } from '../entities/social-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialProfile])],
  providers: [SocialProfilesService],
  controllers: [SocialProfilesController],
  exports: [SocialProfilesService],
})
export class SocialProfilesModule {} 
