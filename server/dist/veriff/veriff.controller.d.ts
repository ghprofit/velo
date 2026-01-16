import { Request } from 'express';
import { VeriffService } from './veriff.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, SessionResponseDto, VerificationStatusDto } from './dto';
export declare class VeriffController {
    private readonly veriffService;
    private readonly prisma;
    private readonly logger;
    constructor(veriffService: VeriffService, prisma: PrismaService);
    createSession(createSessionDto: CreateSessionDto): Promise<SessionResponseDto>;
    getVerificationStatus(sessionId: string): Promise<VerificationStatusDto>;
    getSessionMedia(sessionId: string): Promise<any>;
    resubmitSession(sessionId: string, updateData?: Partial<CreateSessionDto>): Promise<SessionResponseDto>;
    cancelSession(sessionId: string): Promise<void>;
    handleWebhook(request: Request): Promise<{
        received: boolean;
    }>;
    healthCheck(): {
        status: string;
        timestamp: string;
    };
    debugConfig(): any;
}
//# sourceMappingURL=veriff.controller.d.ts.map