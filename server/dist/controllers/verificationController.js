import prisma from '../utils/prisma.js';
import { createVerificationSession, getVerificationDecision, verifyWebhookSignature, parseVerificationStatus, getVerificationStatusMessage, } from '../services/veriffService.js';
/**
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
/**
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
/**
 * Handle Veriff webhook for verification decisions
 */
export async function handleVeriffWebhook(req, res) {
    try {
        const signature = req.headers['x-hmac-signature'];
        const payload = JSON.stringify(req.body);
        // Verify webhook signature
        if (!verifyWebhookSignature(payload, signature)) {
            console.error('Invalid webhook signature');
            res.status(401).json({
                success: false,
                message: 'Invalid signature',
            });
            return;
        }
        const event = req.body;
        // Get user ID from vendorData
        const userId = event.vendorData;
        if (!userId) {
            console.error('No vendorData in webhook event');
            res.status(400).json({
                success: false,
                message: 'Invalid webhook data',
            });
            return;
        }
        // Find creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            include: { user: true },
        });
        if (!creatorProfile) {
            console.error('Creator profile not found for user:', userId);
            res.status(404).json({
                success: false,
                message: 'Creator not found',
            });
            return;
        }
        // Parse verification status
        const verificationStatus = parseVerificationStatus(event.code);
        // Get detailed decision from Veriff
        let verificationNotes = '';
        let firstName;
        let lastName;
        let dateOfBirth;
        let country;
        try {
            const decision = await getVerificationDecision(event.id);
            if (decision.verification.person) {
                firstName = decision.verification.person.firstName;
                lastName = decision.verification.person.lastName;
                country = decision.verification.person.nationality;
                if (decision.verification.person.dateOfBirth) {
                    dateOfBirth = new Date(decision.verification.person.dateOfBirth);
                }
            }
            verificationNotes = `Decision code: ${event.code}, Status: ${decision.verification.status}`;
        }
        catch (error) {
            console.error('Failed to get verification decision:', error);
            verificationNotes = `Decision code: ${event.code}`;
        }
        // Update creator profile
        const updateData = {
            verificationStatus,
            veriffDecisionId: event.id,
            verificationNotes,
        };
        if (verificationStatus === 'VERIFIED') {
            updateData.verifiedAt = new Date();
            // Update KYC info if available
            if (firstName)
                updateData.firstName = firstName;
            if (lastName)
                updateData.lastName = lastName;
            if (dateOfBirth)
                updateData.dateOfBirth = dateOfBirth;
            if (country)
                updateData.country = country;
        }
        await prisma.creatorProfile.update({
            where: { id: creatorProfile.id },
            data: updateData,
        });
        // Create notification for user
        await prisma.notification.create({
            data: {
                userId,
                type: verificationStatus === 'VERIFIED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
                title: verificationStatus === 'VERIFIED' ? 'Identity Verified' : 'Verification Failed',
                message: getVerificationStatusMessage(verificationStatus),
            },
        });
        res.status(200).json({
            success: true,
            message: 'Webhook processed',
        });
    }
    catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
        });
    }
}
/**
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
        if (!creatorId || !status) {
            res.status(400).json({
                success: false,
                message: 'Creator ID and status are required.',
            });
            return;
        }
        const validStatuses = ['VERIFIED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Must be VERIFIED or REJECTED.',
            });
            return;
        }
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
                reason: notes,
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
//# sourceMappingURL=verificationController.js.map