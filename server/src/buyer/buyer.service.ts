import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import * as crypto from 'crypto';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
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
            bio: true,
            verificationStatus: true,
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
      creator: content.creator,
    };
  }

  /**
   * Create a purchase and payment intent
   */
  async createPurchase(dto: CreatePurchaseDto) {
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

    // Create payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      content.price,
      'usd',
      {
        contentId: content.id,
        contentTitle: content.title,
        creatorName: content.creator.displayName,
        sessionId: session.id,
      },
    );

    // Generate access token
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Create purchase record
    const purchase = await this.prisma.purchase.create({
      data: {
        contentId: dto.contentId,
        buyerSessionId: session.id,
        amount: content.price,
        currency: 'USD',
        paymentProvider: 'STRIPE',
        paymentIntentId: paymentIntent.id,
        status: 'PENDING',
        accessToken,
      },
    });

    return {
      purchaseId: purchase.id,
      clientSecret: paymentIntent.client_secret,
      amount: content.price,
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
  async getContentAccess(accessToken: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        content: {
          include: {
            creator: {
              select: {
                displayName: true,
                profileImage: true,
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

    // Check if access has expired (if expiration is set)
    if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
      throw new UnauthorizedException('Access has expired');
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

    // Return content info (S3 service will generate signed URLs separately)
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
        creator: purchase.content.creator,
        contentItems: purchase.content.contentItems.map((item) => ({
          id: item.id,
          s3Key: item.s3Key,
          s3Bucket: item.s3Bucket,
          order: item.order,
        })),
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
}
