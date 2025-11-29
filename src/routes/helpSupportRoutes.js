import express from "express";
import { fetchHelpSupport, updateHelpSupport } from "../controllers/helpSupport.js";
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get("/fetch_help_support",verifyToken, fetchHelpSupport);
router.post("/update_help_support",verifyToken, updateHelpSupport);

export default router;
