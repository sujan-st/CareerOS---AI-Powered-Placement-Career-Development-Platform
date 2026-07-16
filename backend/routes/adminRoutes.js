import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminMetrics } from '../controllers/adminController.js';

const router = express.Router();

// Apply auth protection
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getAdminMetrics);

export default router;
