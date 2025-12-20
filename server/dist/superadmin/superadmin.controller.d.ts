import { SuperadminService } from './superadmin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class SuperadminController {
    private readonly superadminService;
    constructor(superadminService: SuperadminService);
    getAllAdmins(search?: string, role?: string): Promise<{
        success: boolean;
        data: {
            id: any;
            name: any;
            email: any;
            role: any;
            status: any;
            lastLogin: string;
            isActive: any;
            permissions: {
                dashboard: any;
                creatorManagement: any;
                contentReview: any;
                financialReports: any;
                systemSettings: any;
                supportTickets: any;
            };
            twoFactorEnabled: any;
            lastPasswordReset: any;
            createdAt: any;
        }[];
    }>;
    getAdminById(id: string): Promise<{
        success: boolean;
        data: {
            id: any;
            name: any;
            email: any;
            role: any;
            status: any;
            lastLogin: string;
            isActive: any;
            permissions: {
                dashboard: any;
                creatorManagement: any;
                contentReview: any;
                financialReports: any;
                systemSettings: any;
                supportTickets: any;
            };
            twoFactorEnabled: any;
            lastPasswordReset: any;
            createdAt: any;
        };
    }>;
    createAdmin(dto: CreateAdminDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            name: any;
            email: any;
            role: any;
            status: any;
            lastLogin: string;
            isActive: any;
            permissions: {
                dashboard: any;
                creatorManagement: any;
                contentReview: any;
                financialReports: any;
                systemSettings: any;
                supportTickets: any;
            };
            twoFactorEnabled: any;
            lastPasswordReset: any;
            createdAt: any;
        };
    }>;
    updateAdmin(id: string, dto: UpdateAdminDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            name: any;
            email: any;
            role: any;
            status: any;
            lastLogin: string;
            isActive: any;
            permissions: {
                dashboard: any;
                creatorManagement: any;
                contentReview: any;
                financialReports: any;
                systemSettings: any;
                supportTickets: any;
            };
            twoFactorEnabled: any;
            lastPasswordReset: any;
            createdAt: any;
        };
    }>;
    deleteAdmin(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forcePasswordReset(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAdminActivity(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            reason: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            action: string;
            adminId: string;
            targetType: string;
            targetId: string;
        }[];
    }>;
}
//# sourceMappingURL=superadmin.controller.d.ts.map