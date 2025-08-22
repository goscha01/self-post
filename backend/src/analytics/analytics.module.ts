import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from '../entities/analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics])],
  providers: [],
  controllers: [],
  exports: [],
})
export class AnalyticsModule {} 
