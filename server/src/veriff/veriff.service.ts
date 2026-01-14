import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as crypto from 'crypto';
import {
  CreateSessionDto,
  SessionResponseDto,
  VerificationStatusDto
} from './dto';
import {
  VERIFF_MODULE_OPTIONS,
  VERIFF_API_BASE_URL,
  VERIFF_ENDPOINTS
} from './constants/veriff.constants';
import type { VeriffModuleOptions } from './interfaces/veriff-config.interface';

@Injectable()
export class VeriffService {
  private readonly logger = new Logger(VeriffService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly webhookSecret: string;

  constructor(
    @Inject(VERIFF_MODULE_OPTIONS)
    private readonly options: VeriffModuleOptions,
  ) {
    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
    this.webhookSecret = options.webhookSecret || '';

    const baseUrl = options.baseUrl || VERIFF_API_BASE_URL;

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': this.apiKey,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request signing and error handling
   */
  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const method = config.method?.toLowerCase() || '';

        // Sign all requests
        if (['post', 'patch', 'put'].includes(method)) {
          // For requests with body, sign the payload
          const signature = this.generateSignature(config.data);
          config.headers['X-HMAC-SIGNATURE'] = signature;
        } else if (['get', 'delete'].includes(method)) {
          // For GET and DELETE, sign the session ID from URL
          // Extract session ID from URL like /v1/sessions/SESSION_ID/decision
          const url = config.url || '';
          const sessionIdMatch = url.match(/\/sessions\/([^\/]+)/);

          if (sessionIdMatch && sessionIdMatch[1]) {
            const sessionId = sessionIdMatch[1];
            const signature = this.generateSignatureFromString(sessionId);
            config.headers['X-HMAC-SIGNATURE'] = signature;
          } else {
            // If no session ID in URL, sign empty payload
            const signature = this.generateSignature({});
            config.headers['X-HMAC-SIGNATURE'] = signature;
          }
        }

        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Generate HMAC signature for API requests with JSON payload
   * According to Veriff API docs, signature is HMAC-SHA256 of the request body
   */
  private generateSignature(payload: any): string {
    // Convert payload to JSON string without extra spaces
    const payloadString = JSON.stringify(payload);

    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payloadString, 'utf8')
      .digest('hex');

    this.logger.debug(`Generated signature for payload: ${payloadString.substring(0, 50)}...`);
    this.logger.debug(`Signature: ${signature}`);

    return signature;
  }

  /**
   * Generate HMAC signature from a string (e.g., session ID for GET requests)
   */
  private generateSignatureFromString(value: string): string {
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(value, 'utf8')
      .digest('hex');

    this.logger.debug(`Generated signature for value: ${value}`);
    this.logger.debug(`Signature: ${signature}`);

    return signature;
  }

  /**
   * Verify webhook signature
   * Veriff sends HMAC-SHA256 of the raw payload body
   *
   * IMPORTANT: Must receive raw Buffer from request body for signature to match
   * @param payload - Raw request body as Buffer (not JSON string)
   * @param signature - HMAC signature from x-hmac-signature header
   */
  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    try {
      if (!this.webhookSecret) {
        this.logger.error('Webhook secret not configured - cannot verify signature');
        return false;
      }

      // Compute HMAC-SHA256 from raw buffer
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)  // Use Buffer directly, not string
        .digest('hex');

      this.logger.debug(`Received signature: ${signature}`);
      this.logger.debug(`Expected signature: ${expectedSignature}`);

      // Timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf-8'),
        Buffer.from(expectedSignature, 'utf-8'),
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      this.logger.error(
        `Veriff API error: ${status}`,
        JSON.stringify(data),
      );

      throw new HttpException(
        {
          statusCode: status,
          message: 'Veriff API request failed',
          error: data,
        },
        status,
      );
    } else if (error.request) {
      this.logger.error('No response from Veriff API:', error.message);
      throw new HttpException(
        'Unable to reach Veriff API',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      this.logger.error('Veriff request setup error:', error.message);
      throw new HttpException(
        'Failed to setup Veriff request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new verification session
   */
  async createSession(
    createSessionDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    try {
      this.logger.log('Creating Veriff session');

      const response = await this.axiosInstance.post<SessionResponseDto>(
        VERIFF_ENDPOINTS.SESSIONS,
        createSessionDto,
      );

      this.logger.log(
        `Session created successfully: ${response.data.verification.id}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get verification decision/status
   */
  async getVerificationStatus(
    sessionId: string,
  ): Promise<VerificationStatusDto> {
    try {
      this.logger.log(`Fetching verification status for session: ${sessionId}`);

      const endpoint = VERIFF_ENDPOINTS.DECISION.replace(
        ':sessionId',
        sessionId,
      );

      const response = await this.axiosInstance.get<VerificationStatusDto>(
        endpoint,
      );

      this.logger.log(
        `Verification status retrieved: ${response.data.verification.status}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get verification status for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get session media (images, videos)
   */
  async getSessionMedia(sessionId: string): Promise<any> {
    try {
      this.logger.log(`Fetching session media for: ${sessionId}`);

      const endpoint = VERIFF_ENDPOINTS.MEDIA.replace(':sessionId', sessionId);

      const response = await this.axiosInstance.get(endpoint);

      this.logger.log(`Session media retrieved successfully`);

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get session media for ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Resubmit a verification session
   */
  async resubmitSession(
    sessionId: string,
    updateData?: Partial<CreateSessionDto>,
  ): Promise<SessionResponseDto> {
    try {
      this.logger.log(`Resubmitting session: ${sessionId}`);

      const response = await this.axiosInstance.patch<SessionResponseDto>(
        `${VERIFF_ENDPOINTS.SESSIONS}/${sessionId}`,
        updateData,
      );

      this.logger.log(`Session resubmitted successfully: ${sessionId}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to resubmit session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a verification session
   */
  async cancelSession(sessionId: string): Promise<void> {
    try {
      this.logger.log(`Canceling session: ${sessionId}`);

      await this.axiosInstance.delete(
        `${VERIFF_ENDPOINTS.SESSIONS}/${sessionId}`,
      );

      this.logger.log(`Session canceled successfully: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Check if verification is approved
   */
  isVerificationApproved(verificationStatus: VerificationStatusDto): boolean {
    return (
      verificationStatus.verification.code === 9001 &&
      verificationStatus.verification.status === 'approved'
    );
  }

  /**
   * Check if verification requires resubmission
   */
  isResubmissionRequired(verificationStatus: VerificationStatusDto): boolean {
    return verificationStatus.verification.code === 9102;
  }

  /**
   * Check if verification is declined
   */
  isVerificationDeclined(verificationStatus: VerificationStatusDto): boolean {
    return (
      verificationStatus.verification.code === 9103 &&
      verificationStatus.verification.status === 'declined'
    );
  }
}
