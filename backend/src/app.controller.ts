import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Self-Post Backend API',
      version: '1.0.0'
    };
  }

  @Get()
  getHello() {
    return {
      message: 'Self-Post Backend API is running!',
      endpoints: {
        health: '/health',
        auth: '/auth/*',
        api: '/api/*'
      },
      note: 'Frontend is served separately'
    };
  }
}
