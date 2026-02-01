import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { S3Service } from '../s3/s3.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import * as crypto from 'crypto';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name);

  // Access control configuration (loaded from environment)
  private readonly SESSION_EXPIRY_MS: number;
  private readonly MAX_TRUSTED_DEVICES: number;
  private readonly ACCESS_WINDOW_HOURS: number;
  private readonly ACCESS_BUFFER_MINUTES: number;
  private readonly VIEW_COOLDOWN_MS: number;
  private readonly VERIFICATION_CODE_EXPIRY_MINUTES = 15;

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
    private s3Service: S3Service,
    private redisService: RedisService,
    private config: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    // Load configuration from environment with defaults
    this.SESSION_EXPIRY_MS =
      (this.config.get<number>('BUYER_SESSION_EXPIRY_HOURS') || 24) * 60 * 60 * 1000;

    this.ACCESS_WINDOW_HOURS = 24;

    this.ACCESS_BUFFER_MINUTES = 30;

    this.MAX_TRUSTED_DEVICES =
      this.config.get<number>('BUYER_MAX_DEVICES') || 3;

    this.VIEW_COOLDOWN_MS =
      (this.config.get<number>('BUYER_VIEW_COOLDOWN_MINUTES') || 5) * 60 * 1000;

    this.logger.log('✓ Buyer service configuration loaded from environment');
  }

  /**
   * Create or retrieve a buyer session
   */
  async createOrGetSession(
    dto: CreateSessionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    id: string;
    sessionToken: string;
    fingerprint: string | null;
    ipAddress: string | null;
    expiresAt: Date;
  }> {
    // Bug #14 fix: Use transaction for atomic find-or-create
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Try to find existing valid session by fingerprint
        if (dto.fingerprint) {
          const existingSession = await tx.buyerSession.findFirst({
            where: {
              fingerprint: dto.fingerprint,
              expiresAt: { gt: new Date() },
            },
          });

          if (existingSession) {
            this.logger.log(
              `Returning existing session for fingerprint: ${dto.fingerprint}`,
            );

            // Update last active
            await tx.buyerSession.update({
              where: { id: existingSession.id },
              data: { lastActive: new Date() },
            });

            return {
              id: existingSession.id,
              sessionToken: existingSession.sessionToken,
              fingerprint: existingSession.fingerprint,
              ipAddress: existingSession.ipAddress,
              expiresAt: existingSession.expiresAt,
            };
          }
        }

        // Create new session only if not found
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY_MS);

        const session = await tx.buyerSession.create({
          data: {
            sessionToken,
            fingerprint: dto.fingerprint || null,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            email: dto.email || null,
            expiresAt,
          },
        });

        this.logger.log(`Created new buyer session: ${session.sessionToken}`);

        return {
          id: session.id,
          sessionToken: session.sessionToken,
          fingerprint: session.fingerprint,
          ipAddress: session.ipAddress,
          expiresAt: session.expiresAt,
        };
      });

      // Cache in Redis with full session data including fingerprint
      if (this.redisService.isAvailable()) {
        const cacheKey = `buyer_session:${result.sessionToken}`;
        const sessionData = {
          id: result.id,
          sessionToken: result.sessionToken,
          fingerprint: result.fingerprint,
          ipAddress: result.ipAddress,
          expiresAt: result.expiresAt
        };
        await this.redisService.set(cacheKey, JSON.stringify(sessionData), 300);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to create or get session:', error);
      throw new InternalServerErrorException('Failed to create session');
    }
  }

  /**
   * Validate session with fingerprint check and Redis caching (Bug #3)
   */
  private async validateSession(
    sessionToken: string,
    expectedFingerprint: string, // Bug #13 fix: Make fingerprint REQUIRED
    ipAddress?: string,
  ) {
    // Try Redis cache first for performance
    if (this.redisService.isAvailable()) {
      const cacheKey = `buyer_session:${sessionToken}`;
      const cachedSession = await this.redisService.get(cacheKey);

      if (cachedSession) {
        // Upstash Redis automatically deserializes JSON, check if already an object
        const session = typeof cachedSession === 'string' ? JSON.parse(cachedSession) : cachedSession;
        if (new Date(session.expiresAt) > new Date()) {
          // Bug #13 fix: ALWAYS validate fingerprint (no longer optional)
          if (session.fingerprint !== expectedFingerprint) {
            // Bug #12 fix: Don't log fingerprint values (security)
            this.logger.warn(
              `Fingerprint mismatch for cached session ${sessionToken}`,
            );
            throw new UnauthorizedException('Session authentication failed');
          }
          return session;
        }
      }
    }

    // Fetch from database
    const session = await this.prisma.buyerSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    // Bug #13 fix: ALWAYS validate fingerprint (no longer optional!)
    if (session.fingerprint !== expectedFingerprint) {
      // Bug #12 fix: Don't log fingerprint values (security)
      this.logger.warn(
        `Fingerprint mismatch for session ${sessionToken}`,
      );
      throw new UnauthorizedException('Session authentication failed');
    }

    // Bug #17 fix: Validate IP address (soft check - log warning but allow)
    if (ipAddress && session.ipAddress && session.ipAddress !== ipAddress) {
      this.logger.warn(
        `IP address changed for session ${sessionToken}: ${session.ipAddress} → ${ipAddress}`,
      );

      // Update session with new IP for tracking
      const updatedSession = await this.prisma.buyerSession.update({
        where: { id: session.id },
        data: { ipAddress },
      });

      // Invalidate old cache to prevent stale data (Bug #5)
      if (this.redisService.isAvailable()) {
        const cacheKey = `buyer_session:${sessionToken}`;
        await this.redisService.del(cacheKey);

        // Cache updated session
        await this.redisService.set(cacheKey, JSON.stringify(updatedSession), 300);
      }

      return updatedSession;
    }

    // Cache valid session for 5 minutes
    if (this.redisService.isAvailable()) {
      const cacheKey = `buyer_session:${sessionToken}`;
      await this.redisService.set(cacheKey, JSON.stringify(session), 300);
    }

    return session;
  }

  /**
   * Get content details for buyers (public info)
   */
  async getContentDetails(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            verificationStatus: true,
            allowBuyerProfileView: true,
          },
        },
        contentItems: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (!content.isPublished || content.status !== 'APPROVED') {
      throw new NotFoundException('Content not available');
    }

    // Filter creator info based on privacy settings
    const creatorInfo = content.creator.allowBuyerProfileView
      ? {
          id: content.creator.id,
          displayName: content.creator.displayName,
          profileImage: content.creator.profileImage,
          verificationStatus: content.creator.verificationStatus,
        }
      : {
          id: content.creator.id,
          displayName: content.creator.displayName,
          profileImage: null, // Hide profile image if privacy is disabled
          verificationStatus: content.creator.verificationStatus,
        };

    // Return public content info (without S3 keys)
    return {
      id: content.id,
      title: content.title,
      description: content.description,
      price: content.price,
      thumbnailUrl: content.thumbnailUrl,
      contentType: content.contentType,
      duration: content.duration,
      viewCount: content.viewCount,
      purchaseCount: content.purchaseCount,
      itemCount: content.contentItems.length,
      creator: creatorInfo,
    };
  }

  /**
   * Create a payment intent (purchase record created by webhook on payment success)
   * Bug fix: Only create payment intent here, not the purchase record
   * This prevents incomplete purchases from being saved to the database
   */
  async createPurchase(dto: CreatePurchaseDto, ipAddress?: string) {
    this.logger.log(`[PURCHASE] Starting payment intent creation for content: ${dto.contentId}`);
    this.logger.log(`[PURCHASE] IP Address: ${ipAddress}, Fingerprint: ${dto.fingerprint ? 'present' : 'missing'}`);

    try {
      // Validate session with fingerprint check (Bug #3)
      this.logger.log(`[PURCHASE] Validating session: ${dto.sessionToken}`);
      const session = await this.validateSession(
        dto.sessionToken,
        dto.fingerprint,
        ipAddress,
      );
      this.logger.log(`[PURCHASE] Session validated successfully: ${session.id}`);

      // Update session email if provided
      if (dto.email && !session.email) {
        this.logger.log(`[PURCHASE] Updating session with email: ${dto.email}`);
        await this.prisma.buyerSession.update({
          where: { id: session.id },
          data: { email: dto.email },
        });
        this.logger.log(`[PURCHASE] ✅ Session email updated successfully`);
      } else if (session.email) {
        this.logger.log(`[PURCHASE] Session already has email: ${session.email}`);
      } else {
        this.logger.warn(`[PURCHASE] ⚠️ No email provided in purchase request!`);
      }

      // Get content
      this.logger.log(`[PURCHASE] Fetching content: ${dto.contentId}`);
      const content = await this.prisma.content.findUnique({
        where: { id: dto.contentId },
        include: {
          creator: {
            select: {
              displayName: true,
            },
          },
        },
      });

      if (!content) {
        this.logger.error(`[PURCHASE] Content not found: ${dto.contentId}`);
        throw new NotFoundException('Content not found');
      }

      this.logger.log(`[PURCHASE] Content found: "${content.title}" by ${content.creator.displayName}`);
      this.logger.log(`[PURCHASE] Content status: isPublished=${content.isPublished}, status=${content.status}, price=$${content.price}`);

      if (!content.isPublished || content.status !== 'APPROVED') {
        this.logger.error(`[PURCHASE] Content not available: isPublished=${content.isPublished}, status=${content.status}`);
        throw new BadRequestException('Content not available for purchase');
      }

      // Bug #20 fix: Validate content has a valid price
      if (!content.price || content.price <= 0 || content.price > 9999999.99) {
        this.logger.error(`[PURCHASE] Invalid price: $${content.price}`);
        throw new BadRequestException(
          'Invalid content price',
        );
      }

      // Check if already purchased
      this.logger.log(`[PURCHASE] Checking for existing purchase`);
      const existingPurchase = await this.prisma.purchase.findFirst({
        where: {
          contentId: dto.contentId,
          buyerSessionId: session.id,
          status: 'COMPLETED',
        },
      });

      if (existingPurchase) {
        this.logger.warn(`[PURCHASE] Duplicate purchase detected: ${existingPurchase.id}`);
        return {
          alreadyPurchased: true,
          accessToken: existingPurchase.accessToken,
        };
      }

      // Create payment intent - buyer pays 110% of content price
      const buyerAmount = content.price * 1.1;
      this.logger.log(`[PURCHASE] Calculated amount: base=$${content.price}, buyer pays=$${buyerAmount} (110%)`);

      // Create Stripe payment intent with specific error handling (Bug #4)
      this.logger.log(`[PURCHASE] Creating Stripe PaymentIntent for $${buyerAmount}`);
      let paymentIntent: any;
      try {
        paymentIntent = await this.stripeService.createPaymentIntent(
          buyerAmount,
          'usd',
          {
            contentId: content.id,
            contentTitle: content.title,
            creatorName: content.creator.displayName,
            sessionId: session.id.toString(),
            basePrice: content.price.toString(),
            fingerprint: dto.fingerprint || '',
            ipAddress: ipAddress || '',
          },
        );
        this.logger.log(`[PURCHASE] PaymentIntent created successfully: ${paymentIntent.id}`);
      } catch (stripeError) {
        this.logger.error(
          '[PURCHASE] Stripe payment intent creation failed:',
          stripeError,
        );
        throw new BadRequestException(
          'Failed to initialize payment. Please try again.',
        );
      }

      // Create PENDING purchase record immediately
      // This ensures the content and session exist when webhook fires
      this.logger.log(`[PURCHASE] Creating PENDING purchase record for PaymentIntent ${paymentIntent.id}`);

      const crypto = require('crypto');
      const accessToken = crypto.randomBytes(32).toString('hex');

      const pendingPurchase = await this.prisma.purchase.create({
        data: {
          contentId: dto.contentId,
          buyerSessionId: session.id,
          amount: buyerAmount,
          basePrice: content.price,
          currency: 'USD',
          paymentProvider: 'STRIPE',
          paymentIntentId: paymentIntent.id,
          status: 'PENDING', // Will be updated to COMPLETED by webhook
          accessToken,
          purchaseFingerprint: dto.fingerprint,
          trustedFingerprints: dto.fingerprint ? [dto.fingerprint] : [],
          purchaseIpAddress: ipAddress,
        },
      });

      this.logger.log(`[PURCHASE] ✅ PENDING purchase created: ${pendingPurchase.id}. Webhook will confirm after payment succeeds.`);

      // Return payment details
      return {
        clientSecret: paymentIntent.client_secret,
        amount: buyerAmount, // Return total buyer pays (110%)
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      // Log with context (Bug #4)
      this.logger.error(`[PURCHASE] ❌ Payment intent creation FAILED for content ${dto.contentId}`);
      this.logger.error(`[PURCHASE] Error:`, error);
      if (error instanceof Error) {
        this.logger.error(`[PURCHASE] Error message: ${error.message}`);
        this.logger.error(`[PURCHASE] Error stack:`, error.stack);
      }

      // Re-throw with user-friendly message
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'An error occurred while processing your purchase. Please try again.',
      );
    }
  }

  /**
   * Verify purchase status
   */
  /**
   * Verify purchase status by ID
   */
  async verifyPurchase(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            contentType: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return {
      id: purchase.id,
      status: purchase.status,
      accessToken: purchase.accessToken,
      content: purchase.content,
    };
  }

  /**
   * Verify purchase by payment intent ID (for webhook polling)
   */
  async verifyPurchaseByPaymentIntent(paymentIntentId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { paymentIntentId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            contentType: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return {
      id: purchase.id,
      status: purchase.status,
      accessToken: purchase.accessToken,
      content: purchase.content,
    };
  }

  /**
   * Get content access with signed URL (after purchase)
   */
  async getContentAccess(accessToken: string, ipAddress?: string) {
    let purchase = await this.prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        content: {
          include: {
            creator: {
              select: {
                displayName: true,
                profileImage: true,
                allowBuyerProfileView: true,
              },
            },
            contentItems: true,
          },
        },
        buyerSession: true, // Bug #36: Include session for expiry check
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status !== 'COMPLETED') {
      throw new UnauthorizedException('Purchase not completed');
    }

    // Bug #36: Check if buyer session has expired
    if (purchase.buyerSession && purchase.buyerSession.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    // Check if access has expired (if expiration is set)
    if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
      throw new UnauthorizedException('Access has expired');
    }

    // Initialize 24-hour window on FIRST access (Bug #8 - with buffer)
    if (!purchase.accessWindowStartedAt) {
      const now = new Date();

      // Calculate expiry with buffer (24 hours + 30 minutes)
      const totalMinutes =
        this.ACCESS_WINDOW_HOURS * 60 + this.ACCESS_BUFFER_MINUTES;
      const expiryMs = totalMinutes * 60 * 1000;
      const expiry = new Date(now.getTime() + expiryMs);

      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          accessWindowStartedAt: now,
          firstAccessIpAddress: ipAddress, // Bug #17: Track IP for fraud detection
          accessExpiresAt: expiry
        },
      });
    }

    // Update view count and last viewed (Bug #11 & #21 fixes)
    const now = new Date();

    // Check if we should increment view count (Bug #21 - use config)
    const shouldIncrementView =
      !purchase.lastViewedAt ||
      now.getTime() - purchase.lastViewedAt.getTime() > this.VIEW_COOLDOWN_MS;

    if (shouldIncrementView) {
      // Bug #11 fix: Wrap both updates in transaction
      const updatedPurchase = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.purchase.update({
          where: { id: purchase!.id },
          data: {
            viewCount: { increment: 1 },
            lastViewedAt: now,
          },
        });

        await tx.content.update({
          where: { id: purchase!.contentId },
          data: {
            viewCount: { increment: 1 },
          },
        });

        return updated;
      });

      // Update purchase object with fresh data (Bug #8 fix)
      purchase = { ...purchase, viewCount: updatedPurchase.viewCount, lastViewedAt: updatedPurchase.lastViewedAt };

      this.logger.log(
        `View count incremented for purchase ${purchase.id} and content ${purchase.contentId}`,
      );
    } else {
      // Just update lastViewedAt without incrementing
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: { lastViewedAt: now },
      });

      this.logger.log(
        `View refreshed for purchase ${purchase.id} (within cooldown)`,
      );
    }

    // Filter creator info based on privacy settings
    const creatorInfo = purchase.content.creator.allowBuyerProfileView
      ? {
          displayName: purchase.content.creator.displayName,
          profileImage: purchase.content.creator.profileImage,
        }
      : {
          displayName: purchase.content.creator.displayName,
          profileImage: null, // Hide profile image even after purchase if privacy is disabled
        };

    // Generate signed URLs for content items (24-hour expiry)
    // Bug #39: Use Promise.allSettled to handle individual S3 failures gracefully
    this.logger.debug(`Generating signed URLs for ${purchase.content.contentItems.length} content items`);
    const urlResults = await Promise.allSettled(
      purchase.content.contentItems.map(async (item) => {
        const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400);
        return {
          id: item.id,
          s3Key: item.s3Key,
          s3Bucket: item.s3Bucket,
          order: item.order,
          signedUrl,
        };
      })
    );

    // Filter out failed results and log errors
    const contentItemsWithUrls = urlResults
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          this.logger.error(`Failed to generate signed URL for item ${index}: ${result.reason}`);
          return null;
        }
      })
      .filter(Boolean);

    this.logger.debug(`Generated ${contentItemsWithUrls.length}/${purchase.content.contentItems.length} signed URLs successfully`);

    // Return content info with signed URLs
    return {
      content: {
        id: purchase.content.id,
        title: purchase.content.title,
        description: purchase.content.description,
        contentType: purchase.content.contentType,
        s3Key: purchase.content.s3Key,
        s3Bucket: purchase.content.s3Bucket,
        thumbnailUrl: purchase.content.thumbnailUrl,
        duration: purchase.content.duration,
        creator: creatorInfo,
        contentItems: contentItemsWithUrls,
      },
      purchase: {
        viewCount: purchase.viewCount,
        purchasedAt: purchase.createdAt,
      },
    };
  }

  /**
   * Get all purchases for a session
   */
  async getSessionPurchases(sessionToken: string) {
    const session = await this.prisma.buyerSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const purchases = await this.prisma.purchase.findMany({
      where: {
        buyerSessionId: session.id,
        status: 'COMPLETED',
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            contentType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return purchases.map((p) => ({
      id: p.id,
      accessToken: p.accessToken,
      purchasedAt: p.createdAt,
      viewCount: p.viewCount,
      content: p.content,
    }));
  }

  /**
   * Confirm purchase after successful payment (client-side confirmation)
   * This provides immediate feedback while the webhook serves as backup
   * Uses idempotency keys and transactions to prevent race conditions (Bug #1, #10)
   */
  async confirmPurchase(
    purchaseId: string,
    paymentIntentId: string,
  ): Promise<{ purchaseId: string; accessToken: string; status: string }> {
    this.logger.log(`Confirming purchase ${purchaseId} with payment intent ${paymentIntentId}`);

    const idempotencyKey = `client_${paymentIntentId}`;

    try {
      const result = await this.prisma.$transaction(
      async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
          include: {
            content: {
              include: { creator: true },
            },
          },
        });

        if (!purchase) {
          this.logger.error(`Purchase not found: ${purchaseId}`);
          throw new NotFoundException('Purchase not found');
        }

        // Bug #12 fix: Validate content availability
        if (!purchase.content.isPublished) {
          this.logger.error(
            `Cannot complete purchase ${purchaseId}: content ${purchase.contentId} is no longer published`,
          );
          throw new BadRequestException(
            'Content is no longer available for purchase',
          );
        }

        if (purchase.content.status !== 'APPROVED') {
          this.logger.error(
            `Cannot complete purchase ${purchaseId}: content ${purchase.contentId} status is ${purchase.content.status}`,
          );
          throw new BadRequestException('Content is not approved for purchase');
        }

        // Verify payment intent matches
        if (purchase.paymentIntentId !== paymentIntentId) {
          this.logger.error(
            `Payment intent mismatch for purchase ${purchaseId}: expected ${purchase.paymentIntentId}, got ${paymentIntentId}`,
          );
          throw new BadRequestException('Payment intent mismatch');
        }

        // Idempotency check - prevent duplicate processing
        if (purchase.status === 'COMPLETED') {
          this.logger.log(
            `Purchase ${purchaseId} already completed by ${purchase.completedBy}`,
          );
          return {
            purchaseId: purchase.id,
            accessToken: purchase.accessToken,
            status: 'COMPLETED',
          };
        }

        // Verify payment with Stripe (outside transaction to avoid long-running tx)
        const paymentIntent = await this.stripeService.retrievePaymentIntent(
          paymentIntentId,
        );

        if (paymentIntent.status !== 'succeeded') {
          this.logger.error(
            `Payment intent ${paymentIntentId} status is ${paymentIntent.status}, expected succeeded`,
          );
          throw new BadRequestException('Payment not completed');
        }

        // Update purchase status
        const updatedPurchase = await tx.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'COMPLETED',
            transactionId: paymentIntentId,
            completionIdempotencyKey: idempotencyKey,
            completedBy: 'CLIENT',
            completedAt: new Date(),
          },
        });

        this.logger.log(
          `✅ Purchase ${updatedPurchase.id} updated to COMPLETED status`,
        );
        this.logger.log(
          `💾 Transaction ID: ${updatedPurchase.transactionId}`,
        );
        this.logger.log(
          `🔑 Access Token: ${updatedPurchase.accessToken.substring(0, 20)}...`,
        );

        // Update content stats
        await tx.content.update({
          where: { id: purchase.contentId },
          data: {
            purchaseCount: { increment: 1 },
            totalRevenue: { increment: purchase.amount },
          },
        });

        // Update creator earnings - 90% of base price
        // For new purchases: basePrice exists, creator gets 90% of basePrice
        // For old purchases (migration): basePrice is null, use old calculation (85% of amount)
        const creatorEarnings = purchase.basePrice
          ? purchase.basePrice * 0.9
          : purchase.amount * 0.85;

        // Calculate when earnings will be available (24 hours from now)
        const earningsPendingUntil = new Date();
        earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);

        // Update purchase with pending period
        await tx.purchase.update({
          where: { id: purchase.id },
          data: {
            earningsPendingUntil,
            earningsReleased: false,
          },
        });

        // Add earnings to PENDING balance (will move to available after 24hr)
        await tx.creatorProfile.update({
          where: { id: purchase.content.creatorId },
          data: {
            totalEarnings: { increment: creatorEarnings },
            pendingBalance: { increment: creatorEarnings }, // Add to pending
            totalPurchases: { increment: 1 },
          },
        });

        this.logger.log(
          `Purchase ${purchaseId} confirmed by CLIENT with idempotency key ${idempotencyKey}`,
        );
        this.logger.log(
          `💰 Creator earnings updated: +$${creatorEarnings.toFixed(2)}`,
        );

        return {
          purchaseId: purchase.id,
          accessToken: purchase.accessToken,
          status: 'COMPLETED',
          // Additional data for email/notification sending
          _internal: {
            contentId: purchase.contentId,
            creatorId: purchase.content.creatorId,
            creatorEarnings,
            amount: purchase.amount,
          },
        };
      },
      { maxWait: 5000, timeout: 10000 },
    );

    // Send emails and notifications AFTER transaction completes
    // This ensures purchase is finalized before sending communications
    // NOTE: Always check for COMPLETED status, regardless of whether we have _internal data
    // This handles both: (1) first-time completion and (2) idempotent returns
    if (result.status === 'COMPLETED') {
      this.logger.log(`[EMAIL] Processing emails for completed purchase ${result.purchaseId}`);

      // Fetch full data for emails (outside transaction for safety)
      const purchaseWithRelations = await this.prisma.purchase.findUnique({
        where: { id: result.purchaseId },
        include: {
          content: {
            include: {
              creator: {
                include: { user: true },
              },
            },
          },
          buyerSession: true,
        },
      });

      if (!purchaseWithRelations) {
        this.logger.error(`[EMAIL] ❌ Could not fetch purchase ${result.purchaseId} for email sending`);
      } else if (!purchaseWithRelations.content) {
        this.logger.error(`[EMAIL] ❌ Purchase ${result.purchaseId} has no content`);
      } else {
        const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
        const content = purchaseWithRelations.content;
        const creator = content.creator;

        // Calculate creator earnings from purchase data
        const creatorEarnings = purchaseWithRelations.basePrice
          ? purchaseWithRelations.basePrice * 0.9
          : purchaseWithRelations.amount * 0.85;

        // 1. Send purchase receipt to buyer
        const buyerEmail = purchaseWithRelations.buyerSession?.email;
        if (buyerEmail) {
          try {
            await this.emailService.sendPurchaseReceipt(buyerEmail, {
              buyer_email: buyerEmail,
              content_title: content.title,
              amount: purchaseWithRelations.amount.toFixed(2),
              date: new Date().toLocaleDateString(),
              access_link: `${clientUrl}/c/${purchaseWithRelations.contentId}?token=${purchaseWithRelations.accessToken}`,
              transaction_id: paymentIntentId,
            });
            this.logger.log(`[EMAIL] ✅ Purchase receipt sent to ${buyerEmail}`);
          } catch (error) {
            this.logger.error(`[EMAIL] ❌ Failed to send purchase receipt:`, error);
          }
        } else {
          this.logger.warn(`[EMAIL] ⚠️ No buyer email found for purchase ${result.purchaseId}`);
        }

        // 2. Send sale notification to creator
        if (creator && creator.user) {
          const creatorUser = creator.user;
          const creatorEmail = creatorUser.email;
          const creatorName = creator.displayName;
          try {
            await this.emailService.sendCreatorSaleNotification(creatorEmail, {
              creator_name: creatorName,
              content_title: content.title,
              sale_amount: (purchaseWithRelations.basePrice || purchaseWithRelations.amount).toFixed(2),
              creator_earnings: creatorEarnings.toFixed(2),
              date: new Date().toLocaleDateString(),
            });
            this.logger.log(`[EMAIL] ✅ Creator sale notification sent to ${creatorEmail}`);
          } catch (error) {
            this.logger.error(`[EMAIL] ❌ Failed to send creator sale notification:`, error);
          }

          // 3. Create in-app notification for creator
          try {
            await this.notificationsService.notify(
              creatorUser.id,
              NotificationType.PURCHASE_MADE,
              'Your Content Was Purchased!',
              `Your content "${content.title}" was purchased! You earned $${creatorEarnings.toFixed(2)}`,
              {
                purchaseId: result.purchaseId,
                contentId: purchaseWithRelations.contentId,
                earnings: creatorEarnings,
              },
            );
            this.logger.log(`[NOTIFICATION] ✅ Creator notification created`);
          } catch (error) {
            this.logger.error(`[NOTIFICATION] ❌ Failed to create creator notification:`, error);
          }

          // 4. Notify admins about purchase
          try {
            await this.notificationsService.notifyAdmins(
              NotificationType.PURCHASE_MADE,
              'New Purchase on Platform',
              `A new purchase was made: "${content.title}" by ${creatorName} for $${purchaseWithRelations.amount.toFixed(2)}`,
              {
                purchaseId: result.purchaseId,
                contentId: purchaseWithRelations.contentId,
                creatorName,
                amount: purchaseWithRelations.amount,
              },
            );
            this.logger.log(`[NOTIFICATION] ✅ Admin notifications created`);
          } catch (error) {
            this.logger.error(`[NOTIFICATION] ❌ Failed to notify admins:`, error);
          }
        } else {
          this.logger.warn(`[EMAIL] ⚠️ No creator found for purchase ${result.purchaseId}`);
        }
      }
    }

    // Return clean result (without internal data)
    return {
      purchaseId: result.purchaseId,
      accessToken: result.accessToken,
      status: result.status,
    };
    } catch (error: any) {
      // Handle unique constraint violation (P2002) - means already completed by webhook
      if (error.code === 'P2002' && error.meta?.target?.includes('completionIdempotencyKey')) {
        this.logger.log(
          `Purchase confirmation race detected - already completed by webhook for payment intent ${paymentIntentId}`,
        );

        // Fetch and return the existing completed purchase
        const existingPurchase = await this.prisma.purchase.findFirst({
          where: {
            id: purchaseId,
            paymentIntentId,
          },
        });

        if (existingPurchase && existingPurchase.status === 'COMPLETED') {
          return {
            purchaseId: existingPurchase.id,
            accessToken: existingPurchase.accessToken,
            status: 'COMPLETED',
          };
        }
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Check if buyer has access to content (pre-check before loading)
   */
  async checkAccessEligibility(accessToken: string, fingerprint: string) {
    this.logger.log(`Checking access eligibility for token: ${accessToken?.substring(0, 10)}...`);

    const purchase = await this.prisma.purchase.findUnique({
      where: { accessToken },
    });

    if (!purchase) {
      this.logger.warn(`No purchase found for access token: ${accessToken?.substring(0, 10)}...`);
      return {
        hasAccess: false,
        reason: 'Invalid purchase - not found',
      };
    }

    if (purchase.status !== 'COMPLETED') {
      this.logger.warn(`Purchase ${purchase.id} status is ${purchase.status}, expected COMPLETED`);
      return {
        hasAccess: false,
        reason: `Invalid purchase - status is ${purchase.status}`,
      };
    }

    // Check expiration
    if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
      return {
        hasAccess: false,
        isExpired: true,
        reason: 'Your 24-hour access has expired',
      };
    }

    // Check fingerprint
    const isTrusted = purchase.trustedFingerprints.includes(fingerprint);
    if (!isTrusted) {
      return {
        hasAccess: false,
        needsEmailVerification: true,
        reason: 'Accessing from new device',
        canAddMoreDevices:
          purchase.trustedFingerprints.length < this.MAX_TRUSTED_DEVICES,
      };
    }

    return {
      hasAccess: true,
      accessExpiresAt: purchase.accessExpiresAt,
      timeRemaining: purchase.accessExpiresAt
        ? purchase.accessExpiresAt.getTime() - Date.now()
        : null,
    };
  }

  /**
   * Request device verification via email
   */
  async requestDeviceVerification(
    accessToken: string,
    fingerprint: string,
    email: string,
  ) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { accessToken },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (!email) {
      throw new BadRequestException('No email provided');
    }

    // Check device limit
    if (purchase.trustedFingerprints.length >= this.MAX_TRUSTED_DEVICES) {
      throw new BadRequestException('Maximum devices reached');
    }

    // Generate 6-digit code (Bug #15: crypto-secure random)
    const code = (randomBytes(3).readUIntBE(0, 3) % 900000 + 100000).toString();
    const expiresAt = new Date(
      Date.now() + this.VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000,
    );

    // Store code
    const codes = (purchase.deviceVerificationCodes as any[]) || [];
    codes.push({ code, fingerprint, expiresAt: expiresAt.toISOString() });

    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: { deviceVerificationCodes: codes },
    });

    // Send email
    await this.emailService.sendEmail({
      to: email,
      subject: 'Device Verification Code',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Device Verification</h2>
        <p>You're attempting to access purchased content from a new device.</p>
        <p>Your verification code is:</p>
        <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 8px;">${code}</h1>
        <p>This code will expire in ${this.VERIFICATION_CODE_EXPIRY_MINUTES} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>`,
    });

    return { success: true };
  }

  /**
   * Verify device code and add to trusted devices
   */
  async verifyDeviceCode(
    accessToken: string,
    fingerprint: string,
    verificationCode: string,
  ) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { accessToken },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Find valid code
    const codes = (purchase.deviceVerificationCodes as any[]) || [];
    const validCode = codes.find(
      (c) =>
        c.code === verificationCode &&
        c.fingerprint === fingerprint &&
        new Date(c.expiresAt) > new Date(),
    );

    if (!validCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Add to trusted fingerprints and remove used verification code (Bug #14 & #22)
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        trustedFingerprints: [...purchase.trustedFingerprints, fingerprint],
        deviceVerificationCodes: codes.filter(
          (c) => c.code !== verificationCode && new Date(c.expiresAt) > new Date(), // Remove used code and expired codes
        ),
      },
    });

    return { success: true };
  }

  /**
   * Cleanup expired purchases and sessions
   * Runs daily at 2 AM to remove old data and prevent database bloat
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredData() {
    this.logger.log('Starting cleanup of expired purchases and sessions');

    try {
      // Delete purchases with expired access windows (older than 48 hours)
      const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const deletedPurchases = await this.prisma.purchase.deleteMany({
        where: {
          accessWindowStartedAt: {
            not: null,
          },
          OR: [
            {
              accessWindowStartedAt: {
                lt: new Date(
                  cutoffDate.getTime() -
                    this.ACCESS_WINDOW_HOURS * 60 * 60 * 1000 -
                    this.ACCESS_BUFFER_MINUTES * 60 * 1000,
                ),
              },
            },
            {
              // Also clean up failed/abandoned purchases older than 7 days
              status: 'FAILED',
              createdAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      });

      // Delete expired buyer sessions
      const deletedSessions = await this.prisma.buyerSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(
        `Cleanup completed successfully: ${deletedPurchases.count} purchases and ${deletedSessions.count} sessions deleted`,
      );

      return {
        success: true,
        deletedPurchases: deletedPurchases.count,
        deletedSessions: deletedSessions.count,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup expired data:', error);
      throw error;
    }
  }

  /**
   * Resend purchase invoice/receipt email
   * Used when the initial email wasn't sent or buyer requests a copy
   */
  async resendInvoice(purchaseId: string, buyerEmail: string): Promise<any> {
    this.logger.log(`[INVOICE] Attempting to resend invoice for purchase ${purchaseId} to ${buyerEmail}`);

    try {
      // Get purchase details with all relationships
      const purchase = await this.prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          content: {
            include: {
              creator: {
                include: { user: true },
              },
            },
          },
          buyerSession: true,
        },
      });

      if (!purchase) {
        this.logger.error(`[INVOICE] Purchase not found: ${purchaseId}`);
        throw new NotFoundException(`Purchase ${purchaseId} not found`);
      }

      if (purchase.status !== 'COMPLETED') {
        this.logger.error(
          `[INVOICE] Cannot resend invoice for incomplete purchase: ${purchaseId} (status: ${purchase.status})`,
        );
        throw new BadRequestException(
          `Cannot send invoice for purchase with status: ${purchase.status}`,
        );
      }

      // Verify the email matches either buyer session or provided email
      const sessionEmail = purchase.buyerSession?.email;
      if (sessionEmail && sessionEmail !== buyerEmail) {
        this.logger.warn(
          `[INVOICE] Email mismatch for purchase ${purchaseId}. Session: ${sessionEmail}, Requested: ${buyerEmail}`,
        );
        throw new UnauthorizedException('Email does not match purchase record');
      }

      const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';

      // Send the purchase receipt/invoice
      const emailResult = await this.emailService.sendPurchaseReceipt(
        buyerEmail,
        {
          buyer_email: buyerEmail,
          content_title: purchase.content.title,
          amount: purchase.amount.toFixed(2),
          date: purchase.createdAt.toLocaleDateString(),
          access_link: `${clientUrl}/c/${purchase.contentId}?token=${purchase.accessToken}`,
          transaction_id: purchase.transactionId || purchase.paymentIntentId || 'N/A',
        },
      );

      if (!emailResult.success) {
        this.logger.error(
          `[INVOICE] Failed to send invoice for purchase ${purchaseId}:`,
          emailResult.error,
        );
        throw new InternalServerErrorException(
          `Failed to send invoice: ${emailResult.error}`,
        );
      }

      this.logger.log(
        `[INVOICE] ✅ Invoice resent successfully for purchase ${purchaseId} to ${buyerEmail}. MessageId: ${emailResult.messageId}`,
      );

      return {
        success: true,
        message: 'Invoice sent successfully',
        messageId: emailResult.messageId,
      };
    } catch (error) {
      this.logger.error(`[INVOICE] Failed to resend invoice:`, error);
      throw error;
    }
  }
}
