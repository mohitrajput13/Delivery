import express from "express";
import User from "../models/User.js";

export const getAllUser = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

export const getRecentUser = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(users);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, companyName, vatNumber, address } = req.body;
    const userId = req.user.userId;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        first_name,
        last_name,
        company_name:companyName,
        vat_number :vatNumber,
        address
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.updatePassword(currentPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(400).json({ message: error.message || 'Failed to update password' });
  }
};