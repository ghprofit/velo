import type { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';
import type { LogoutInput } from '../../schemas/authSchemas.js';

/**
 * POST /api/auth/logout
 * Logout - invalidate refresh token
 */
export async function logoutUser(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as LogoutInput;

    if (refreshToken) {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.',
    });
  }
}
