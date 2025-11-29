import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js"
import contentRoutes from "./contentRoutes.js"
import helpSupportRoutes from "./helpSupportRoutes.js"
const router = express.Router();

router.use('/admin', adminRoutes);
router.use("/auth", authRoutes);
router.use('/content', contentRoutes);
router.use('/help', helpSupportRoutes);
router.use("/users",userRoutes);

export default router;
