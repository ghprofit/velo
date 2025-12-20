import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, CreatorsController, ContentController, PaymentsController, SupportController, NotificationsController],
  providers: [AdminService, CreatorsService, ContentService, PaymentsService, SupportService, NotificationsService],
  exports: [AdminService, CreatorsService, ContentService, PaymentsService, SupportService, NotificationsService],
})
export class AdminModule {}
