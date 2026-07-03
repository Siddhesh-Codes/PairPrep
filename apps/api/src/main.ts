import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { validateEnvironment } from './common/env.validation';
import { AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  // Validate environment before anything else
  validateEnvironment();

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));

  // Production CORS — supports multiple origins via comma-separated CORS_ORIGINS env var
  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, ''));

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      const cleanedOrigin = origin ? origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, '') : '';
      if (!origin || allowedOrigins.includes(cleanedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 8080;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(
    `PairPrep API running on :${port} [${process.env.NODE_ENV || 'development'}]`,
  );
  logger.log(
    `Allowed CORS origins: ${JSON.stringify(allowedOrigins)}`,
  );
}
bootstrap();
