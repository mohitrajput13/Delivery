import express from 'express';
import { validateAuthAdmin } from '../middleware/validations/validationAdmin.js';
import {adminLogin,forgotPassword,verifyForgotOtp,resetPassword} from '../controllers/adminAuthController.js'
 
const router = express.Router();

router.post('/login', validateAuthAdmin('login'), adminLogin);
router.post('/verify_otp', validateAuthAdmin('verify-forgot-otp'), verifyForgotOtp);
router.post('/forget_password', validateAuthAdmin('forgot-password'), forgotPassword);
router.post('/reset_password', validateAuthAdmin('reset-password'), resetPassword);

export default router; 