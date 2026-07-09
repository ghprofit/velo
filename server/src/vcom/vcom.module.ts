import { Module } from '@nestjs/common';
import { VcomController } from './vcom.controller';
import { VcomService } from './vcom.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule],
  controllers: [VcomController],
  providers: [VcomService],
  exports: [VcomService],
})
export class VcomModule {}
