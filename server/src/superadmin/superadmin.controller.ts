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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/superadmin.guard';

@Controller('superadmin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get('admins')
  async getAllAdmins(
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const admins = await this.superadminService.getAllAdmins(search, role);
    return {
      success: true,
      data: admins,
    };
  }

  @Get('admins/:id')
  async getAdminById(@Param('id') id: string) {
    const admin = await this.superadminService.getAdminById(id);
    return {
      success: true,
      data: admin,
    };
  }

  @Post('admins')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() dto: CreateAdminDto) {
    const admin = await this.superadminService.createAdmin(dto);
    return {
      success: true,
      message: 'Administrator created successfully',
      data: admin,
    };
  }

  @Put('admins/:id')
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const admin = await this.superadminService.updateAdmin(id, dto);
    return {
      success: true,
      message: 'Administrator updated successfully',
      data: admin,
    };
  }

  @Delete('admins/:id')
  async deleteAdmin(@Param('id') id: string) {
    await this.superadminService.deleteAdmin(id);
    return {
      success: true,
      message: 'Administrator deleted successfully',
    };
  }

  @Post('admins/:id/force-password-reset')
  @HttpCode(HttpStatus.OK)
  async forcePasswordReset(@Param('id') id: string) {
    await this.superadminService.forcePasswordReset(id);
    return {
      success: true,
      message: 'Password reset has been forced',
    };
  }

  @Get('admins/:id/activity')
  async getAdminActivity(@Param('id') id: string) {
    const activity = await this.superadminService.getAdminActivityLog(id);
    return {
      success: true,
      data: activity,
    };
  }
}
