import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [BuyerController],
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}
