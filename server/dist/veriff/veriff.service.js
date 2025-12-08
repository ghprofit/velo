"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var VeriffService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriffService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const veriff_constants_1 = require("./constants/veriff.constants");
let VeriffService = VeriffService_1 = class VeriffService {
    constructor(options) {
        this.options = options;
        this.logger = new common_1.Logger(VeriffService_1.name);
        this.apiKey = options.apiKey;
        this.apiSecret = options.apiSecret;
        this.webhookSecret = options.webhookSecret || '';
        const baseUrl = options.baseUrl || veriff_constants_1.VERIFF_API_BASE_URL;
        this.axiosInstance = axios_1.default.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-CLIENT': this.apiKey,
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.axiosInstance.interceptors.request.use((config) => {
            const method = config.method?.toLowerCase() || '';
            if (['post', 'patch', 'put'].includes(method)) {
                const signature = this.generateSignature(config.data);
                config.headers['X-HMAC-SIGNATURE'] = signature;
            }
            else if (['get', 'delete'].includes(method)) {
                const url = config.url || '';
                const sessionIdMatch = url.match(/\/sessions\/([^\/]+)/);
                if (sessionIdMatch && sessionIdMatch[1]) {
                    const sessionId = sessionIdMatch[1];
                    const signature = this.generateSignatureFromString(sessionId);
                    config.headers['X-HMAC-SIGNATURE'] = signature;
                }
                else {
                    const signature = this.generateSignature({});
                    config.headers['X-HMAC-SIGNATURE'] = signature;
                }
            }
            return config;
        }, (error) => {
            this.logger.error('Request interceptor error:', error);
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            this.handleApiError(error);
            return Promise.reject(error);
        });
    }
    generateSignature(payload) {
        const payloadString = JSON.stringify(payload);
        const signature = crypto
            .createHmac('sha256', this.apiSecret)
            .update(payloadString, 'utf8')
            .digest('hex');
        this.logger.debug(`Generated signature for payload: ${payloadString.substring(0, 50)}...`);
        this.logger.debug(`Signature: ${signature}`);
        return signature;
    }
    generateSignatureFromString(value) {
        const signature = crypto
            .createHmac('sha256', this.apiSecret)
            .update(value, 'utf8')
            .digest('hex');
        this.logger.debug(`Generated signature for value: ${value}`);
        this.logger.debug(`Signature: ${signature}`);
        return signature;
    }
    verifyWebhookSignature(payload, signature) {
        try {
            if (!this.webhookSecret) {
                this.logger.warn('Webhook secret not configured, skipping verification');
                return false;
            }
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload, 'utf8')
                .digest('hex');
            this.logger.debug(`Received signature: ${signature}`);
            this.logger.debug(`Expected signature: ${expectedSignature}`);
            return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed:', error);
            return false;
        }
    }
    handleApiError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            this.logger.error(`Veriff API error: ${status}`, JSON.stringify(data));
            throw new common_1.HttpException({
                statusCode: status,
                message: 'Veriff API request failed',
                error: data,
            }, status);
        }
        else if (error.request) {
            this.logger.error('No response from Veriff API:', error.message);
            throw new common_1.HttpException('Unable to reach Veriff API', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        else {
            this.logger.error('Veriff request setup error:', error.message);
            throw new common_1.HttpException('Failed to setup Veriff request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createSession(createSessionDto) {
        try {
            this.logger.log('Creating Veriff session');
            const response = await this.axiosInstance.post(veriff_constants_1.VERIFF_ENDPOINTS.SESSIONS, createSessionDto);
            this.logger.log(`Session created successfully: ${response.data.verification.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create session:', error);
            throw error;
        }
    }
    async getVerificationStatus(sessionId) {
        try {
            this.logger.log(`Fetching verification status for session: ${sessionId}`);
            const endpoint = veriff_constants_1.VERIFF_ENDPOINTS.DECISION.replace(':sessionId', sessionId);
            const response = await this.axiosInstance.get(endpoint);
            this.logger.log(`Verification status retrieved: ${response.data.verification.status}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get verification status for session ${sessionId}:`, error);
            throw error;
        }
    }
    async getSessionMedia(sessionId) {
        try {
            this.logger.log(`Fetching session media for: ${sessionId}`);
            const endpoint = veriff_constants_1.VERIFF_ENDPOINTS.MEDIA.replace(':sessionId', sessionId);
            const response = await this.axiosInstance.get(endpoint);
            this.logger.log(`Session media retrieved successfully`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get session media for ${sessionId}:`, error);
            throw error;
        }
    }
    async resubmitSession(sessionId, updateData) {
        try {
            this.logger.log(`Resubmitting session: ${sessionId}`);
            const response = await this.axiosInstance.patch(`${veriff_constants_1.VERIFF_ENDPOINTS.SESSIONS}/${sessionId}`, updateData);
            this.logger.log(`Session resubmitted successfully: ${sessionId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to resubmit session ${sessionId}:`, error);
            throw error;
        }
    }
    async cancelSession(sessionId) {
        try {
            this.logger.log(`Canceling session: ${sessionId}`);
            await this.axiosInstance.delete(`${veriff_constants_1.VERIFF_ENDPOINTS.SESSIONS}/${sessionId}`);
            this.logger.log(`Session canceled successfully: ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cancel session ${sessionId}:`, error);
            throw error;
        }
    }
    isVerificationApproved(verificationStatus) {
        return (verificationStatus.verification.code === 9001 &&
            verificationStatus.verification.status === 'approved');
    }
    isResubmissionRequired(verificationStatus) {
        return verificationStatus.verification.code === 9102;
    }
    isVerificationDeclined(verificationStatus) {
        return (verificationStatus.verification.code === 9103 &&
            verificationStatus.verification.status === 'declined');
    }
};
exports.VeriffService = VeriffService;
exports.VeriffService = VeriffService = VeriffService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(veriff_constants_1.VERIFF_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], VeriffService);
//# sourceMappingURL=veriff.service.js.map