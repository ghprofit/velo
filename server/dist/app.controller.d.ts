import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(): {
        success: boolean;
        message: string;
        data: {
            name: string;
            description: string;
            version: string;
            apiPrefix: string;
        };
    };
    getHealth(): {
        success: boolean;
        data: {
            status: string;
            timestamp: string;
            uptime: number;
            environment: string;
            version: string;
        };
    };
    getAWSHealth(): {
        success: boolean;
        data: {
            s3: {
                configured: boolean;
                bucket: string;
                region: string;
                hasCredentials: boolean;
            };
            rekognition: {
                configured: boolean;
                region: string;
                minConfidence: string;
            };
            ses: {
                configured: boolean;
                fromEmail: string;
            };
        };
    };
}
//# sourceMappingURL=app.controller.d.ts.map