import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAdminRoles = this.reflector.get<string[]>('adminRoles', context.getHandler());

    if (!requiredAdminRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is an admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    // SUPER_ADMIN has access to everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Fetch admin profile to get admin role
    const adminProfile = await this.prisma.adminProfile.findUnique({
      where: { userId: user.id },
      select: { adminRole: true },
    });

    if (!adminProfile) {
      throw new ForbiddenException('Admin profile not found');
    }

    const hasRequiredRole = requiredAdminRoles.includes(adminProfile.adminRole);

    if (!hasRequiredRole) {
      throw new ForbiddenException(`This action requires one of these roles: ${requiredAdminRoles.join(', ')}`);
    }

    return true;
  }
}
