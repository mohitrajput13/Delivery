import express from 'express';
import { register, login, verifyOtp, forgotPassword, resetPassword } from '../controllers/authController.js';
import { validateAuth } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateAuth('register'), register);
router.post('/login', validateAuth('login'), login);
router.post('/verify-otp', validateAuth('verify-otp'), verifyOtp);
router.post('/forgot-password', validateAuth('forgot-password'), forgotPassword);
router.post('/reset-password', validateAuth('reset-password'), resetPassword);

export default router;
