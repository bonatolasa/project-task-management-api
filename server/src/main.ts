// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './commons/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse CORS_ORIGIN: allow comma-separated list (e.g., "http://a.com,http://b.com")
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
  const origins = corsOrigin.split(',').map(origin => origin.trim());

  app.enableCors({
    origin: origins,  // Now an array of allowed origins
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
