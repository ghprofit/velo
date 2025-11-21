import prisma from '../../utils/prisma.js';
import { getVerificationDecision, verifyWebhookSignature, parseVerificationStatus, getVerificationStatusMessage, } from '../../services/veriffService.js';
/**
 * POST /api/verification/webhook
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
//# sourceMappingURL=webhook.post.js.map