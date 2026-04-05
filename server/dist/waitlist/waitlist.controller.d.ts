import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
export declare class WaitlistController {
    private waitlistService;
    constructor(waitlistService: WaitlistService);
    joinWaitlist(dto: JoinWaitlistDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
        };
    }>;
    checkWaitlist(email: string): Promise<{
        isOnWaitlist: boolean;
        email: string;
    }>;
    getCount(): Promise<{
        count: number;
    }>;
    getAllEntries(page?: string, limit?: string): Promise<{
        data: {
            id: string;
            email: string;
            createdAt: Date;
            country: string | null;
            age: number | null;
            heardFrom: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    removeFromWaitlist(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=waitlist.controller.d.ts.map