import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentService } from './content.service';

@Injectable()
export class ContentModerationCron {
  private readonly logger = new Logger(ContentModerationCron.name);

  constructor(private contentService: ContentService) {}

  /**
   * Poll video moderation jobs every 30 seconds
   * Checks pending Rekognition jobs and updates content status
   */
  @Cron('*/30 * * * * *')
  async checkVideoModerationJobs() {
    this.logger.debug('Checking pending video moderation jobs...');
    try {
      await this.contentService.processVideoModerationJobs();
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Video moderation cron failed: ${err.message}`);
    }
  }
}
