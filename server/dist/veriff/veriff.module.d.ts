import { DynamicModule } from '@nestjs/common';
import { VeriffModuleOptions } from './interfaces/veriff-config.interface';
export declare class VeriffModule {
    static register(options: VeriffModuleOptions): DynamicModule;
    static registerAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => Promise<VeriffModuleOptions> | VeriffModuleOptions;
        inject?: any[];
    }): DynamicModule;
    static forRoot(): DynamicModule;
}
//# sourceMappingURL=veriff.module.d.ts.map