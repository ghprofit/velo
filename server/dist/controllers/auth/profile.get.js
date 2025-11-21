import prisma from '../../utils/prisma.js';
/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
export async function getUserProfile(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                emailVerified: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                creatorProfile: {
                    select: {
                        id: true,
                        displayName: true,
                        bio: true,
                        profileImage: true,
                        coverImage: true,
                        verificationStatus: true,
                        verifiedAt: true,
                        firstName: true,
                        lastName: true,
                        country: true,
                        totalEarnings: true,
                        totalViews: true,
                        totalPurchases: true,
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching profile.',
        });
    }
}
//# sourceMappingURL=profile.get.js.map