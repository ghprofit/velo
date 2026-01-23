import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { EmailModule } from '../email/email.module';
import { S3Module } from '../s3/s3.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    StripeModule,
    EmailModule,
    S3Module,
    RedisModule,
    NotificationsModule,
  ],
  controllers: [BuyerController],
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}
