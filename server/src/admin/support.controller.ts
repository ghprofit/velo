import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  QuerySupportTicketsDto,
  UpdateTicketStatusDto,
  UpdateTicketPriorityDto,
  AssignTicketDto,
} from './dto/support.dto';

@Controller('admin/support')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('stats')
  async getSupportStats() {
    return this.supportService.getSupportStats();
  }

  @Get('tickets')
  async getAllTickets(@Query() query: QuerySupportTicketsDto) {
    return this.supportService.getAllTickets(query);
  }

  @Get('tickets/:id')
  async getTicketById(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @Put('tickets/:id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateTicketStatus(id, body.status);
  }

  @Put('tickets/:id/priority')
  async updateTicketPriority(
    @Param('id') id: string,
    @Body() body: UpdateTicketPriorityDto,
  ) {
    return this.supportService.updateTicketPriority(id, body.priority);
  }

  @Put('tickets/:id/assign')
  async assignTicket(@Param('id') id: string, @Body() body: AssignTicketDto) {
    return this.supportService.assignTicket(id, body.assignedTo);
  }

  @Delete('tickets/:id')
  async deleteTicket(@Param('id') id: string) {
    return this.supportService.deleteTicket(id);
  }
}
