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
    index: 'index.html',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Fullstack app running on: http://localhost:${port}`);
  console.log(`🔐 Auth endpoints: /auth/*`);
  console.log(`🔧 API endpoints: /api/*`);
  console.log(`🌐 Frontend served from: /`);
}
bootstrap();
