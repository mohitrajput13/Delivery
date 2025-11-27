import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import logger from '../utils/logger.js';


// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    const token = jwt.sign({ adminId: admin._id, role: admin.role }, config.jwtSecret, { expiresIn: '24h' });
    const adminObj = admin.toObject();
    delete adminObj.password;

    res.json({
      status: 'success',
      data: {
        token,
        admin: adminObj
      }
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
    const resetToken = Math.random().toString(36).slice(-8);
    const hashedToken = await bcrypt.hash(resetToken, 10);

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 3600000;

    await admin.save();

    const resetUrl = `${config.FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Admin Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;



    res.json({ status: 'success', message: 'Password reset link sent to email' });

  } catch (error) {
    logger.error('Admin forgot password error:', error);
    res.status(500).json({ status: 'error', message: 'Error processing request' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const admin = await Admin.findOne({
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        status: 'error',
        message: 'Password reset token is invalid or has expired'
      });
    }

    const isValidToken = await bcrypt.compare(token, admin.resetPasswordToken);
    if (!isValidToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reset token'
      });
    }

    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    logger.error('Admin reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password'
    });
  }
}; 