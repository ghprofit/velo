import { Module } from '@nestjs/common';
import { TwofactorService } from './twofactor.service';
import { TwofactorController } from './twofactor.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TwofactorController],
  providers: [TwofactorService],
  exports: [TwofactorService], // Export service for use in other modules
})
export class TwofactorModule {}
