import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { fetchAboutContent, updateContent } from '../controllers/contentController.js';

const router = express.Router();

router.get("/fetchaboutcontent",verifyToken, fetchAboutContent);
router.post("/update_content",verifyToken, updateContent);

export default router; 