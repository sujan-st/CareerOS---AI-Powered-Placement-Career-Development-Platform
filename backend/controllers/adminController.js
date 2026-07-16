import User from '../models/User.js';
import MockInterview from '../models/MockInterview.js';
import Application from '../models/Application.js';

// @desc    Get global platform analytics and system metrics
// @route   GET /api/admin/metrics
// @access  Private (Admin)
export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });

    const totalInterviews = await MockInterview.countDocuments();
    const completedInterviews = await MockInterview.countDocuments({ isCompleted: true });

    // Aggregate placement stats
    const totalOffers = await Application.countDocuments({ status: 'Offer' });
    const joinedStudents = await Application.countDocuments({ status: 'Joined' });

    // Top performers listing based on Level & XP
    const topPerformers = await User.find({ role: 'student' })
      .sort({ xp: -1 })
      .limit(5)
      .select('name email xp level badges');

    res.json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          mentors: totalMentors,
          recruiters: totalRecruiters,
        },
        interviews: {
          total: totalInterviews,
          completed: completedInterviews,
        },
        placements: {
          offers: totalOffers,
          joined: joinedStudents,
        },
        topPerformers,
        aiUsageMockCount: totalInterviews * 6, // Estimate 6 Gemini API prompts per mock interview
      },
    });
  } catch (error) {
    next(error);
  }
};
