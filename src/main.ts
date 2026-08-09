import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Global prefix for all API endpoints
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away non-whitelisted properties from DTOs
      forbidNonWhitelisted: true, // Rejects requests containing unknown properties
      transform: true, // Automatically converts payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Converts types based on TS design types
      },
    }),
  );

  // Set up Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Intellia360 API')
    .setDescription('Intellia360 Backend API endpoints for Auth, Student, and Teacher modules.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(
    `🚀 Intellia360 Backend Application running on: http://localhost:${port}/api/v1`,
  );
  logger.log(
    `📖 Swagger documentation available on: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
