import express from 'express';
import { adminLogin, forgotPassword, resetPassword } from '../controllers/adminAuthController.js';
import { validateAuth } from '../middleware/validation.js';
 
const router = express.Router();

router.post('/login', validateAuth('login'), adminLogin);
router.post('/forgot-password', validateAuth('forgot-password'), forgotPassword);
router.post('/reset-password', validateAuth('reset-password'), resetPassword);

export default router; 