import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialProfile } from '../entities/social-profile.entity';

@Injectable()
export class SocialProfilesService {
  constructor(
    @InjectRepository(SocialProfile)
    private socialProfileRepository: Repository<SocialProfile>,
  ) {}

  async findAll(): Promise<SocialProfile[]> {
    return this.socialProfileRepository.find();
  }

  async findById(id: string): Promise<SocialProfile | null> {
    return this.socialProfileRepository.findOne({ where: { id } });
  }
}
