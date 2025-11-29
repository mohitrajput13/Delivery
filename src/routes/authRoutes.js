import express from 'express';
import { register, login, verifyOtp, forgotPassword, resetPassword, refreshToken, verifyForgotOtp } from '../controllers/authController.js';
import { validateAuth } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateAuth('register'), register);
router.post('/login', validateAuth('login'), login);
router.post('/verify_otp', validateAuth('verify-otp'), verifyOtp);
router.post('/refresh_token', refreshToken);
router.post('/verify_forget_otp',validateAuth('verify-forget-otp'),verifyForgotOtp);
router.post('/forget_password', validateAuth('forgot-password'), forgotPassword);
router.post('/reset_password', validateAuth('reset-password'), resetPassword);

export default router;
