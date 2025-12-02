import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getRoot() {
    return {
      success: true,
      message: 'VeloLink API is running',
      data: this.appService.getAppInfo(),
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      success: true,
      data: this.appService.getHealth(),
    };
  }
}
