import { Module } from '@nestjs/common';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VeriffModule } from '../veriff/veriff.module';

@Module({
  imports: [PrismaModule, VeriffModule.forRoot()],
  controllers: [CreatorsController],
  providers: [CreatorsService],
  exports: [CreatorsService],
})
export class CreatorsModule {}
