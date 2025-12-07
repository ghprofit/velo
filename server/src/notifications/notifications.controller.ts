import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

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
}
