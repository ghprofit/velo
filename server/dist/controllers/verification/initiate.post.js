import prisma from '../../utils/prisma.js';
import { createVerificationSession } from '../../services/veriffService.js';
/**
 * POST /api/verification/initiate
 * Initiate Veriff verification session for creator
 */
export async function initiateVerification(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        // Check if user has creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!creatorProfile) {
            res.status(404).json({
                success: false,
                message: 'Creator profile not found.',
            });
            return;
        }
        // Check if already verified
        if (creatorProfile.verificationStatus === 'VERIFIED') {
            res.status(400).json({
                success: false,
                message: 'Creator is already verified.',
            });
            return;
        }
        // Create Veriff session
        const callbackUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/verification/webhook`;
        const sessionData = await createVerificationSession(req.user.id, callbackUrl);
        // Update creator profile with session ID
        await prisma.creatorProfile.update({
            where: { id: creatorProfile.id },
            data: {
                veriffSessionId: sessionData.verification.id,
                verificationStatus: 'IN_PROGRESS',
            },
        });
        res.status(200).json({
            success: true,
            message: 'Verification session created',
            data: {
                sessionId: sessionData.verification.id,
                verificationUrl: sessionData.verification.url,
            },
        });
    }
    catch (error) {
        console.error('Initiate verification error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while initiating verification.',
        });
    }
}
//# sourceMappingURL=initiate.post.js.map