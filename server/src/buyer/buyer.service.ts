import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { S3Service } from '../s3/s3.service';
import * as crypto from 'crypto';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name);

  // Access control constants
  private readonly MAX_TRUSTED_DEVICES = 3;
  private readonly ACCESS_WINDOW_HOURS = 24;
  private readonly VERIFICATION_CODE_EXPIRY_MINUTES = 15;

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
    private s3Service: S3Service,
  ) {}

  /**
   * Create or retrieve a buyer session
   */
  async createOrGetSession(
    dto: CreateSessionDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Try to find existing session by fingerprint
    if (dto.fingerprint) {
      const existingSession = await this.prisma.buyerSession.findFirst({
        where: {
          fingerprint: dto.fingerprint,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingSession) {
        // Update last active
        await this.prisma.buyerSession.update({
          where: { id: existingSession.id },
          data: { lastActive: new Date() },
        });

        return {
          sessionToken: existingSession.sessionToken,
          expiresAt: existingSession.expiresAt,
        };
      }
    }

    // Create new session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await this.prisma.buyerSession.create({
      data: {
        sessionToken,
        fingerprint: dto.fingerprint || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        email: dto.email || null,
        expiresAt,
      },
    });

    return {
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
    };
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

    // Generate signed URL for thumbnail (valid for 24 hours)
    const thumbnailUrl = content.s3Key
      ? await this.s3Service.getSignedUrl(content.s3Key, 86400)
      : content.thumbnailUrl;

    // Return public content info (without S3 keys)
    return {
      id: content.id,
      title: content.title,
      description: content.description,
      price: content.price,
      thumbnailUrl,
      contentType: content.contentType,
      duration: content.duration,
      viewCount: content.viewCount,
      purchaseCount: content.purchaseCount,
      creator: creatorInfo,
    };
  }

  /**
   * Create a purchase and payment intent
   */
  async createPurchase(dto: CreatePurchaseDto, ipAddress?: string) {
    // Verify session exists
    const session = await this.prisma.buyerSession.findUnique({
      where: { sessionToken: dto.sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Update session email if provided
    if (dto.email && !session.email) {
      await this.prisma.buyerSession.update({
        where: { id: session.id },
        data: { email: dto.email },
      });
    }

    // Get content
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
      throw new NotFoundException('Content not found');
    }

    if (!content.isPublished || content.status !== 'APPROVED') {
      throw new BadRequestException('Content not available for purchase');
    }

    // Check if already purchased
    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        contentId: dto.contentId,
        buyerSessionId: session.id,
        status: 'COMPLETED',
      },
    });

    if (existingPurchase) {
      return {
        alreadyPurchased: true,
        accessToken: existingPurchase.accessToken,
      };
    }

    // Create payment intent - buyer pays 110% of content price
    const buyerAmount = content.price * 1.10;
    const paymentIntent = await this.stripeService.createPaymentIntent(
      buyerAmount,
      'usd',
      {
        contentId: content.id,
        contentTitle: content.title,
        creatorName: content.creator.displayName,
        sessionId: session.id.toString(), // Ensure string for Stripe metadata
      },
    );

    // Generate access token
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Create purchase record with fingerprinting
    const purchase = await this.prisma.purchase.create({
      data: {
        contentId: dto.contentId,
        buyerSessionId: session.id,
        amount: buyerAmount,           // Total buyer pays (110%)
        basePrice: content.price,       // Creator's set price (100%)
        currency: 'USD',
        paymentProvider: 'STRIPE',
        paymentIntentId: paymentIntent.id,
        status: 'PENDING',
        accessToken,
        purchaseFingerprint: dto.fingerprint || null,
        trustedFingerprints: dto.fingerprint ? [dto.fingerprint] : [],
        purchaseIpAddress: ipAddress || null,
      },
    });

    // Return purchase details directly to client
    // Client will use these values instead of relying on Stripe metadata
    return {
      purchaseId: purchase.id,
      clientSecret: paymentIntent.client_secret,
      amount: buyerAmount,            // Return total buyer pays (110%)
      accessToken: purchase.accessToken,
    };
  }

  /**
   * Verify purchase status
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
   * Get content access with signed URL (after purchase)
   */
  async getContentAccess(
    accessToken: string,
    fingerprint: string,
    ipAddress?: string,
  ) {
    const purchase = await this.prisma.purchase.findUnique({
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
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status !== 'COMPLETED') {
      throw new UnauthorizedException('Purchase not completed');
    }

    // Verify fingerprint
    if (!purchase.trustedFingerprints.includes(fingerprint)) {
      throw new UnauthorizedException('Device not verified');
    }

    // Check if access has expired (if expiration is set)
    if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
      throw new UnauthorizedException('Access has expired');
    }

    // Initialize 24-hour window on FIRST access
    if (!purchase.accessWindowStartedAt) {
      const now = new Date();
      const expiry = new Date(
        now.getTime() + this.ACCESS_WINDOW_HOURS * 60 * 60 * 1000,
      );

      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          accessWindowStartedAt: now,
          accessExpiresAt: expiry,
          firstAccessIpAddress: ipAddress,
        },
      });
    }

    // Update view count and last viewed
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Update content view count
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        viewCount: { increment: 1 },
      },
    });

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

    // Generate signed URLs for thumbnail and content items (valid for 24 hours)
    const thumbnailUrl = purchase.content.s3Key
      ? await this.s3Service.getSignedUrl(purchase.content.s3Key, 86400)
      : purchase.content.thumbnailUrl;

    // Generate signed URLs for all content items
    const contentItemsWithUrls = await Promise.all(
      purchase.content.contentItems.map(async (item) => ({
        id: item.id,
        s3Key: item.s3Key,
        s3Bucket: item.s3Bucket,
        order: item.order,
        signedUrl: await this.s3Service.getSignedUrl(item.s3Key, 86400),
      })),
    );

    // Return content info with signed URLs
    return {
      content: {
        id: purchase.content.id,
        title: purchase.content.title,
        description: purchase.content.description,
        contentType: purchase.content.contentType,
        s3Key: purchase.content.s3Key,
        s3Bucket: purchase.content.s3Bucket,
        thumbnailUrl,
        duration: purchase.content.duration,
        creator: creatorInfo,
        contentItems: contentItemsWithUrls,
      },
      purchase: {
        viewCount: purchase.viewCount + 1,
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
   */
  async confirmPurchase(purchaseId: string, paymentIntentId: string) {
    this.logger.log(`Confirming purchase ${purchaseId} with payment intent ${paymentIntentId}`);

    // Find the purchase
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        content: {
          include: {
            creator: true,
          },
        },
      },
    });

    if (!purchase) {
      this.logger.error(`Purchase not found: ${purchaseId}`);
      throw new NotFoundException('Purchase not found');
    }

    // Verify payment intent matches
    if (purchase.paymentIntentId !== paymentIntentId) {
      this.logger.error(`Payment intent mismatch for purchase ${purchaseId}: expected ${purchase.paymentIntentId}, got ${paymentIntentId}`);
      throw new BadRequestException('Payment intent mismatch');
    }

    // Verify payment intent with Stripe
    const paymentIntent = await this.stripeService.retrievePaymentIntent(
      paymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      this.logger.error(`Payment intent ${paymentIntentId} status is ${paymentIntent.status}, expected succeeded`);
      throw new BadRequestException('Payment not completed');
    }

    // If already completed, just return the data
    if (purchase.status === 'COMPLETED') {
      this.logger.log(`Purchase ${purchase.id} already completed, returning existing data`);
      return {
        purchaseId: purchase.id,
        accessToken: purchase.accessToken,
        status: purchase.status,
      };
    }

    // Update purchase status to COMPLETED
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'COMPLETED',
        transactionId: paymentIntentId,
      },
    });

    // Update content stats
    await this.prisma.content.update({
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
      ? purchase.basePrice * 0.90  // New pricing: 90% of base price
      : purchase.amount * 0.85;    // Legacy purchases: 85% of amount
    await this.prisma.creatorProfile.update({
      where: { id: purchase.content.creatorId },
      data: {
        totalEarnings: { increment: creatorEarnings },
        totalPurchases: { increment: 1 },
      },
    });

    this.logger.log(`Purchase ${purchase.id} confirmed by client`);

    return {
      purchaseId: purchase.id,
      accessToken: purchase.accessToken,
      status: 'COMPLETED',
    };
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
      include: {
        buyerSession: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Verify email matches
    if (purchase.buyerSession.email !== email) {
      throw new UnauthorizedException('Email mismatch');
    }

    // Check device limit
    if (purchase.trustedFingerprints.length >= this.MAX_TRUSTED_DEVICES) {
      throw new BadRequestException('Maximum devices reached');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
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

    // Add to trusted fingerprints
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        trustedFingerprints: [...purchase.trustedFingerprints, fingerprint],
        deviceVerificationCodes: codes.filter(
          (c) => c.code !== verificationCode,
        ),
      },
    });

    return { success: true };
  }
}
