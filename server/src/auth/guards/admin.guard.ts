import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Allow SUPER_ADMIN, ADMIN, and SUPPORT from UserRole
    // SUPPORT role is for admin users with specific AdminRole (SUPPORT_SPECIALIST, etc.)
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'];

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
