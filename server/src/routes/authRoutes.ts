import { Router } from 'express';
import { registerUser } from '../controllers/auth/register.post.js';
import { loginUser } from '../controllers/auth/login.post.js';
import { refreshToken } from '../controllers/auth/refresh.post.js';
import { logoutUser } from '../controllers/auth/logout.post.js';
import { getUserProfile } from '../controllers/auth/profile.get.js';
import { verifyEmail } from '../controllers/auth/verify-email.get.js';
import { resendVerificationEmail } from '../controllers/auth/resend-verification.post.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../schemas/authSchemas.js';

const router = Router();

// Public routes with validation
router.post('/register', validateBody(registerSchema), registerUser);
router.post('/login', validateBody(loginSchema), loginUser);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);
router.post('/logout', validateBody(logoutSchema), logoutUser);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authenticate, resendVerificationEmail);

// Protected routes
router.get('/profile', authenticate, getUserProfile);

export default router;
