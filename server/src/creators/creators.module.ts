import { Module } from '@nestjs/common';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VeriffModule } from '../veriff/veriff.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [PrismaModule, VeriffModule.forRoot(), EmailModule, NotificationsModule, StripeModule],
  controllers: [CreatorsController],
  providers: [CreatorsService],
  exports: [CreatorsService],
})
export class CreatorsModule {}
