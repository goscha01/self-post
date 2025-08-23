import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Self-Post Backend',
      version: '1.0.0'
    };
  }

  @Get()
  getHello() {
    return {
      message: 'Self-Post Backend is running!',
      endpoints: {
        health: '/health',
        auth: '/auth/*',
        api: '/api/*'
      }
    };
  }
}
