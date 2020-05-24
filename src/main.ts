import { NestFactory, APP_FILTER } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogService } from './log/services/log/log.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: true,
    whitelist: true,
    transform: true,
  }));
  app.enableCors();
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
