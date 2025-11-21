import { verifyAccessToken } from '../utils/auth.js';
import prisma from '../utils/prisma.js';
/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const payload = verifyAccessToken(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token.',
            });
            return;
        }
        // Check if user exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or account is inactive.',
            });
            return;
        }
        // Attach user to request object
        req.user = {
            ...payload,
            id: user.id,
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed.',
        });
    }
}
/**
 * Middleware to check if user has required role
 */
export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.',
            });
            return;
        }
        next();
    };
}
/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuthenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = verifyAccessToken(token);
            if (payload) {
                const user = await prisma.user.findUnique({
                    where: { id: payload.userId },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                });
                if (user && user.isActive) {
                    req.user = {
                        ...payload,
                        id: user.id,
                    };
                }
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
}
//# sourceMappingURL=auth.js.map