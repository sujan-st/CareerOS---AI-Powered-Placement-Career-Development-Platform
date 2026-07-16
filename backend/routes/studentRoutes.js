import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getStudentDashboard,
  getCopilotInsights,
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  syncCodingProgress,
  getSmartNotifications,
} from '../controllers/studentController.js';

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/copilot', getCopilotInsights);
router.get('/notifications', getSmartNotifications);

router.get('/applications', getApplications);
router.post('/applications', createApplication);
router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);

router.post('/coding/sync', syncCodingProgress);

export default router;
