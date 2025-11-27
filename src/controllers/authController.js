import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export const register = async (req, res) => {
    try {
        const { first_name, last_name, country_code, mobile, email, password, address } = req.body;

        if (!mobile || !country_code) {
            return res.status(400).json({
                status: "error",
                message: "Country code and mobile number are required"
            });
        }

        let existingUser = await User.findOne({ mobile, country_code });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "Mobile number already registered"
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
            authProvider: ""
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: "24h" });

        res.status(201).json({
            status: "success",
            data: {
                token,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    country_code: user.country_code,
                    mobile: user.mobile,
                    email: user.email,
                    address: user.address,
                    wallet: user.wallet
                }
            }
        });

    } catch (error) {
        logger.error("Registration error:", error);
        res.status(500).json({
            status: "error",
            message: "Error registering user"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { country_code, mobile } = req.body;

        if (!mobile || !country_code) {
            return res.status(400).json({
                status: "error",
                message: "Country code and mobile number are required"
            });
        }

        // Check if user exists
        let user = await User.findOne({ mobile, country_code });

        // If user does NOT exist → send message only, do NOT send OTP
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User does not exist. Please register first."
            });
        }

        // Generate OTP for existing user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        return res.json({
            status: "success",
            message: "OTP sent successfully",
            data: otp
        });

    } catch (error) {
        logger.error("Login error:", error);
        return res.status(500).json({
            status: "error",
            message: "Error sending OTP"
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
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or expired OTP"
            });
        }

        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: "24h" });

        res.json({
            status: "success",
            message: "Login successful",
            data: {
                token,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    country_code: user.country_code,
                    mobile: user.mobile,
                    email: user.email,
                    address: user.address,
                    wallet: user.wallet
                }
            }
        });

    } catch (error) {
        logger.error("Verify OTP error:", error);
        res.status(500).json({
            status: "error",
            message: "OTP verification failed"
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { country_code, mobile } = req.body;

        if (!mobile || !country_code) {
            return res.status(400).json({
                status: "error",
                message: "Country code and mobile number are required"
            });
        }

        const user = await User.findOne({ mobile, country_code });
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log("Reset OTP:", otp);

        res.json({
            status: "success",
            message: "Password reset OTP sent",
            data: otp 
        });

    } catch (error) {
        logger.error("Forgot password error:", error);
        res.status(500).json({
            status: "error",
            message: "Error processing request"
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { country_code, mobile, otp, newPassword } = req.body;

        if (!mobile || !country_code || !otp || !newPassword) {
            return res.status(400).json({
                status: "error",
                message: "Country code, mobile, OTP and new password are required"
            });
        }

        const user = await User.findOne({
            mobile,
            country_code,
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or expired OTP"
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({
            status: "success",
            message: "Password reset successful"
        });

    } catch (error) {
        logger.error("Reset password error:", error);
        res.status(500).json({
            status: "error",
            message: "Error resetting password"
        });
    }
};
