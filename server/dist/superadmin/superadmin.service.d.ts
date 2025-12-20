import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class SuperadminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllAdmins(search?: string, role?: string): Promise<{
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
    }[]>;
    getAdminById(id: string): Promise<{
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
    }>;
    createAdmin(dto: CreateAdminDto): Promise<{
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
    }>;
    updateAdmin(id: string, dto: UpdateAdminDto): Promise<{
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
    }>;
    deleteAdmin(id: string): Promise<{
        message: string;
    }>;
    forcePasswordReset(id: string): Promise<{
        message: string;
    }>;
    getAdminActivityLog(id: string): Promise<{
        id: string;
        createdAt: Date;
        reason: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        action: string;
        adminId: string;
        targetType: string;
        targetId: string;
    }[]>;
    private getDefaultPermissions;
    private formatAdminResponse;
    private formatLastLogin;
}
//# sourceMappingURL=superadmin.service.d.ts.map