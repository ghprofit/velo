import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto, SendToMultipleUsersDto } from './dto/broadcast-notification.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ============ USER ENDPOINTS ============

  @Get()
  async getNotifications(
    @Request() req: AuthenticatedRequest,
    @Query('category') category?: string,
  ) {
    const notifications = await this.notificationsService.getNotifications(
      req.user.id,
      category,
    );

    return {
      success: true,
      data: notifications,
    };
  }

  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    const stats = await this.notificationsService.getStats(req.user.id);

    return {
      success: true,
      data: stats,
    };
  }

  @Patch(':id/read')
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationsService.markAsRead(
      req.user.id,
      id,
    );

    return {
      success: true,
      data: notification,
    };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    await this.notificationsService.markAllAsRead(req.user.id);

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  @Delete('read')
  async clearAllRead(@Request() req: AuthenticatedRequest) {
    await this.notificationsService.clearAllRead(req.user.id);

    return {
      success: true,
      message: 'All read notifications cleared',
    };
  }

  @Delete(':id')
  async deleteNotification(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.notificationsService.deleteNotification(req.user.id, id);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  // ============ ADMIN ENDPOINTS ============

  /**
   * Get all notifications (admin view) with pagination and filters
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllNotifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('isRead') isRead?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const notifications = await this.notificationsService.getAllNotifications({
      page,
      limit,
      type,
      userId,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return {
      success: true,
      ...notifications,
    };
  }

  /**
   * Get admin dashboard notification stats
   */
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAdminStats() {
    const stats = await this.notificationsService.getAdminStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Create a notification for a specific user
   */
  @Post('admin/create')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createNotification(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationsService.createNotification(dto);

    return {
      success: true,
      data: notification,
      message: 'Notification created successfully',
    };
  }

  /**
   * Send notification to multiple specific users
   */
  @Post('admin/send-multiple')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async sendToMultipleUsers(@Body() dto: SendToMultipleUsersDto) {
    const result = await this.notificationsService.sendToMultipleUsers(dto);

    return {
      success: true,
      data: result,
      message: `Notification sent to ${result.count} users`,
    };
  }

  /**
   * Broadcast notification to all users with specific roles
   */
  @Post('admin/broadcast')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    const result = await this.notificationsService.broadcastNotification(dto);

    return {
      success: true,
      data: result,
      message: `Notification broadcast to ${result.recipientCount} users`,
    };
  }

  /**
   * Delete a notification (admin - can delete any notification)
   */
  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async adminDeleteNotification(@Param('id') id: string) {
    await this.notificationsService.adminDeleteNotification(id);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  /**
   * Bulk delete notifications
   */
  @Delete('admin/bulk')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async bulkDeleteNotifications(@Body('ids') ids: string[]) {
    const result = await this.notificationsService.bulkDeleteNotifications(ids);

    return {
      success: true,
      data: result,
      message: `${result.deletedCount} notifications deleted`,
    };
  }

  /**
   * Delete all notifications for a specific user
   */
  @Delete('admin/user/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteUserNotifications(@Param('userId') userId: string) {
    const result = await this.notificationsService.deleteUserNotifications(userId);

    return {
      success: true,
      data: result,
      message: `${result.deletedCount} notifications deleted for user`,
    };
  }

  /**
   * Get notifications for a specific user (admin view)
   */
  @Get('admin/user/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('category') category?: string,
  ) {
    const notifications = await this.notificationsService.getNotifications(
      userId,
      category,
    );

    return {
      success: true,
      data: notifications,
    };
  }

  /**
   * Get notification types enum for frontend reference
   */
  @Get('admin/types')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getNotificationTypes() {
    const { NotificationType } = await import('./dto/create-notification.dto');
    const { TargetRole } = await import('./dto/broadcast-notification.dto');

    return {
      success: true,
      data: {
        notificationTypes: Object.values(NotificationType),
        targetRoles: Object.values(TargetRole),
      },
    };
  }
}
