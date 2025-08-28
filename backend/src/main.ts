import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS with dynamic origin handling
  const allowedOrigins = [
    'https://www.post-to.app',
    'https://self-post-git-master-george-says-projects.vercel.app',
    'https://self-post-flmrzws88-george-says-projects.vercel.app',
    'http://localhost:3000' // for local development
  ];
  
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend API running on: http://localhost:${port}`);
  console.log(`🔐 Auth endpoints: /auth/*`);
  console.log(`🔧 API endpoints: /api/*`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
}
bootstrap();
