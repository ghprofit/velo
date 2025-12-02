import { Controller, Get } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get()
  getHello(): string {
    return this.verificationService.getHello();
  }
}
