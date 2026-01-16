import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly logger = new Logger(SuperAdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role !== 'SUPER_ADMIN') {
      this.logger.warn(`Access denied for user ${user.email} with role ${user.role}. SUPER_ADMIN role required.`);
      throw new ForbiddenException(`Super Admin access required. Your current role: ${user.role}`);
    }

    return true;
  }
}
