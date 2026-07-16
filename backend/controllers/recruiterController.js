import Job from '../models/Job.js';
import User from '../models/User.js';
import CodingProgress from '../models/CodingProgress.js';

// @desc    Post a new Job opening
// @route   POST /api/recruiter/jobs
// @access  Private (Recruiter)
export const postJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      recruiterId: req.user._id,
    });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs created by the recruiter
// @route   GET /api/recruiter/jobs
// @access  Private (Recruiter)
export const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter student listings
// @route   GET /api/recruiter/students
// @access  Private (Recruiter/Mentor/Admin)
export const searchStudents = async (req, res, next) => {
  const { search, skills, minXp } = req.query;
  try {
    let query = { role: 'student' };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (minXp) {
      query.xp = { $gte: parseInt(minXp) };
    }

    let students = await User.find(query).select('-password');

    // Filter by skills if specified
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      const studentIds = students.map(s => s._id);
      
      const codingMatches = await CodingProgress.find({
        studentId: { $in: studentIds },
        'languagesUsed.language': { $in: skillsArray.map(s => new RegExp(s, 'i')) },
      });

      const matchedIds = codingMatches.map(c => c.studentId.toString());
      students = students.filter(s => matchedIds.includes(s._id.toString()));
    }

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Shortlist Student profile
// @route   POST /api/recruiter/jobs/:id/shortlist
// @access  Private (Recruiter)
export const shortlistStudent = async (req, res, next) => {
  const { studentId } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    if (!job.shortlistedStudents.includes(studentId)) {
      job.shortlistedStudents.push(studentId);
      await job.save();
    }

    res.json({ success: true, message: 'Student successfully shortlisted for this opening', data: job });
  } catch (error) {
    next(error);
  }
};
