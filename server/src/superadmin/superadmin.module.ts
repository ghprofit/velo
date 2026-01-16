import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';
import { CreatorsController } from './creators/creators.controller';
import { CreatorsService } from './creators/creators.service';
import { ContentController } from './content/content.controller';
import { ContentService } from './content/content.service';
import { FinancialReportsController } from './financial-reports/financial-reports.controller';
import { FinancialReportsService } from './financial-reports/financial-reports.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [PrismaModule, EmailModule, S3Module],
  controllers: [SuperadminController, CreatorsController, ContentController, FinancialReportsController, SettingsController],
  providers: [SuperadminService, CreatorsService, ContentService, FinancialReportsService, SettingsService],
  exports: [SuperadminService, CreatorsService, ContentService, FinancialReportsService, SettingsService],
})
export class SuperadminModule {}
