import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  scheduleMockInterview,
  startInterview,
  submitAnswer,
  completeInterview,
  rescheduleInterview,
  cancelMockInterview,
  getInterviewHistory,
} from '../controllers/interviewController.js';

const router = express.Router();

// Apply auth protection
router.use(protect);
router.use(authorize('student'));

router.post('/schedule', scheduleMockInterview);
router.post('/:id/start', startInterview);
router.post('/:id/submit-answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.put('/:id/reschedule', rescheduleInterview);
router.delete('/:id', cancelMockInterview);
router.get('/history', getInterviewHistory);

export default router;
