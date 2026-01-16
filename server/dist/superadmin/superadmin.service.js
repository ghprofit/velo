"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperadminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const config_1 = require("@nestjs/config");
let SuperadminService = class SuperadminService {
    constructor(prisma, emailService, config) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.config = config;
    }
    async getAllAdmins(search, role) {
        const where = {
            role: { in: ['ADMIN', 'SUPPORT'] },
            adminProfile: { isNot: null },
        };
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { adminProfile: { fullName: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (role && role !== 'all') {
            where.adminProfile = {
                ...where.adminProfile,
                adminRole: role,
            };
        }
        const admins = await this.prisma.user.findMany({
            where,
            include: {
                adminProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return admins.map((admin) => this.formatAdminResponse(admin));
    }
    async getAdminById(id) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: {
                adminProfile: true,
            },
        });
        if (!admin || !admin.adminProfile) {
            throw new common_1.NotFoundException('Admin not found');
        }
        return this.formatAdminResponse(admin);
    }
    async createAdmin(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email.toLowerCase(),
                    password: hashedPassword,
                    role: dto.role === 'SUPPORT_SPECIALIST' ? 'SUPPORT' : 'ADMIN',
                    emailVerified: true,
                    adminProfile: {
                        create: {
                            fullName: dto.fullName,
                            adminRole: dto.role,
                            status: 'INVITED',
                            mustChangePassword: true,
                            ...this.getDefaultPermissions(dto.role),
                        },
                    },
                },
                include: {
                    adminProfile: true,
                },
            });
            try {
                const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:3000';
                await this.emailService.sendEmail({
                    to: dto.email,
                    subject: 'Welcome to VeloLink Admin',
                    html: `<h1>Welcome ${dto.fullName}!</h1><p>Your admin account has been created with the role: ${dto.role}.</p><p>Please login at: <a href="${clientUrl}/login">${clientUrl}/login</a></p>`,
                });
            }
            catch (error) {
                console.error('Failed to send admin welcome email:', error);
            }
            return this.formatAdminResponse(user);
        }
        catch (error) {
            console.error('Error creating admin:', error);
            throw new common_1.InternalServerErrorException('Failed to create admin account');
        }
    }
    async updateAdmin(id, dto) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { adminProfile: true },
        });
        if (!admin || !admin.adminProfile) {
            throw new common_1.NotFoundException('Admin not found');
        }
        try {
            const updateData = {};
            const profileUpdateData = {};
            if (dto.isActive !== undefined) {
                updateData.isActive = dto.isActive;
                profileUpdateData.status = dto.isActive ? 'ACTIVE' : 'SUSPENDED';
            }
            if (dto.status) {
                profileUpdateData.status = dto.status;
                updateData.isActive = dto.status === 'ACTIVE';
            }
            if (dto.fullName) {
                profileUpdateData.fullName = dto.fullName;
            }
            if (dto.role) {
                profileUpdateData.adminRole = dto.role;
                updateData.role = dto.role === 'SUPPORT_SPECIALIST' ? 'SUPPORT' : 'ADMIN';
            }
            if (dto.permissions) {
                if (dto.permissions.dashboard !== undefined) {
                    profileUpdateData.permDashboard = dto.permissions.dashboard;
                }
                if (dto.permissions.creatorManagement !== undefined) {
                    profileUpdateData.permCreatorManagement = dto.permissions.creatorManagement;
                }
                if (dto.permissions.contentReview !== undefined) {
                    profileUpdateData.permContentReview = dto.permissions.contentReview;
                }
                if (dto.permissions.financialReports !== undefined) {
                    profileUpdateData.permFinancialReports = dto.permissions.financialReports;
                }
                if (dto.permissions.systemSettings !== undefined) {
                    profileUpdateData.permSystemSettings = dto.permissions.systemSettings;
                }
                if (dto.permissions.supportTickets !== undefined) {
                    profileUpdateData.permSupportTickets = dto.permissions.supportTickets;
                }
            }
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    ...updateData,
                    adminProfile: {
                        update: profileUpdateData,
                    },
                },
                include: {
                    adminProfile: true,
                },
            });
            return this.formatAdminResponse(updatedUser);
        }
        catch (error) {
            console.error('Error updating admin:', error);
            throw new common_1.InternalServerErrorException('Failed to update admin');
        }
    }
    async deleteAdmin(id) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { adminProfile: true },
        });
        if (!admin || !admin.adminProfile) {
            throw new common_1.NotFoundException('Admin not found');
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Admin deleted successfully' };
    }
    async forcePasswordReset(id) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { adminProfile: true },
        });
        if (!admin || !admin.adminProfile) {
            throw new common_1.NotFoundException('Admin not found');
        }
        await this.prisma.adminProfile.update({
            where: { userId: id },
            data: {
                mustChangePassword: true,
                lastPasswordReset: new Date(),
            },
        });
        try {
            await this.emailService.sendEmail({
                to: admin.email,
                subject: 'Password Reset Required',
                html: `Your password has been reset by a system administrator. You must change your password on your next login.`,
            });
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
        return { message: 'Password reset forced successfully' };
    }
    async getAdminActivityLog(id) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { adminProfile: true },
        });
        if (!admin || !admin.adminProfile) {
            throw new common_1.NotFoundException('Admin not found');
        }
        const actions = await this.prisma.adminAction.findMany({
            where: { adminId: id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return actions;
    }
    getDefaultPermissions(role) {
        switch (role) {
            case 'FINANCIAL_ADMIN':
                return {
                    permDashboard: true,
                    permFinancialReports: true,
                    permCreatorManagement: false,
                    permContentReview: false,
                    permSystemSettings: false,
                    permSupportTickets: false,
                };
            case 'CONTENT_ADMIN':
                return {
                    permDashboard: true,
                    permContentReview: true,
                    permCreatorManagement: true,
                    permFinancialReports: false,
                    permSystemSettings: false,
                    permSupportTickets: false,
                };
            case 'SUPPORT_SPECIALIST':
                return {
                    permDashboard: true,
                    permSupportTickets: true,
                    permCreatorManagement: false,
                    permContentReview: false,
                    permFinancialReports: false,
                    permSystemSettings: false,
                };
            case 'ANALYTICS_ADMIN':
                return {
                    permDashboard: true,
                    permFinancialReports: true,
                    permCreatorManagement: false,
                    permContentReview: false,
                    permSystemSettings: false,
                    permSupportTickets: false,
                };
            default:
                return {
                    permDashboard: true,
                    permCreatorManagement: false,
                    permContentReview: false,
                    permFinancialReports: false,
                    permSystemSettings: false,
                    permSupportTickets: false,
                };
        }
    }
    formatAdminResponse(user) {
        const roleMap = {
            FINANCIAL_ADMIN: 'Financial Admin',
            CONTENT_ADMIN: 'Content Admin',
            SUPPORT_SPECIALIST: 'Support Specialist',
            ANALYTICS_ADMIN: 'Analytics Admin',
        };
        const statusMap = {
            ACTIVE: 'Active',
            SUSPENDED: 'Suspended',
            INVITED: 'Invited',
        };
        return {
            id: user.id,
            name: user.adminProfile?.fullName || '',
            email: user.email,
            role: roleMap[user.adminProfile?.adminRole] || user.adminProfile?.adminRole,
            status: statusMap[user.adminProfile?.status] || user.adminProfile?.status,
            lastLogin: user.lastLogin ? this.formatLastLogin(user.lastLogin) : '-',
            isActive: user.isActive,
            permissions: {
                dashboard: user.adminProfile?.permDashboard ?? true,
                creatorManagement: user.adminProfile?.permCreatorManagement ?? false,
                contentReview: user.adminProfile?.permContentReview ?? false,
                financialReports: user.adminProfile?.permFinancialReports ?? false,
                systemSettings: user.adminProfile?.permSystemSettings ?? false,
                supportTickets: user.adminProfile?.permSupportTickets ?? false,
            },
            twoFactorEnabled: user.adminProfile?.twoFactorEnabled ?? false,
            lastPasswordReset: user.adminProfile?.lastPasswordReset,
            createdAt: user.createdAt,
        };
    }
    formatLastLogin(date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (hours < 1)
            return 'Just now';
        if (hours < 24)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7)
            return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }
};
exports.SuperadminService = SuperadminService;
exports.SuperadminService = SuperadminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], SuperadminService);
//# sourceMappingURL=superadmin.service.js.map