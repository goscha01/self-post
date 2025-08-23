import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
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

  // Serve frontend for all other routes
  @Get('*')
  serveFrontend(@Res() res: Response, @Req() req: Request) {
    // Skip if it's an API route, auth route, or static files
    if (req.url.startsWith('/api/') || 
        req.url.startsWith('/auth/') || 
        req.url.startsWith('/_next/') ||
        req.url.startsWith('/health')) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    // Try to serve the frontend file
    try {
      const frontendPath = join(__dirname, '..', 'frontend', 'index.html');
      res.sendFile(frontendPath);
    } catch (error) {
      console.error('Error serving frontend:', error);
      res.status(500).json({ message: 'Frontend not available' });
    }
  }
}
