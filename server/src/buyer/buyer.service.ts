import { Injectable } from '@nestjs/common';

@Injectable()
export class BuyerService {
  getHello(): string {
    return 'Buyer module - endpoints coming soon';
  }
}
