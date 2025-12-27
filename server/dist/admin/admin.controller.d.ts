import { AdminService } from './admin.service';
import { DashboardStatsResponseDto, GetRevenueQueryDto, RecentActivityResponseDto, RevenueResponseDto } from './dto/dashboard.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<DashboardStatsResponseDto>;
    getRevenueOverTime(query: GetRevenueQueryDto): Promise<RevenueResponseDto>;
    getRecentActivity(): Promise<RecentActivityResponseDto>;
}
//# sourceMappingURL=admin.controller.d.ts.map