export declare class AppService {
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
    };
    getAppInfo(): {
        name: string;
        description: string;
        version: string;
        apiPrefix: string;
    };
    getAWSHealth(): {
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
}
//# sourceMappingURL=app.service.d.ts.map