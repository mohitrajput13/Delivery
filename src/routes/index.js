import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js"
const router = express.Router();

router.use('/admin', adminRoutes);
router.use("/auth", authRoutes);
router.use("/users",userRoutes);

export default router;
