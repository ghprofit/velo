import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private waitlistService: WaitlistService) {}

  @Post('join')
  async joinWaitlist(@Body() dto: JoinWaitlistDto) {
    return this.waitlistService.addToWaitlist(dto);
  }

  @Get('check/:email')
  async checkWaitlist(@Param('email') email: string) {
    return this.waitlistService.checkEmail(email);
  }

  @Get('count')
  async getCount() {
    return this.waitlistService.getWaitlistCount();
  }

  @Get('all')
  async getAllEntries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    return this.waitlistService.getAllWaitlistEntries(pageNum, limitNum);
  }

  @Delete(':email')
  async removeFromWaitlist(@Param('email') email: string) {
    return this.waitlistService.removeFromWaitlist(email);
  }
}
