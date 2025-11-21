import { Router } from 'express';
import { getItems } from '../controllers/aController.js';
const router = Router();
router.get('/items', getItems);
export default router;
//# sourceMappingURL=aRoutes.js.map