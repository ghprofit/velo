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
}
//# sourceMappingURL=app.controller.d.ts.map