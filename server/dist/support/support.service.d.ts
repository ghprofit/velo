import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
export declare class SupportService {
    private prisma;
    private s3Service;
    private readonly ALLOWED_MIME_TYPES;
    private readonly MAX_FILE_SIZE;
    private readonly MAX_TOTAL_SIZE;
    private readonly MAX_FILE_COUNT;
    constructor(prisma: PrismaService, s3Service: S3Service);
    private validateAttachments;
    private uploadAttachments;
    createTicket(userId: string | undefined, createTicketDto: CreateTicketDto): Promise<{
        id: string;
        message: string;
        attachmentCount: number;
    }>;
    getUserTickets(userId: string): Promise<({
        attachments: {
            id: string;
            createdAt: Date;
            contentType: string;
            s3Key: string;
            s3Bucket: string;
            fileSize: number;
            order: number;
            fileName: string;
            ticketId: string;
        }[];
    } & {
        subject: string;
        message: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        status: string;
        priority: string;
        assignedTo: string | null;
        resolvedAt: Date | null;
    })[]>;
    getTicketById(id: string, userId?: string): Promise<({
        attachments: {
            id: string;
            createdAt: Date;
            contentType: string;
            s3Key: string;
            s3Bucket: string;
            fileSize: number;
            order: number;
            fileName: string;
            ticketId: string;
        }[];
    } & {
        subject: string;
        message: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        status: string;
        priority: string;
        assignedTo: string | null;
        resolvedAt: Date | null;
    }) | null>;
}
//# sourceMappingURL=support.service.d.ts.map