import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { QueryCreatorsDto } from './dto/creators.dto';

@Controller('admin/creators')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Get()
  async getCreators(@Query() query: QueryCreatorsDto) {
    return this.creatorsService.getCreators(query);
  }

  @Get('stats')
  async getCreatorStats() {
    return this.creatorsService.getCreatorStats();
  }

  @Get(':id')
  async getCreatorById(@Param('id') id: string) {
    return this.creatorsService.getCreatorById(id);
  }
}
