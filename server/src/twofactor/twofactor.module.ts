import { Module } from '@nestjs/common';
import { TwofactorService } from './twofactor.service';
import { TwofactorController } from './twofactor.controller';

@Module({
  controllers: [TwofactorController],
  providers: [TwofactorService],
  exports: [TwofactorService], // Export service for use in other modules
})
export class TwofactorModule {}
