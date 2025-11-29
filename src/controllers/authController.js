import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { generateTokens } from "../services/generateTokens.js";
import { sendEmailOTP } from "../services/mailService.js";

export const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      country_code,
      mobile,
      email,
      password,
      address,
    } = req.body;

    if (!mobile || !country_code) {
      return res.status(200).json({
        status: "error",
        message: "Country code and mobile number are required",
      });
    }

    let existingUser = await User.findOne({ mobile, country_code });
    if (existingUser) {
      return res.status(200).json({
        status: "error",
        message: "Mobile number already registered",
      });
    }

    const user = new User({
      first_name,
      last_name,
      country_code,
      mobile,
      email: email || "",
      password: password || null,
      address: address || [],
      wallet: 0,
      authProvider: "",
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(200).json({
      status: "success",
      data: {
        token: accessToken,
        refreshToken: refreshToken,
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          country_code: user.country_code,
          mobile: user.mobile,
          email: user.email,
          address: user.address,
          wallet: user.wallet,
        },
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Error registering user",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { country_code, mobile, email, password } = req.body;

    if (mobile && country_code) {
      let user = await User.findOne({ mobile, country_code });

      if (!user) {
        return res.status(200).json({
          status: "error",
          message: "User does not exist. Please register first.",
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      return res.json({
        status: "success",
        message: "OTP sent successfully",
        data: { otp },
      });
    } else if (email && password) {
      let user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(200).json({
          status: "error",
          message: "User does not exist. Please register first.",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(200).json({
          status: "error",
          message: "Invalid email or password",
        });
      }
      const { accessToken, refreshToken } = generateTokens(user._id);

      return res.json({
        status: "success",
        message: "Login successful",
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            country_code: user.country_code,
            mobile: user.mobile,
            email: user.email,
            address: user.address,
            wallet: user.wallet,
          },
        },
      });
    }

    return res.status(200).json({
      status: "error",
      message: "Provide either mobile + country_code or email + password",
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error during login",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { country_code, mobile, otp } = req.body;

    const user = await User.findOne({
      mobile,
      country_code,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(200).json({
        status: "error",
        message: "Invalid or expired OTP",
      });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.json({
      status: "success",
      message: "OTP Verify Successful",
      data: {
        token: accessToken,
        refreshToken: refreshToken,
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          country_code: user.country_code,
          mobile: user.mobile,
          email: user.email,
          address: user.address,
          wallet: user.wallet,
        },
      },
    });
  } catch (error) {
    logger.error("Verify OTP error:", error);
    return res.status(500).json({
      status: "error",
      message: "OTP verification failed",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(200).json({
        status: "error",
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        status: "error",
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmailOTP(email, otp);

    res.json({
      status: "success",
      message: "Password reset OTP sent to your email",
      data: { otp },
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: "Error processing request",
    });
  }
};

export const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(200).json({
        status: "error",
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email,
      otp: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(200).json({
        status: "error",
        message: "Invalid or expired OTP",
      });
    }
    res.json({
      status: "success",
      message: "OTP Verified Successfully",
    });
  } catch (error) {
    logger.error("OTP Verify error:", error);
    res.status(500).json({
      status: "error",
      message: "Error verifying OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password) {
      return res.status(200).json({
        status: "error",
        message: "Email and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        status: "error",
        message: "User not found",
      });
    }

    user.password = new_password;

    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({
      status: "error",
      message: "Error resetting password",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(200).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    jwt.verify(refreshToken, config.jwtRefreshSecret, (err, decoded) => {
      if (err) {
        return res.status(200).json({
          status: "error",
          message: "Invalid or expired refresh token",
        });
      }

      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      return res.status(200).json({
        status: "success",
        message: "New access token generated",
        data: {
          token: newAccessToken,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
