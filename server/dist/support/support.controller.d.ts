import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
export declare class SupportController {
    private supportService;
    constructor(supportService: SupportService);
    createTicket(req: any, createTicketDto: CreateTicketDto): Promise<{
        id: string;
        message: string;
        attachmentCount: number;
    }>;
    getUserTickets(req: any): Promise<({
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
        priority: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        userId: string | null;
        status: string;
        assignedTo: string | null;
        resolvedAt: Date | null;
    })[]>;
    getTicket(id: string, req: any): Promise<({
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
        priority: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        userId: string | null;
        status: string;
        assignedTo: string | null;
        resolvedAt: Date | null;
    }) | null>;
}
//# sourceMappingURL=support.controller.d.ts.map