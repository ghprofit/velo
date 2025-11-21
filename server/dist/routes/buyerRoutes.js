import { Router } from 'express';
import { createBuyerSession } from '../controllers/buyer/session.post.js';
import { getBuyerPurchases } from '../controllers/buyer/purchases.get.js';
import { verifyContentAccess } from '../controllers/buyer/access.get.js';
import { cleanupExpiredSessions } from '../controllers/buyer/cleanup.delete.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createBuyerSessionSchema, accessTokenParamSchema, } from '../schemas/buyerSchemas.js';
const router = Router();
// Buyer session management with validation
router.post('/session', validateBody(createBuyerSessionSchema), createBuyerSession);
router.get('/purchases', getBuyerPurchases);
router.get('/access/:accessToken', validateParams(accessTokenParamSchema), verifyContentAccess);
// Admin/scheduled task route
router.delete('/cleanup-sessions', cleanupExpiredSessions);
export default router;
//# sourceMappingURL=buyerRoutes.js.map