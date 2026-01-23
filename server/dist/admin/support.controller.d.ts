import { SupportService } from './support.service';
import { QuerySupportTicketsDto, UpdateTicketStatusDto, UpdateTicketPriorityDto, AssignTicketDto } from './dto/support.dto';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    getSupportStats(): Promise<{
        success: boolean;
        data: import("./dto/support.dto").SupportStatsDto;
    }>;
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
    updateTicketStatus(id: string, body: UpdateTicketStatusDto): Promise<{
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
            message: string;
            status: string;
            assignedTo: string | null;
            resolvedAt: Date | null;
        };
    }>;
    updateTicketPriority(id: string, body: UpdateTicketPriorityDto): Promise<{
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
            message: string;
            status: string;
            assignedTo: string | null;
            resolvedAt: Date | null;
        };
    }>;
    assignTicket(id: string, body: AssignTicketDto): Promise<{
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
            message: string;
            status: string;
            assignedTo: string | null;
            resolvedAt: Date | null;
        };
    }>;
    deleteTicket(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=support.controller.d.ts.map