import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { sendEmailOTP } from '../services/mailService.js';


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.json({
      status: 'success',
      data: { token, admin: adminObj }
    });

  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({ status: 'error', message: 'Error logging in' });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    admin.resetPasswordToken = hashedOtp;
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
    await admin.save();

    await sendEmailOTP(email, otp);

    res.json({
      status: 'success',
      message: 'OTP sent to email'
    });

  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({ status: "error", message: "Error processing request" });
  }
};

export const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired OTP"
      });
    }

    const match = await bcrypt.compare(otp, admin.resetPasswordToken);
    if (!match) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP"
      });
    }

    res.json({
      status: "success",
      message: "OTP verified successfully"
    });

  } catch (error) {
    logger.error("Verify forgot OTP error:", error);
    res.status(500).json({ status: "error", message: "Error verifying OTP" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;

    const admin = await Admin.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset token expired or invalid'
      });
    }

    admin.password = new_password;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;

    await admin.save();

    res.json({
      status: 'success',
      message: 'Password reset successful'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password'
    });
  }
};
