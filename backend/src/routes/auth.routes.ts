import { Router } from 'express';
import { login, logout, forgotPassword, resetPasswordController ,changePasswordController} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordController);
router.post('/logout', logout);
router.put('/change-password', authenticate, changePasswordController);

export default router;