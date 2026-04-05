export declare const VERIFF_MODULE_OPTIONS = "VERIFF_MODULE_OPTIONS";
export declare const VERIFF_API_BASE_URL = "https://stationapi.veriff.com";
export declare const VERIFF_ENDPOINTS: {
    readonly SESSIONS: "/v1/sessions";
    readonly DECISION: "/v1/sessions/:sessionId/decision";
    readonly MEDIA: "/v1/sessions/:sessionId/media";
};
export declare const VERIFICATION_STATUS: {
    readonly CREATED: "created";
    readonly STARTED: "started";
    readonly SUBMITTED: "submitted";
    readonly RESUBMITTED: "resubmitted";
    readonly APPROVED: "approved";
    readonly DECLINED: "declined";
    readonly ABANDONED: "abandoned";
    readonly EXPIRED: "expired";
};
export declare const VERIFICATION_CODE: {
    readonly APPROVED: 9001;
    readonly RESUBMISSION_REQUESTED: 9102;
    readonly DECLINED: 9103;
    readonly EXPIRED: 9104;
    readonly ABANDONED: 9105;
};
//# sourceMappingURL=veriff.constants.d.ts.map