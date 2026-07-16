import User from '../models/User.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import MockInterview from '../models/MockInterview.js';
import DailyPlanner from '../models/DailyPlanner.js';
import { dispatchSmartNotification } from '../services/socketService.js';

// @desc    Assign a specific study/preparation task to a student
// @route   POST /api/mentor/assign-task
// @access  Private (Mentor/Admin)
export const assignTaskToStudent = async (req, res, next) => {
  const { studentId, taskDescription, category } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Append to today's daily planner checklist or initialize one
    let planner = await DailyPlanner.findOne({ studentId, date: today });
    if (!planner) {
      planner = await DailyPlanner.create({
        studentId,
        date: today,
        dailyMotivation: 'Your mentor assigned you a priority milestone to complete today!',
      });
    }

    if (category === 'coding') {
      planner.codingGoal = `[Mentor Assigned] ${taskDescription}`;
    } else if (category === 'resume') {
      planner.resumeTask = `[Mentor Assigned] ${taskDescription}`;
    } else {
      planner.revisionTopic = `[Mentor Assigned] ${taskDescription}`;
    }

    await planner.save();

    // Trigger Notification
    await dispatchSmartNotification(studentId, {
      title: 'Mentor Assigned Task',
      message: `Your mentor assigned a priority challenge: "${taskDescription}"`,
      type: 'general',
    });

    res.json({ success: true, message: 'Milestone successfully assigned and synced with planner', data: planner });
  } catch (error) {
    next(error);
  }
};

// @desc    Review detailed student performance reports
// @route   GET /api/mentor/students/:id/report
// @access  Private (Mentor/Admin)
export const reviewStudentReports = async (req, res, next) => {
  const studentId = req.params.id;
  try {
    const student = await User.findById(studentId).select('-password');
    const resumeReport = await ResumeAnalysis.findOne({ studentId }).sort({ createdAt: -1 });
    const interviews = await MockInterview.find({ studentId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        student,
        resumeReport,
        interviewsHistory: interviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
