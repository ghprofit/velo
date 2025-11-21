import type { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';
import { generateSessionToken, getBuyerSessionExpiration } from '../../utils/auth.js';
import type { CreateBuyerSessionInput } from '../../schemas/buyerSchemas.js';

/**
 * POST /api/buyer/session
 * Create or retrieve buyer session for anonymous purchases
 * Uses browser fingerprinting and session token
 */
export async function createBuyerSession(req: Request, res: Response): Promise<void> {
  try {
    const { fingerprint } = req.body as CreateBuyerSessionInput;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check for existing session token in header
    const existingSessionToken = req.headers['x-buyer-session'] as string;

    if (existingSessionToken) {
      // Verify existing session
      const existingSession = await prisma.buyerSession.findUnique({
        where: { sessionToken: existingSessionToken },
      });

      if (existingSession && existingSession.expiresAt > new Date()) {
        // Update last active time
        const updatedSession = await prisma.buyerSession.update({
          where: { id: existingSession.id },
          data: { lastActive: new Date() },
        });

        res.status(200).json({
          success: true,
          data: {
            sessionToken: updatedSession.sessionToken,
            expiresAt: updatedSession.expiresAt,
          },
        });
        return;
      }
    }

    // Try to find session by fingerprint
    if (fingerprint) {
      const sessionByFingerprint = await prisma.buyerSession.findFirst({
        where: {
          fingerprint,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastActive: 'desc' },
      });

      if (sessionByFingerprint) {
        // Update session
        const updatedSession = await prisma.buyerSession.update({
          where: { id: sessionByFingerprint.id },
          data: {
            lastActive: new Date(),
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
          },
        });

        res.status(200).json({
          success: true,
          data: {
            sessionToken: updatedSession.sessionToken,
            expiresAt: updatedSession.expiresAt,
          },
        });
        return;
      }
    }

    // Create new session
    const newSession = await prisma.buyerSession.create({
      data: {
        sessionToken: generateSessionToken(),
        fingerprint: fingerprint || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt: getBuyerSessionExpiration(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Buyer session created',
      data: {
        sessionToken: newSession.sessionToken,
        expiresAt: newSession.expiresAt,
      },
    });
  } catch (error) {
    console.error('Get buyer session error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating buyer session.',
    });
  }
}
