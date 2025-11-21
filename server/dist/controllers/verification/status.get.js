import prisma from '../../utils/prisma.js';
import { getVerificationStatusMessage } from '../../services/veriffService.js';
/**
 * GET /api/verification/status
 * Get verification status for creator
 */
export async function getVerificationStatus(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: req.user.id },
            select: {
                verificationStatus: true,
                verifiedAt: true,
                verificationNotes: true,
                veriffSessionId: true,
            },
        });
        if (!creatorProfile) {
            res.status(404).json({
                success: false,
                message: 'Creator profile not found.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                status: creatorProfile.verificationStatus,
                verifiedAt: creatorProfile.verifiedAt,
                message: getVerificationStatusMessage(creatorProfile.verificationStatus),
                notes: creatorProfile.verificationNotes,
            },
        });
    }
    catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching verification status.',
        });
    }
}
//# sourceMappingURL=status.get.js.map