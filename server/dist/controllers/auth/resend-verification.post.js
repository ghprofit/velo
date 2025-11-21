import { PrismaClient } from '@prisma/client';
import { createEmailVerificationToken, sendVerificationEmail, } from '../../services/emailService.js';
const prisma = new PrismaClient();
export const resendVerificationEmail = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            res.status(400).json({
                success: false,
                message: 'Email is already verified.',
            });
            return;
        }
        // Check for rate limiting (1 email per 2 minutes)
        const existingToken = await prisma.emailVerificationToken.findUnique({
            where: { userId },
        });
        if (existingToken) {
            const timeSinceCreation = Date.now() - existingToken.createdAt.getTime();
            const twoMinutesInMs = 2 * 60 * 1000;
            if (timeSinceCreation < twoMinutesInMs) {
                const remainingSeconds = Math.ceil((twoMinutesInMs - timeSinceCreation) / 1000);
                res.status(429).json({
                    success: false,
                    message: `Please wait ${remainingSeconds} seconds before requesting another verification email.`,
                    data: { retryAfter: remainingSeconds },
                });
                return;
            }
        }
        // Create new verification token
        const token = await createEmailVerificationToken(userId);
        // Send verification email
        const displayName = user.creatorProfile?.displayName || user.email;
        const emailSent = await sendVerificationEmail(user.email, displayName, token);
        if (!emailSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully.',
            data: { email: user.email },
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while sending verification email.',
        });
    }
};
//# sourceMappingURL=resend-verification.post.js.map