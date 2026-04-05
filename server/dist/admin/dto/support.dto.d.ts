export declare class QuerySupportTicketsDto {
    search?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
}
export declare class UpdateTicketStatusDto {
    status: string;
}
export declare class UpdateTicketPriorityDto {
    priority: string;
}
export declare class AssignTicketDto {
    assignedTo: string;
}
export interface SupportStatsDto {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    urgentTickets: number;
    averageResponseTime: number;
}
//# sourceMappingURL=support.dto.d.ts.map