import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Allow SUPER_ADMIN and ADMIN from UserRole, plus specific AdminRole types
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_SPECIALIST', 'ANALYTICS_ADMIN'];

    if (!adminRoles.includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
