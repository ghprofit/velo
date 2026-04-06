import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('🚀 SERVER IS RESTARTING AND LOADING NEW CURRENCY LOGIC...');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Cookie Parser - Must be before routes
  app.use(cookieParser());

  // Capture raw body for webhook signature verification via verify callback
  app.use(bodyParser.json({
    limit: '750mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }));
  app.use(bodyParser.urlencoded({ limit: '750mb', extended: true }));

  // Security Headers
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

  // CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Buyer-Session'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.error('[VALIDATION ERROR] Validation failed:', JSON.stringify(errors, null, 2));
        const formattedErrors = errors.map(err => ({
          property: err.property,
          constraints: err.constraints,
          value: err.value,
        }));
        console.error('[VALIDATION ERROR] Formatted:', JSON.stringify(formattedErrors, null, 2));
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  // API Prefix
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT) || 8000;
  await app.listen(port);
  console.log(`🚀 SERVER RUNNING ON http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
