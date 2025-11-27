import express from 'express';
import { getRecentUser, updateProfile, updatePassword } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get("/users_recent",verifyToken, getRecentUser);
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, updatePassword);

export default router; 