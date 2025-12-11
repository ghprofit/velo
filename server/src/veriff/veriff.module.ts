import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VeriffService } from './veriff.service';
import { VeriffController } from './veriff.controller';
import { PrismaModule } from '../prisma/prisma.module';
import {
  VERIFF_MODULE_OPTIONS,
} from './constants/veriff.constants';
import { VeriffModuleOptions } from './interfaces/veriff-config.interface';

@Module({})
export class VeriffModule {
  /**
   * Register VeriffModule synchronously with options
   */
  static register(options: VeriffModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: VERIFF_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: VeriffModule,
      controllers: [VeriffController],
      providers: [optionsProvider, VeriffService],
      exports: [VeriffService],
    };
  }

  /**
   * Register VeriffModule asynchronously with ConfigService
   */
  static registerAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<VeriffModuleOptions> | VeriffModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const optionsProvider: Provider = {
      provide: VERIFF_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: VeriffModule,
      imports: options.imports || [],
      controllers: [VeriffController],
      providers: [optionsProvider, VeriffService],
      exports: [VeriffService],
    };
  }

  /**
   * Register VeriffModule with environment variables using ConfigService
   */
  static forRoot(): DynamicModule {
    return {
      module: VeriffModule,
      imports: [ConfigModule, PrismaModule],
      controllers: [VeriffController],
      providers: [
        {
          provide: VERIFF_MODULE_OPTIONS,
          useFactory: (configService: ConfigService) => ({
            apiKey: configService.get<string>('VERIFF_API_KEY'),
            apiSecret: configService.get<string>('VERIFF_API_SECRET'),
            baseUrl: configService.get<string>('VERIFF_BASE_URL'),
            webhookSecret: configService.get<string>('VERIFF_WEBHOOK_SECRET'),
          }),
          inject: [ConfigService],
        },
        VeriffService,
      ],
      exports: [VeriffService],
    };
  }
}
