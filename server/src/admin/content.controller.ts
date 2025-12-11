import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { QueryContentDto, ReviewContentDto } from './dto/content.dto';

@Controller('admin/content')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getContent(@Query() query: QueryContentDto) {
    return this.contentService.getContent(query);
  }

  @Get('stats')
  async getContentStats() {
    return this.contentService.getContentStats();
  }

  @Get(':id')
  async getContentById(@Param('id') id: string) {
    return this.contentService.getContentById(id);
  }

  @Post(':id/review')
  async reviewContent(@Param('id') id: string, @Body() dto: ReviewContentDto) {
    return this.contentService.reviewContent(id, dto);
  }

  @Post(':id/flag')
  async flagContent(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.contentService.flagContent(id, body.reason);
  }

  @Post(':id/remove')
  async removeContent(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.contentService.removeContent(id, body.reason);
  }
}
