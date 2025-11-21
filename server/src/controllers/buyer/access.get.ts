import type { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';

/**
 * GET /api/buyer/access/:accessToken
 * Verify access to purchased content
 */
export async function verifyContentAccess(req: Request, res: Response): Promise<void> {
  try {
    const { accessToken } = req.params;
    const sessionToken = req.headers['x-buyer-session'] as string;

    if (!accessToken) {
      res.status(400).json({
        success: false,
        message: 'Access token is required.',
      });
      return;
    }

    // Find purchase by access token
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        content: {
          include: {
            contentItems: {
              orderBy: { order: 'asc' },
            },
          },
        },
        buyerSession: true,
      },
    });

    if (!purchase) {
      res.status(404).json({
        success: false,
        message: 'Purchase not found or access token is invalid.',
      });
      return;
    }

    // Verify purchase status
    if (purchase.status !== 'COMPLETED') {
      res.status(403).json({
        success: false,
        message: 'Purchase is not completed.',
      });
      return;
    }

    // Check if session token matches
    if (sessionToken && purchase.buyerSession.sessionToken !== sessionToken) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Session mismatch.',
      });
      return;
    }

    // Check if access has expired (if expiration is set)
    if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
      res.status(403).json({
        success: false,
        message: 'Access to this content has expired.',
      });
      return;
    }

    // Update view count and last viewed
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Also update content view count
    await prisma.content.update({
      where: { id: purchase.content.id },
      data: { viewCount: { increment: 1 } },
    });

    res.status(200).json({
      success: true,
      data: {
        content: {
          id: purchase.content.id,
          title: purchase.content.title,
          description: purchase.content.description,
          contentType: purchase.content.contentType,
          s3Key: purchase.content.s3Key,
          s3Bucket: purchase.content.s3Bucket,
          duration: purchase.content.duration,
          thumbnailUrl: purchase.content.thumbnailUrl,
          contentItems: purchase.content.contentItems,
        },
        purchase: {
          purchasedAt: purchase.createdAt,
          viewCount: purchase.viewCount + 1,
          lastViewedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Verify content access error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying access.',
    });
  }
}
