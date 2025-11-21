import prisma from '../utils/prisma.js';
import { generateSessionToken, getBuyerSessionExpiration } from '../utils/auth.js';
/**
 * Create or retrieve buyer session for anonymous purchases
 * Uses browser fingerprinting and session token
 */
export async function getBuyerSession(req, res) {
    try {
        const { fingerprint } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        // Check for existing session token in header
        const existingSessionToken = req.headers['x-buyer-session'];
        if (existingSessionToken) {
            // Verify existing session
            const existingSession = await prisma.buyerSession.findUnique({
                where: { sessionToken: existingSessionToken },
            });
            if (existingSession && existingSession.expiresAt > new Date()) {
                // Update last active time
                const updatedSession = await prisma.buyerSession.update({
                    where: { id: existingSession.id },
                    data: { lastActive: new Date() },
                });
                res.status(200).json({
                    success: true,
                    data: {
                        sessionToken: updatedSession.sessionToken,
                        expiresAt: updatedSession.expiresAt,
                    },
                });
                return;
            }
        }
        // Try to find session by fingerprint
        if (fingerprint) {
            const sessionByFingerprint = await prisma.buyerSession.findFirst({
                where: {
                    fingerprint,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { lastActive: 'desc' },
            });
            if (sessionByFingerprint) {
                // Update session
                const updatedSession = await prisma.buyerSession.update({
                    where: { id: sessionByFingerprint.id },
                    data: {
                        lastActive: new Date(),
                        ipAddress: ipAddress || null,
                        userAgent: userAgent || null,
                    },
                });
                res.status(200).json({
                    success: true,
                    data: {
                        sessionToken: updatedSession.sessionToken,
                        expiresAt: updatedSession.expiresAt,
                    },
                });
                return;
            }
        }
        // Create new session
        const newSession = await prisma.buyerSession.create({
            data: {
                sessionToken: generateSessionToken(),
                fingerprint: fingerprint || null,
                ipAddress: ipAddress || null,
                userAgent: userAgent || null,
                expiresAt: getBuyerSessionExpiration(),
            },
        });
        res.status(201).json({
            success: true,
            message: 'Buyer session created',
            data: {
                sessionToken: newSession.sessionToken,
                expiresAt: newSession.expiresAt,
            },
        });
    }
    catch (error) {
        console.error('Get buyer session error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating buyer session.',
        });
    }
}
/**
 * Get buyer's purchase history
 */
export async function getBuyerPurchases(req, res) {
    try {
        const sessionToken = req.headers['x-buyer-session'];
        if (!sessionToken) {
            res.status(400).json({
                success: false,
                message: 'Buyer session token is required.',
            });
            return;
        }
        // Find buyer session
        const buyerSession = await prisma.buyerSession.findUnique({
            where: { sessionToken },
        });
        if (!buyerSession) {
            res.status(404).json({
                success: false,
                message: 'Buyer session not found.',
            });
            return;
        }
        if (buyerSession.expiresAt < new Date()) {
            res.status(401).json({
                success: false,
                message: 'Buyer session has expired.',
            });
            return;
        }
        // Get purchases
        const purchases = await prisma.purchase.findMany({
            where: {
                buyerSessionId: buyerSession.id,
                status: 'COMPLETED',
            },
            include: {
                content: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        contentType: true,
                        price: true,
                        creator: {
                            select: {
                                displayName: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            success: true,
            data: {
                purchases: purchases.map((purchase) => ({
                    id: purchase.id,
                    accessToken: purchase.accessToken,
                    purchasedAt: purchase.createdAt,
                    viewCount: purchase.viewCount,
                    lastViewedAt: purchase.lastViewedAt,
                    content: purchase.content,
                })),
            },
        });
    }
    catch (error) {
        console.error('Get buyer purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching purchases.',
        });
    }
}
/**
 * Verify access to purchased content
 */
export async function verifyContentAccess(req, res) {
    try {
        const { accessToken } = req.params;
        const sessionToken = req.headers['x-buyer-session'];
        if (!accessToken) {
            res.status(400).json({
                success: false,
                message: 'Access token is required.',
            });
            return;
        }
        // Find purchase by access token
        const purchase = await prisma.purchase.findUnique({
            where: { accessToken },
            include: {
                content: {
                    include: {
                        contentItems: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                buyerSession: true,
            },
        });
        if (!purchase) {
            res.status(404).json({
                success: false,
                message: 'Purchase not found or access token is invalid.',
            });
            return;
        }
        // Verify purchase status
        if (purchase.status !== 'COMPLETED') {
            res.status(403).json({
                success: false,
                message: 'Purchase is not completed.',
            });
            return;
        }
        // Check if session token matches
        if (sessionToken && purchase.buyerSession.sessionToken !== sessionToken) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Session mismatch.',
            });
            return;
        }
        // Check if access has expired (if expiration is set)
        if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
            res.status(403).json({
                success: false,
                message: 'Access to this content has expired.',
            });
            return;
        }
        // Update view count and last viewed
        await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date(),
            },
        });
        // Also update content view count
        await prisma.content.update({
            where: { id: purchase.content.id },
            data: { viewCount: { increment: 1 } },
        });
        res.status(200).json({
            success: true,
            data: {
                content: {
                    id: purchase.content.id,
                    title: purchase.content.title,
                    description: purchase.content.description,
                    contentType: purchase.content.contentType,
                    s3Key: purchase.content.s3Key,
                    s3Bucket: purchase.content.s3Bucket,
                    duration: purchase.content.duration,
                    thumbnailUrl: purchase.content.thumbnailUrl,
                    contentItems: purchase.content.contentItems,
                },
                purchase: {
                    purchasedAt: purchase.createdAt,
                    viewCount: purchase.viewCount + 1,
                    lastViewedAt: new Date(),
                },
            },
        });
    }
    catch (error) {
        console.error('Verify content access error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying access.',
        });
    }
}
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
//# sourceMappingURL=buyerController.js.map