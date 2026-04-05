import { PrismaService } from '../prisma/prisma.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
export declare class WaitlistService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    addToWaitlist(dto: JoinWaitlistDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
        };
    }>;
    checkEmail(email: string): Promise<{
        isOnWaitlist: boolean;
        email: string;
    }>;
    getWaitlistCount(): Promise<{
        count: number;
    }>;
    getAllWaitlistEntries(page?: number, limit?: number): Promise<{
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
//# sourceMappingURL=waitlist.service.d.ts.map