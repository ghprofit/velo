import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsResponseDto, RevenueResponseDto, RecentActivityResponseDto, TimePeriod } from './dto/dashboard.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<DashboardStatsResponseDto>;
    getRevenueOverTime(period: TimePeriod): Promise<RevenueResponseDto>;
    getRecentActivity(limit?: number): Promise<RecentActivityResponseDto>;
}
//# sourceMappingURL=admin.service.d.ts.map