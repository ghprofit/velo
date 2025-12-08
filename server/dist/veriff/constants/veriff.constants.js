"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_CODE = exports.VERIFICATION_STATUS = exports.VERIFF_ENDPOINTS = exports.VERIFF_API_BASE_URL = exports.VERIFF_MODULE_OPTIONS = void 0;
exports.VERIFF_MODULE_OPTIONS = 'VERIFF_MODULE_OPTIONS';
exports.VERIFF_API_BASE_URL = 'https://stationapi.veriff.com';
exports.VERIFF_ENDPOINTS = {
    SESSIONS: '/v1/sessions',
    DECISION: '/v1/sessions/:sessionId/decision',
    MEDIA: '/v1/sessions/:sessionId/media',
};
exports.VERIFICATION_STATUS = {
    CREATED: 'created',
    STARTED: 'started',
    SUBMITTED: 'submitted',
    RESUBMITTED: 'resubmitted',
    APPROVED: 'approved',
    DECLINED: 'declined',
    ABANDONED: 'abandoned',
    EXPIRED: 'expired',
};
exports.VERIFICATION_CODE = {
    APPROVED: 9001,
    RESUBMISSION_REQUESTED: 9102,
    DECLINED: 9103,
    EXPIRED: 9104,
    ABANDONED: 9105,
};
//# sourceMappingURL=veriff.constants.js.map