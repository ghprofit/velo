import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentModerationCron } from './content-moderation.cron';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { RecognitionModule } from '../recognition/recognition.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, S3Module, RecognitionModule, EmailModule, NotificationsModule],
  controllers: [ContentController],
  providers: [ContentService, ContentModerationCron],
  exports: [ContentService],
})
export class ContentModule {}
