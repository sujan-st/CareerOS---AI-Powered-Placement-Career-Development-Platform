import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { assignTaskToStudent, reviewStudentReports } from '../controllers/mentorController.js';

const router = express.Router();

// Apply auth protection
router.use(protect);
router.use(authorize('mentor', 'admin'));

router.post('/assign-task', assignTaskToStudent);
router.get('/students/:id/report', reviewStudentReports);

export default router;
