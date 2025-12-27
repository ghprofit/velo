export declare class WebhookEventDto {
    id: string;
    feature: string;
    code: number;
    action: string;
    vendorData?: any;
}
export declare class WebhookDecisionDto {
    status: string;
    verification: {
        id: string;
        code: number;
        status: string;
        reason?: string;
        reasonCode?: number;
        person?: any;
        document?: any;
        decisionTime?: string;
        acceptanceTime?: string;
        vendorData?: string;
    };
}
//# sourceMappingURL=webhook-event.dto.d.ts.map