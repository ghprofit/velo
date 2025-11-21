import type { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';
import {
  verifyRefreshToken,
  generateTokenPair,
  getRefreshTokenExpiration,
} from '../../utils/auth.js';
import type { RefreshTokenInput } from '../../schemas/authSchemas.js';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshTokenInput;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
      return;
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found.',
      });
      return;
    }

    // Check if refresh token is expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please login again.',
      });
      return;
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive.',
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        token: tokens.refreshToken,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    // Send response
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while refreshing token.',
    });
  }
}
