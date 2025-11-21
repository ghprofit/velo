import type { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';
import {
  hashPassword,
  generateTokenPair,
  getRefreshTokenExpiration,
} from '../../utils/auth.js';
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from '../../services/emailService.js';
import type { RegisterInput } from '../../schemas/authSchemas.js';

/**
 * POST /api/auth/register
 * Register a new creator account
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, displayName, firstName, lastName, country } = req.body as RegisterInput;

    // Validate input
    if (!email || !password || !displayName) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and display name are required.',
      });
      return;
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and creator profile in a transaction
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'CREATOR',
        creatorProfile: {
          create: {
            displayName,
            firstName: firstName || null,
            lastName: lastName || null,
            country: country || null,
          },
        },
      },
      include: {
        creatorProfile: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    // Send verification email (don't block registration if email fails)
    try {
      const verificationToken = await createEmailVerificationToken(user.id);
      await sendVerificationEmail(
        user.email,
        user.creatorProfile?.displayName || user.email,
        verificationToken
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          creatorProfile: {
            id: user.creatorProfile?.id,
            displayName: user.creatorProfile?.displayName,
            verificationStatus: user.creatorProfile?.verificationStatus,
          },
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
    });
  }
}
