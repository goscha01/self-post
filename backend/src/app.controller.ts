import { Controller, Get, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

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
    const url = req.url;
    
    // Skip if it's an API route, auth route, or static files
    if (url.startsWith('/api/') || 
        url.startsWith('/auth/') || 
        url.startsWith('/_next/') ||
        url.startsWith('/health')) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Try to serve the frontend file
    try {
      // Check if it's a file request (has extension)
      if (url.includes('.')) {
        const filePath = join(__dirname, '..', 'frontend', url);
        if (existsSync(filePath)) {
          return res.sendFile(filePath);
        }
      }

      // For route requests, serve the main HTML file
      const htmlPath = join(__dirname, '..', 'frontend', 'index.html');
      if (existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
      }

      // Fallback: serve a simple HTML response
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Self-Post App</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>Self-Post Backend is Running!</h1>
          <p>Frontend files are being built and will be available soon.</p>
          <p>Available endpoints:</p>
          <ul>
            <li><a href="/health">/health</a> - Health check</li>
            <li><a href="/auth/google">/auth/google</a> - Google OAuth</li>
            <li><a href="/auth/facebook">/auth/facebook</a> - Facebook OAuth</li>
          </ul>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error serving frontend:', error);
      res.status(500).json({ 
        message: 'Frontend not available',
        error: error.message,
        availableFiles: this.getAvailableFiles()
      });
    }
  }

  private getAvailableFiles(): string[] {
    try {
      const frontendDir = join(__dirname, '..', 'frontend');
      if (existsSync(frontendDir)) {
        // Return list of available files/directories
        return ['frontend directory exists'];
      }
      return ['frontend directory not found'];
    } catch (error) {
      return [`Error checking files: ${error.message}`];
    }
  }
}
