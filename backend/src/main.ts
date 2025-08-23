import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend API running on: http://localhost:${port}`);
  console.log(`🔐 Auth endpoints: /auth/*`);
  console.log(`🔧 API endpoints: /api/*`);
}
bootstrap();
