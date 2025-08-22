import { Controller, Get, Param } from '@nestjs/common';
import { SocialProfilesService } from './social-profiles.service';

@Controller('social-profiles')
export class SocialProfilesController {
  constructor(private readonly socialProfilesService: SocialProfilesService) {}

  @Get()
  findAll() {
    return this.socialProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socialProfilesService.findById(id);
  }
}
