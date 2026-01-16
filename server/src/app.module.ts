import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BuyerModule } from './buyer/buyer.module';
import { VerificationModule } from './verification/verification.module';
import { RedisModule } from './redis/redis.module';
import { VeriffModule } from './veriff/veriff.module';
import { CreatorsModule } from './creators/creators.module';
import { ContentModule } from './content/content.module';
import { S3Module } from './s3/s3.module';
import { SupportModule } from './support/support.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EarningsModule } from './earnings/earnings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StripeModule } from './stripe/stripe.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { AdminModule } from './admin/admin.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Schedule Module for Cron Jobs
    ScheduleModule.forRoot(),
    // Redis Cache Module
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST') || 'localhost',
        port: config.get('REDIS_PORT') || 6379,
        password: config.get('REDIS_PASSWORD') || undefined,
        db: config.get('REDIS_DB') || 0,
        ttl: 600, // 10 minutes default
      }),
    }),
    // Throttler Module for Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL') || 60000, // 1 minute
            limit: config.get('THROTTLE_LIMIT') || 100, // 100 requests per minute
          },
        ],
      }),
    }),
    RedisModule,
    PrismaModule,
    S3Module,
    StripeModule,
    AuthModule,
    BuyerModule,
    VerificationModule,
    VeriffModule.forRoot(),
    CreatorsModule,
    ContentModule,
    SupportModule,
    AnalyticsModule,
    EarningsModule,
    NotificationsModule,
    SuperadminModule,
    AdminModule,
    WaitlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
