import prisma from '../../utils/prisma.js';
import { getVerificationStatusMessage } from '../../services/veriffService.js';
/**
 * POST /api/verification/manual
 * Manually verify creator (Admin only)
 */
export async function manualVerification(req, res) {
    try {
        if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
            res.status(403).json({
                success: false,
                message: 'Admin access required.',
            });
            return;
        }
        const { creatorId, status, notes } = req.body;
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: { user: true },
        });
        if (!creatorProfile) {
            res.status(404).json({
                success: false,
                message: 'Creator not found.',
            });
            return;
        }
        // Update creator profile
        const updateData = {
            verificationStatus: status,
            verificationNotes: notes || `Manually ${status.toLowerCase()} by admin`,
        };
        if (status === 'VERIFIED') {
            updateData.verifiedAt = new Date();
        }
        await prisma.creatorProfile.update({
            where: { id: creatorId },
            data: updateData,
        });
        // Log admin action
        await prisma.adminAction.create({
            data: {
                adminId: req.user.id,
                action: `MANUAL_VERIFICATION_${status}`,
                targetType: 'CREATOR',
                targetId: creatorId,
                reason: notes || null,
            },
        });
        // Create notification
        await prisma.notification.create({
            data: {
                userId: creatorProfile.userId,
                type: status === 'VERIFIED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
                title: status === 'VERIFIED' ? 'Identity Verified' : 'Verification Rejected',
                message: getVerificationStatusMessage(status),
            },
        });
        res.status(200).json({
            success: true,
            message: `Creator ${status.toLowerCase()} successfully.`,
        });
    }
    catch (error) {
        console.error('Manual verification error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during manual verification.',
        });
    }
}
//# sourceMappingURL=manual.post.js.map