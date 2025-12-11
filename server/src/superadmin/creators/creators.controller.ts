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
import { CreatorsService } from './creators.service';
import { QueryCreatorsDto } from './dto/query-creators.dto';
import { UpdateCreatorDto, AddStrikeDto, SuspendCreatorDto } from './dto/update-creator.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/superadmin.guard';

@Controller('superadmin/creators')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Get()
  async getCreators(@Query() query: QueryCreatorsDto) {
    const result = await this.creatorsService.getCreators(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('stats')
  async getCreatorStats() {
    const stats = await this.creatorsService.getCreatorStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getCreatorById(@Param('id') id: string) {
    const creator = await this.creatorsService.getCreatorById(id);
    return {
      success: true,
      data: creator,
    };
  }

  @Put(':id')
  async updateCreator(@Param('id') id: string, @Body() dto: UpdateCreatorDto) {
    const creator = await this.creatorsService.updateCreator(id, dto);
    return {
      success: true,
      message: 'Creator updated successfully',
      data: creator,
    };
  }

  @Post(':id/strike')
  async addStrike(
    @Param('id') id: string,
    @Body() dto: AddStrikeDto,
    @Request() req: any,
  ) {
    const creator = await this.creatorsService.addStrike(id, dto.reason, req.user.id);
    return {
      success: true,
      message: 'Strike added successfully',
      data: creator,
    };
  }

  @Post(':id/suspend')
  async suspendCreator(
    @Param('id') id: string,
    @Body() dto: SuspendCreatorDto,
    @Request() req: any,
  ) {
    const creator = await this.creatorsService.suspendCreator(id, dto.reason, req.user.id);
    return {
      success: true,
      message: 'Creator suspended successfully',
      data: creator,
    };
  }

  @Post(':id/reactivate')
  async reactivateCreator(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const creator = await this.creatorsService.reactivateCreator(id, req.user.id);
    return {
      success: true,
      message: 'Creator reactivated successfully',
      data: creator,
    };
  }
}
