import { Module } from '@nestjs/common';
import { StrypayController } from './strypay.controller';
import { StrypayService } from './strypay.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule],
  controllers: [StrypayController],
  providers: [StrypayService],
  exports: [StrypayService],
})
export class StrypayModule {}
