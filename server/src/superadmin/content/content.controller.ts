import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { QueryContentDto } from './dto/query-content.dto';
import { UpdateContentDto, ReviewContentDto, RemoveContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/superadmin.guard';

@Controller('superadmin/content')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getContent(@Query() query: QueryContentDto) {
    const result = await this.contentService.getContent(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('stats')
  async getContentStats() {
    const stats = await this.contentService.getContentStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getContentById(@Param('id') id: string) {
    const content = await this.contentService.getContentById(id);
    return {
      success: true,
      data: content,
    };
  }

  @Put(':id')
  async updateContent(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    const content = await this.contentService.updateContent(id, dto);
    return {
      success: true,
      message: 'Content updated successfully',
      data: content,
    };
  }

  @Post(':id/review')
  async reviewContent(
    @Param('id') id: string,
    @Body() dto: ReviewContentDto,
    @Request() req: any,
  ) {
    const content = await this.contentService.reviewContent(id, dto, req.user.id);
    return {
      success: true,
      message: `Content ${dto.decision.toLowerCase()} successfully`,
      data: content,
    };
  }

  @Post(':id/remove')
  async removeContent(
    @Param('id') id: string,
    @Body() dto: RemoveContentDto,
    @Request() req: any,
  ) {
    const content = await this.contentService.removeContent(id, dto, req.user.id);
    return {
      success: true,
      message: 'Content removed successfully',
      data: content,
    };
  }
}
