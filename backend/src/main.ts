import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  console.log(`MusicGraph API running on http://localhost:${port}/api`);
}
bootstrap();
