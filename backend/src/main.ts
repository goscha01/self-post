import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Serve static frontend files
  app.useStaticAssets(join(__dirname, '..', 'frontend', '.next'), {
    prefix: '/_next/',
  });
  
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'public'), {
    prefix: '/',
  });

  // Simple catch-all route for frontend (after all other routes)
  app.use('*', (req, res) => {
    // Skip if it's an API route, auth route, or Next.js internal route
    if (req.url.startsWith('/api/') || 
        req.url.startsWith('/auth/') || 
        req.url.startsWith('/_next/') ||
        req.url.startsWith('/health')) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    // For all other routes, serve the frontend
    try {
      res.sendFile(join(__dirname, '..', 'frontend', '.next', 'server', 'app', 'page.html'));
    } catch (error) {
      console.error('Error serving frontend:', error);
      res.status(500).json({ message: 'Frontend not available' });
    }
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 Frontend will be served from the same port`);
}
bootstrap();
