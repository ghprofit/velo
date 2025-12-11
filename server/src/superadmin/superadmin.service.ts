import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class SuperadminService {
  constructor(private prisma: PrismaService) {}

  async getAllAdmins(search?: string, role?: string) {
    const where: any = {
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

  async getAdminById(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: {
        adminProfile: true,
      },
    });

    if (!admin || !admin.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    return this.formatAdminResponse(admin);
  }

  async createAdmin(dto: CreateAdminDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    try {
      // Create user with admin profile
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          role: dto.role === 'SUPPORT_SPECIALIST' ? 'SUPPORT' : 'ADMIN',
          emailVerified: true, // Admin accounts are pre-verified
          adminProfile: {
            create: {
              fullName: dto.fullName,
              adminRole: dto.role,
              status: 'INVITED',
              mustChangePassword: true,
              // Set default permissions based on role
              ...this.getDefaultPermissions(dto.role),
            },
          },
        },
        include: {
          adminProfile: true,
        },
      });

      return this.formatAdminResponse(user);
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new InternalServerErrorException('Failed to create admin account');
    }
  }

  async updateAdmin(id: string, dto: UpdateAdminDto) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!admin || !admin.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    try {
      // Update user and admin profile
      const updateData: any = {};
      const profileUpdateData: any = {};

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
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new InternalServerErrorException('Failed to update admin');
    }
  }

  async deleteAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!admin || !admin.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Admin deleted successfully' };
  }

  async forcePasswordReset(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!admin || !admin.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.adminProfile.update({
      where: { userId: id },
      data: {
        mustChangePassword: true,
        lastPasswordReset: new Date(),
      },
    });

    // TODO: Send password reset email

    return { message: 'Password reset forced successfully' };
  }

  async getAdminActivityLog(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!admin || !admin.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    const actions = await this.prisma.adminAction.findMany({
      where: { adminId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return actions;
  }

  private getDefaultPermissions(role: string) {
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

  private formatAdminResponse(user: any) {
    const roleMap: Record<string, string> = {
      FINANCIAL_ADMIN: 'Financial Admin',
      CONTENT_ADMIN: 'Content Admin',
      SUPPORT_SPECIALIST: 'Support Specialist',
      ANALYTICS_ADMIN: 'Analytics Admin',
    };

    const statusMap: Record<string, string> = {
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

  private formatLastLogin(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}
