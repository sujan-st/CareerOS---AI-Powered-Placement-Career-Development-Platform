import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  postJob,
  getRecruiterJobs,
  searchStudents,
  shortlistStudent,
} from '../controllers/recruiterController.js';

const router = express.Router();

// Apply auth protection
router.use(protect);

// Recruiters can post jobs and shortlist candidates
router.post('/jobs', authorize('recruiter'), postJob);
router.get('/jobs', authorize('recruiter'), getRecruiterJobs);
router.post('/jobs/:id/shortlist', authorize('recruiter'), shortlistStudent);

// Recruiters, Mentors, and Admins can search students
router.get('/students', authorize('recruiter', 'mentor', 'admin'), searchStudents);

export default router;
