import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationService {
  getHello(): string {
    return 'Verification module - endpoints coming soon';
  }
}
