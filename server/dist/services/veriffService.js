import axios from 'axios';
import crypto from 'crypto';
const VERIFF_API_KEY = process.env.VERIFF_API_KEY || '';
const VERIFF_BASE_URL = process.env.VERIFF_BASE_URL || 'https://stationapi.veriff.com';
const VERIFF_API_SECRET = process.env.VERIFF_API_SECRET || '';
/**
 * Create a Veriff verification session
 */
export async function createVerificationSession(userId, callback) {
    try {
        const payload = {
            verification: {
                callback,
                person: {
                    firstName: '',
                    lastName: '',
                },
                vendorData: userId, // Store user ID for later reference
                timestamp: new Date().toISOString(),
            },
        };
        const response = await axios.post(`${VERIFF_BASE_URL}/v1/sessions`, payload, {
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
/**
 * Get verification decision from Veriff
 */
export async function getVerificationDecision(sessionId) {
    try {
        const response = await axios.get(`${VERIFF_BASE_URL}/v1/sessions/${sessionId}/decision`, {
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
/**
 * Verify Veriff webhook signature
 */
export function verifyWebhookSignature(payload, signature) {
    try {
        if (!VERIFF_API_SECRET) {
            console.warn('VERIFF_API_SECRET not configured');
            return false;
        }
        const hash = crypto
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
/**
 * Parse Veriff verification status
 */
export function parseVerificationStatus(code) {
    // Veriff decision codes
    // 9001 - approved
    // 9102 - declined
    // 9103 - resubmission requested
    // 9104 - expired
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
/**
 * Get human-readable verification status message
 */
export function getVerificationStatusMessage(status) {
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