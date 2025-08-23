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
  app.useStaticAssets(join(__dirname, 'public'), {
    prefix: '/',
  });

  // Serve frontend for all non-API routes
  app.use('*', (req, res, next) => {
    // Skip if it's an API route, auth route, or static files
    if (req.url.startsWith('/api/') || 
        req.url.startsWith('/auth/') || 
        req.url.startsWith('/health')) {
      return next();
    }
    
    // For all other routes, serve the frontend index.html
    try {
      res.sendFile(join(__dirname, 'public', 'index.html'));
    } catch (error) {
      console.error('Error serving frontend:', error);
      res.status(500).json({ message: 'Frontend not available' });
    }
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Fullstack app running on: http://localhost:${port}`);
  console.log(`🔐 Auth endpoints: /auth/*`);
  console.log(`🔧 API endpoints: /api/*`);
  console.log(`🌐 Frontend served from: /`);
}
bootstrap();
