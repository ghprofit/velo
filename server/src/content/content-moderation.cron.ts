import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentService } from './content.service';

@Injectable()
export class ContentModerationCron {
  private readonly logger = new Logger(ContentModerationCron.name);

  constructor(private contentService: ContentService) {}

  /**
   * Poll video moderation jobs every 2 minutes
   * Checks pending Rekognition jobs and updates content status
   */
  @Cron('0 */2 * * * *')
  async checkVideoModerationJobs() {
    try {
      this.logger.debug('Checking pending video moderation jobs...');
      await this.contentService.processVideoModerationJobs();
    } catch (error) {
      const err = error as Error;
      // Only log if it's not a connection timeout (reduce noise)
      if (!err.message.includes('Connection terminated') && !err.message.includes('timeout')) {
        this.logger.error(`Video moderation cron failed: ${err.message}`);
      } else {
        this.logger.warn('Video moderation cron: Connection timeout (will retry)');
      }
    }
  }

  /**
   * Check for content scheduled for review every minute
   * Process content that has been waiting 10+ minutes after upload
   */
  @Cron('0 * * * * *') // Every minute
  async processScheduledReviews() {
    try {
      this.logger.debug('Checking for scheduled content reviews...');
      const result = await this.contentService.processScheduledContentReviews();
      
      if (result.processed > 0) {
        this.logger.log(
          `Processed ${result.successful}/${result.processed} scheduled reviews`,
        );
      }
    } catch (error) {
      const err = error as Error;
      if (!err.message.includes('Connection terminated') && !err.message.includes('timeout')) {
        this.logger.error(`Scheduled review cron failed: ${err.message}`);
      } else {
        this.logger.warn('Scheduled review cron: Connection timeout (will retry)');
      }
    }
  }
}
