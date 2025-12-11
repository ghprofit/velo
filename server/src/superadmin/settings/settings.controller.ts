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
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  CreateSettingDto,
  UpdateSettingDto,
  BulkUpdateSettingsDto,
  SettingCategory,
} from './dto/settings.dto';
import { SuperAdminGuard } from '../guards/superadmin.guard';

@Controller('superadmin/settings')
@UseGuards(SuperAdminGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('initialize')
  async initializeSettings() {
    await this.settingsService.initializeDefaultSettings();
    return { message: 'Settings initialized successfully' };
  }

  @Get()
  async getAllSettings(@Query('category') category?: SettingCategory) {
    return this.settingsService.getAllSettings(category);
  }

  @Get('public')
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Post()
  async createSetting(@Body() dto: CreateSettingDto, @Request() req: any) {
    const adminId = req.user.id;
    return this.settingsService.createSetting(dto, adminId);
  }

  @Put('bulk')
  async bulkUpdateSettings(@Body() dto: BulkUpdateSettingsDto, @Request() req: any) {
    const adminId = req.user.id;
    return this.settingsService.bulkUpdateSettings(dto, adminId);
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @Request() req: any,
  ) {
    const adminId = req.user.id;
    return this.settingsService.updateSetting(key, dto, adminId);
  }

  @Delete(':key')
  async deleteSetting(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key);
  }

  @Post('reset')
  async resetToDefaults(@Request() req: any) {
    const adminId = req.user.id;
    return this.settingsService.resetToDefaults(adminId);
  }
}
