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
import { AdminNotificationsService } from './notifications.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule, StripeModule],
  controllers: [AdminController, CreatorsController, ContentController, PaymentsController, SupportController, NotificationsController, ReportsController],
  providers: [AdminService, CreatorsService, ContentService, PaymentsService, SupportService, AdminNotificationsService, ReportsService],
  exports: [AdminService, CreatorsService, ContentService, PaymentsService, SupportService, AdminNotificationsService, ReportsService],
})
export class AdminModule {}
