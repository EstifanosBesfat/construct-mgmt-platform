import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor';

export async function configureApp(app: any) {
  const config = app.get(ConfigService) as ConfigService;
  const corsOrigin = config.get<string>('CORS_ORIGIN', '*');

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  const allowedOrigins = corsOrigin.split(',').map((value: string) => value.trim());

  app.enableCors({
    origin: (origin: string, callback: any) => {
      if (
        !origin ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  app.useGlobalInterceptors(new DecimalSerializerInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mini Construction Management System API')
    .setDescription(
      'REST API for managing construction projects, bills of quantities, ' +
        'materials, inventory movements and project progress.',
    )
    .setVersion('1.0')
    .addTag('Projects', 'Construction project CRUD')
    .addTag('BOQ', 'Bill of Quantities per project')
    .addTag('Materials', 'Material catalogue and stock levels')
    .addTag('Inventory', 'Stock-in, stock-out and transaction history')
    .addTag('Progress', 'Project progress records')
    .addTag('Dashboard', 'Aggregated analytics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}

// Serverless handler for Vercel
let cachedServer: Express;

async function bootstrapServerless(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    await configureApp(app);
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrapServerless();
  return server(req, res);
}

// Standard standalone startup for local development & container runtimes
async function bootstrap(): Promise<void> {
  if (process.env.VERCEL) {
    return;
  }
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService) as ConfigService;
  const logger = new Logger('Bootstrap');
  const port = config.get<number>('PORT', 4002);

  await configureApp(app);
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}`);
  logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
