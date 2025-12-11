import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, CreatorsController, ContentController],
  providers: [AdminService, CreatorsService, ContentService],
  exports: [AdminService, CreatorsService, ContentService],
})
export class AdminModule {}
