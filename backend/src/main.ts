import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = config.get<number>('PORT', 4000);
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');

  app.use(
    helmet({
      // Swagger UI loads inline styles and scripts, which the default CSP
      // blocks. The API serves JSON to a separate origin, so CSP adds little
      // here.
      contentSecurityPolicy: false,
    }),
  );

  const allowedOrigins = corsOrigin.split(',').map((value) => value.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
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

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`API listening on http://localhost:${port}`);
  logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

void bootstrap();
