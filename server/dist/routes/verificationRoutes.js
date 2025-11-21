import { Router } from 'express';
import { initiateVerification } from '../controllers/verification/initiate.post.js';
import { getVerificationStatus } from '../controllers/verification/status.get.js';
import { handleVeriffWebhook } from '../controllers/verification/webhook.post.js';
import { manualVerification } from '../controllers/verification/manual.post.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { manualVerificationSchema, veriffWebhookSchema, } from '../schemas/verificationSchemas.js';
const router = Router();
// Creator verification routes (protected)
router.post('/initiate', authenticate, initiateVerification);
router.get('/status', authenticate, getVerificationStatus);
// Veriff webhook (public) with validation
router.post('/webhook', validateBody(veriffWebhookSchema), handleVeriffWebhook);
// Admin manual verification with validation
router.post('/manual', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validateBody(manualVerificationSchema), manualVerification);
export default router;
//# sourceMappingURL=verificationRoutes.js.map