import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  async createTicket(@Req() req: any, @Body() createTicketDto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.id, createTicketDto);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  async getUserTickets(@Req() req: any) {
    return this.supportService.getUserTickets(req.user.id);
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard)
  async getTicket(@Param('id') id: string, @Req() req: any) {
    return this.supportService.getTicketById(id, req.user.id);
  }
}
