import { ContentService } from './content.service';
export declare class ContentModerationCron {
    private contentService;
    private readonly logger;
    constructor(contentService: ContentService);
    checkVideoModerationJobs(): Promise<void>;
    processScheduledReviews(): Promise<void>;
}
//# sourceMappingURL=content-moderation.cron.d.ts.map