import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  verifyEmailToken,
  markEmailAsVerified,
  sendWelcomeEmail,
} from '../../services/emailService.js';

const prisma = new PrismaClient();

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
      return;
    }

    // Verify the token
    const result = await verifyEmailToken(token);

    if (!result) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
      return;
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      include: { creatorProfile: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    if (user.emailVerified) {
      res.status(200).json({
        success: true,
        message: 'Email is already verified.',
        data: { alreadyVerified: true },
      });
      return;
    }

    // Mark email as verified
    await markEmailAsVerified(result.userId);

    // Send welcome email
    const displayName = user.creatorProfile?.displayName || user.email;
    await sendWelcomeEmail(user.email, displayName);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        userId: user.id,
        email: user.email,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during email verification.',
    });
  }
};
