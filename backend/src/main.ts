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

  // Serve frontend for all non-API routes
  app.use('*', (req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/auth/') || req.url.startsWith('/_next/')) {
      return next();
    }
    
    // Serve the main HTML file for all other routes
    res.sendFile(join(__dirname, '..', 'frontend', '.next', 'server', 'app', 'page.html'));
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 Frontend will be served from the same port`);
}
bootstrap();
