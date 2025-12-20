import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  QueryNotificationsDto,
  CreateNotificationDto,
  BroadcastNotificationDto,
} from './dto/notifications.dto';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, AdminGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('stats')
  async getNotificationStats() {
    return this.notificationsService.getNotificationStats();
  }

  @Get()
  async getAllNotifications(@Query() query: QueryNotificationsDto) {
    return this.notificationsService.getAllNotifications(query);
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    return this.notificationsService.getNotificationById(id);
  }

  @Post()
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Post('broadcast')
  async broadcastNotification(@Body() broadcastDto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastNotification(broadcastDto);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  async markAllAsRead(@Query('userId') userId?: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  @Delete()
  async deleteAllNotifications(@Query('userId') userId?: string) {
    return this.notificationsService.deleteAllNotifications(userId);
  }
}
