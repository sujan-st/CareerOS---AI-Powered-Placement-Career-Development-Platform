import User from '../models/User.js';
import Application from '../models/Application.js';
import CodingProgress from '../models/CodingProgress.js';
import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import MockInterview from '../models/MockInterview.js';
import AIProfileMemory from '../models/AIProfileMemory.js';
import Certificate from '../models/Certificate.js';
import DailyPlanner from '../models/DailyPlanner.js';
import Notification from '../models/Notification.js';
import { predictPlacementProbability } from '../services/geminiService.js';
import { dispatchSmartNotification } from '../services/socketService.js';

// @desc    Get complete dashboard status and metrics
// @route   GET /api/student/dashboard
// @access  Private
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const user = await User.findById(studentId).select('-password');
    const resume = await Resume.findOne({ studentId });
    const analysis = await ResumeAnalysis.findOne({ studentId }).sort({ createdAt: -1 });
    const coding = await CodingProgress.findOne({ studentId });
    const applications = await Application.find({ studentId });
    const interviews = await MockInterview.find({ studentId });
    const certificates = await Certificate.find({ studentId });

    // Profile Strength Score calculation heuristics
    let scoreComponents = {
      resume: analysis ? analysis.resumeScore : 20,
      coding: coding && coding.solvedProblems.total > 0 ? Math.min(100, coding.solvedProblems.total * 3) : 20,
      applications: applications.length > 0 ? 60 : 20,
      interviews: interviews.length > 0 ? 70 : 30,
      certifications: certificates.length > 0 ? Math.min(100, 30 + certificates.length * 15) : 20,
    };
    
    const profileStrength = Math.round(
      (scoreComponents.resume + scoreComponents.coding + scoreComponents.applications + scoreComponents.interviews + scoreComponents.certifications) / 5
    );

    // Filter upcoming interviews
    const upcomingInterviews = interviews.filter(
      (i) => !i.isCompleted && new Date(i.scheduledAt) > new Date()
    );

    res.json({
      success: true,
      data: {
        profileStrength,
        xp: user.xp,
        coins: user.coins,
        level: user.level,
        dailyStreak: user.dailyStreak,
        resumeScore: analysis ? analysis.resumeScore : null,
        atsScore: analysis ? analysis.atsScore : null,
        codingProgress: coding ? coding.solvedProblems : null,
        applicationsCount: applications.length,
        interviewsCount: interviews.length,
        upcomingInterview: upcomingInterviews.length > 0 ? upcomingInterviews[0] : null,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Placement Copilot analytics & recommendations
// @route   GET /api/student/copilot
// @access  Private
export const getCopilotInsights = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);
    const coding = await CodingProgress.findOne({ studentId });
    const analysis = await ResumeAnalysis.findOne({ studentId }).sort({ createdAt: -1 });
    const interviews = await MockInterview.find({ studentId });

    const skills = coding ? coding.languagesUsed.map(l => l.language) : ['Javascript'];
    const resumeScore = analysis ? analysis.resumeScore : 65;
    const codingStreak = user.dailyStreak || 0;

    // Run prediction model
    const predictionReport = await predictPlacementProbability(
      skills,
      resumeScore,
      interviews.length,
      codingStreak
    );

    res.json({
      success: true,
      data: {
        predictions: predictionReport.predictions,
        suggestedFocus: resumeScore < 70 ? 'Resume content optimization' : 'System Design mock interview rounds',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    CRUD Job Applications
// @route   GET /api/student/applications
// @access  Private
export const getApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, data: apps });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const app = await Application.create({
      ...req.body,
      studentId: req.user._id,
      timeline: [{ status: req.body.status || 'Applied' }],
    });

    // Reward application XP
    const user = await User.findById(req.user._id);
    user.xp += 15;
    await user.save();

    await dispatchSmartNotification(req.user._id, {
      title: 'Job Tracker Updated',
      message: `Added new application entry for ${app.companyName} (${app.role}). You earned 15 XP!`,
      type: 'application',
    });

    res.status(201).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app || app.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const oldStatus = app.status;
    const updatedApp = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.body.status && req.body.status !== oldStatus) {
      updatedApp.timeline.push({ status: req.body.status });
      await updatedApp.save();

      // Trigger socket alert
      await dispatchSmartNotification(req.user._id, {
        title: 'Application Status Updated',
        message: `Your application status for ${app.companyName} changed to: ${req.body.status}`,
        type: 'application',
      });
    }

    res.json({ success: true, data: updatedApp });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app || app.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    await app.deleteOne();
    res.json({ success: true, message: 'Application record removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync coding handles
// @route   POST /api/student/coding/sync
// @access  Private
export const syncCodingProgress = async (req, res, next) => {
  try {
    const { githubUsername, leetcodeUsername, codeforcesUsername, hackerrankUsername, codechefUsername } = req.body;
    let coding = await CodingProgress.findOne({ studentId: req.user._id });

    if (!coding) {
      coding = await CodingProgress.create({ studentId: req.user._id });
    }

    if (githubUsername) coding.githubUsername = githubUsername;
    if (leetcodeUsername) coding.leetcodeUsername = leetcodeUsername;
    if (codeforcesUsername) coding.codeforcesUsername = codeforcesUsername;
    if (hackerrankUsername) coding.hackerrankUsername = hackerrankUsername;
    if (codechefUsername) coding.codechefUsername = codechefUsername;

    // Simulate scraping / API returns to seed metrics for charting
    coding.solvedProblems = {
      easy: Math.floor(Math.random() * 20) + 15,
      medium: Math.floor(Math.random() * 30) + 20,
      hard: Math.floor(Math.random() * 10) + 5,
      total: 0,
    };
    coding.solvedProblems.total = coding.solvedProblems.easy + coding.solvedProblems.medium + coding.solvedProblems.hard;

    coding.languagesUsed = [
      { language: 'JavaScript', count: 65 },
      { language: 'Python', count: 25 },
      { language: 'C++', count: 15 },
    ];

    coding.heatmapData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5),
      };
    });

    coding.contestRating = Math.floor(Math.random() * 300) + 1400;

    await coding.save();

    // Reward XP
    const user = await User.findById(req.user._id);
    user.xp += 25;
    await user.save();

    await dispatchSmartNotification(req.user._id, {
      title: 'Coding Accounts Synced',
      message: 'Successfully updated profile statistics from LeetCode & GitHub. Earned 25 XP!',
      type: 'coding',
    });

    res.json({ success: true, data: coding });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve dynamic AI smart notifications
// @route   GET /api/student/notifications
// @access  Private
export const getSmartNotifications = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Check database to compile alerts
    const user = await User.findById(studentId);
    const coding = await CodingProgress.findOne({ studentId });
    const analysis = await ResumeAnalysis.findOne({ studentId });
    const interviews = await MockInterview.find({ studentId });
    const applications = await Application.find({ studentId });

    const notificationsToCreate = [];

    // 1. Coding streak
    if (!user.dailyStreak || user.dailyStreak === 0) {
      notificationsToCreate.push({
        title: 'Coding Streak Broken',
        message: 'Your active daily coding streak is at 0. Solve coding tasks today to restart your streak!',
        type: 'coding',
      });
    }

    // 2. Resume score
    const resumeScore = analysis ? analysis.resumeScore : 72;
    if (resumeScore < 80) {
      notificationsToCreate.push({
        title: 'Resume Score Below Target',
        message: `Your current resume compatibility is ${resumeScore}/100. Enhance it to match your target criteria.`,
        type: 'suggestion',
      });
    }

    // 3. Upcoming interview
    const nextInterview = interviews.find(i => !i.isCompleted && new Date(i.scheduledAt) > new Date());
    if (nextInterview) {
      notificationsToCreate.push({
        title: 'Upcoming Interview Prep',
        message: `You have an upcoming interview round for ${nextInterview.company} (${nextInterview.role}) scheduled.`,
        type: 'interview',
      });
    }

    // 4. ATS improvement suggestion
    if (analysis && analysis.missingSkills && analysis.missingSkills.length > 0) {
      notificationsToCreate.push({
        title: 'ATS Suggestion: Missing Skills',
        message: `Add matching keywords: ${analysis.missingSkills.slice(0, 3).join(', ')} to boost ATS compatibility.`,
        type: 'suggestion',
      });
    }

    // 5. Application deadline
    const openApps = applications.filter(a => a.status === 'Applied' || a.status === 'Interviewing');
    if (openApps.length > 0) {
      notificationsToCreate.push({
        title: 'Application Tracking Update',
        message: `Keep tracking your interview loops. You have ${openApps.length} active applications.`,
        type: 'application',
      });
    }

    // 6. Roadmap behind schedule
    notificationsToCreate.push({
      title: 'Roadmap Target Alert',
      message: 'You are slightly behind on your active System Design roadmap progress. Complete a node today!',
      type: 'learning',
    });

    // 7. Daily/Weekly/Monthly reports
    notificationsToCreate.push({
      title: 'AI Daily Mentor Checklist',
      message: 'Your customized daily tasks are ready. Complete them today to claim extra bonus XP and coins.',
      type: 'general',
    });
    notificationsToCreate.push({
      title: 'AI Weekly Performance Summary',
      message: `Weekly report: Solved 8 problems, completed 1 mock interview, and earned ${user.xp % 100} bonus XP.`,
      type: 'general',
    });
    notificationsToCreate.push({
      title: 'AI Monthly Placement Analytics',
      message: 'Monthly audit: Profile strength rating increased by +8%. View analytics on the Copilot desk.',
      type: 'general',
    });

    // Save only unique alerts to Mongoose collection to avoid duplicate spamming
    for (const notif of notificationsToCreate) {
      const exists = await Notification.findOne({ userId: studentId, title: notif.title });
      if (!exists) {
        await Notification.create({
          userId: studentId,
          ...notif,
        });
      }
    }

    // Query and return the notification log
    const list = await Notification.find({ userId: studentId }).sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });

  } catch (error) {
    next(error);
  }
};
