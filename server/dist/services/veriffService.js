"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationSession = createVerificationSession;
exports.getVerificationDecision = getVerificationDecision;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.parseVerificationStatus = parseVerificationStatus;
exports.getVerificationStatusMessage = getVerificationStatusMessage;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const VERIFF_API_KEY = process.env.VERIFF_API_KEY || '';
const VERIFF_BASE_URL = process.env.VERIFF_BASE_URL || 'https://stationapi.veriff.com';
const VERIFF_API_SECRET = process.env.VERIFF_API_SECRET || '';
async function createVerificationSession(userId, callback) {
    try {
        const payload = {
            verification: {
                callback,
                person: {
                    firstName: '',
                    lastName: '',
                },
                vendorData: userId,
                timestamp: new Date().toISOString(),
            },
        };
        const response = await axios_1.default.post(`${VERIFF_BASE_URL}/v1/sessions`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-CLIENT': VERIFF_API_KEY,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Veriff create session error:', error);
        throw new Error('Failed to create verification session');
    }
}
async function getVerificationDecision(sessionId) {
    try {
        const response = await axios_1.default.get(`${VERIFF_BASE_URL}/v1/sessions/${sessionId}/decision`, {
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-CLIENT': VERIFF_API_KEY,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Veriff get decision error:', error);
        throw new Error('Failed to get verification decision');
    }
}
function verifyWebhookSignature(payload, signature) {
    try {
        if (!VERIFF_API_SECRET) {
            console.warn('VERIFF_API_SECRET not configured');
            return false;
        }
        const hash = crypto_1.default
            .createHmac('sha256', VERIFF_API_SECRET)
            .update(payload)
            .digest('hex');
        return hash === signature;
    }
    catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
}
function parseVerificationStatus(code) {
    switch (code) {
        case 9001:
            return 'VERIFIED';
        case 9102:
            return 'REJECTED';
        case 9104:
            return 'EXPIRED';
        default:
            return 'PENDING';
    }
}
function getVerificationStatusMessage(status) {
    switch (status) {
        case 'VERIFIED':
            return 'Identity verification successful';
        case 'REJECTED':
            return 'Identity verification failed. Please try again with valid documents.';
        case 'EXPIRED':
            return 'Verification session expired. Please start a new verification.';
        case 'IN_PROGRESS':
            return 'Verification is being processed';
        case 'PENDING':
            return 'Waiting for verification to be completed';
        default:
            return 'Unknown verification status';
    }
}
//# sourceMappingURL=veriffService.js.map