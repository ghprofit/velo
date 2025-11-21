import prisma from '../../utils/prisma.js';
/**
 * Clean up expired buyer sessions (should be run as a scheduled task)
 */
export async function cleanupExpiredSessions(req, res) {
    try {
        // Delete sessions older than their expiration date
        const result = await prisma.buyerSession.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
        res.status(200).json({
            success: true,
            message: `Cleaned up ${result.count} expired sessions.`,
            data: { deletedCount: result.count },
        });
    }
    catch (error) {
        console.error('Cleanup expired sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during cleanup.',
        });
    }
}
//# sourceMappingURL=cleanup.delete.js.map