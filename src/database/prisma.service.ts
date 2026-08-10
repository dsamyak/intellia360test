import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const dbUrl =
      configService.get<string>('database.url') ||
      configService.get<string>('DATABASE_URL');

    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected successfully via Prisma Client');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected via Prisma Client');
  }
}
