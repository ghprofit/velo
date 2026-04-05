import { PrismaService } from '../prisma/prisma.service';
export declare class EarningsTaskService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    releasePendingEarnings(): Promise<void>;
    triggerManualRelease(): Promise<{
        released: number;
        total: number;
    }>;
}
//# sourceMappingURL=earnings.task.d.ts.map