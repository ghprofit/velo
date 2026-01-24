import { PrismaService } from '../prisma/prisma.service';
import { QuerySupportTicketsDto, SupportStatsDto } from './dto/support.dto';
export declare class SupportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSupportStats(): Promise<SupportStatsDto>;
    getAllTickets(query: QuerySupportTicketsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string | null;
            userEmail: string;
            subject: string;
            message: string;
            status: string;
            priority: string;
            assignedTo: string | null;
            attachmentCount: number;
            createdAt: Date;
            updatedAt: Date;
            resolvedAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTicketById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            userId: string | null;
            userEmail: string;
            subject: string;
            message: string;
            status: string;
            priority: string;
            assignedTo: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            resolvedAt: Date | null;
        };
        message?: undefined;
    }>;
    updateTicketStatus(id: string, status: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            subject: string;
            priority: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            status: string;
            message: string;
            assignedTo: string | null;
            resolvedAt: Date | null;
        };
    }>;
    updateTicketPriority(id: string, priority: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            subject: string;
            priority: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            status: string;
            message: string;
            assignedTo: string | null;
            resolvedAt: Date | null;
        };
    }>;
    assignTicket(id: string, assignedTo: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            subject: string;
            priority: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            status: string;
            message: string;
            assignedTo: string | null;
            resolvedAt: Date | null;
        };
    }>;
    deleteTicket(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=support.service.d.ts.map