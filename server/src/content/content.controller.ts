import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createContent(@Request() req: any, @Body() createContentDto: CreateContentDto) {
    const result = await this.contentService.createContent(req.user.id, createContentDto);
    return {
      success: true,
      message: 'Content created successfully',
      data: result,
    };
  }

  @Get('my-content')
  @UseGuards(JwtAuthGuard)
  async getMyContent(@Request() req: any) {
    const content = await this.contentService.getCreatorContent(req.user.id);
    return {
      success: true,
      data: content,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getContentStats(@Request() req: any) {
    const stats = await this.contentService.getContentStats(req.user.id);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteContent(@Request() req: any, @Param('id') id: string) {
    const result = await this.contentService.deleteContent(req.user.id, id);
    return {
      success: true,
      message: result.message,
    };
  }
}
