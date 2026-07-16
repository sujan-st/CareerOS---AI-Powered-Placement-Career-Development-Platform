import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  analyzeStudentResume,
  checkATSMatch,
  draftResumeContent,
  getDailyPlanner,
  updateDailyPlanner,
  auditPortfolio,
  optimizeLinkedIn,
  generateCoverLetter,
  generateEmail,
  reviewProject,
} from '../controllers/aiController.js';

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);
router.use(authorize('student'));

router.post('/analyze-resume', analyzeStudentResume);
router.post('/check-ats', checkATSMatch);
router.post('/draft-resume', draftResumeContent);
router.get('/planner', getDailyPlanner);
router.put('/planner', updateDailyPlanner);
router.post('/portfolio-audit', auditPortfolio);
router.post('/linkedin-optimize', optimizeLinkedIn);
router.post('/cover-letter', generateCoverLetter);
router.post('/email-writer', generateEmail);
router.post('/review-project', reviewProject);

export default router;
