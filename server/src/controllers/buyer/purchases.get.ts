import type { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';

/**
 * GET /api/buyer/purchases
 * Get buyer's purchase history
 */
export async function getBuyerPurchases(req: Request, res: Response): Promise<void> {
  try {
    const sessionToken = req.headers['x-buyer-session'] as string;

    if (!sessionToken) {
      res.status(400).json({
        success: false,
        message: 'Buyer session token is required.',
      });
      return;
    }

    // Find buyer session
    const buyerSession = await prisma.buyerSession.findUnique({
      where: { sessionToken },
    });

    if (!buyerSession) {
      res.status(404).json({
        success: false,
        message: 'Buyer session not found.',
      });
      return;
    }

    if (buyerSession.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: 'Buyer session has expired.',
      });
      return;
    }

    // Get purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        buyerSessionId: buyerSession.id,
        status: 'COMPLETED',
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            contentType: true,
            price: true,
            creator: {
              select: {
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        purchases: purchases.map((purchase: any) => ({
          id: purchase.id,
          accessToken: purchase.accessToken,
          purchasedAt: purchase.createdAt,
          viewCount: purchase.viewCount,
          lastViewedAt: purchase.lastViewedAt,
          content: purchase.content,
        })),
      },
    });
  } catch (error) {
    console.error('Get buyer purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching purchases.',
    });
  }
}
