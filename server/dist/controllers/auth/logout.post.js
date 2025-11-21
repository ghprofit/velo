import prisma from '../../utils/prisma.js';
/**
 * POST /api/auth/logout
 * Logout - invalidate refresh token
 */
export async function logoutUser(req, res) {
    try {
        const { refreshToken } = req.body;
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
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during logout.',
        });
    }
}
//# sourceMappingURL=logout.post.js.map