import * as geminiService from '../services/geminiService.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import DailyPlanner from '../models/DailyPlanner.js';
import CodingProgress from '../models/CodingProgress.js';
import User from '../models/User.js';
import AIProfileMemory from '../models/AIProfileMemory.js';
import { dispatchSmartNotification } from '../services/socketService.js';

// @desc    Analyze a student's resume
// @route   POST /api/ai/analyze-resume
// @access  Private
export const analyzeStudentResume = async (req, res, next) => {
  const { resumeText } = req.body;
  try {
    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Please provide resume text contents' });
    }

    const report = await geminiService.analyzeResume(resumeText);
    
    // Save report in database
    const analysis = await ResumeAnalysis.findOneAndUpdate(
      { studentId: req.user._id },
      {
        studentId: req.user._id,
        resumeScore: report.resumeScore,
        grammarFeedback: report.grammarFeedback,
        suggestions: report.suggestions,
        weakSections: report.weakSections,
        keywordDensity: report.keywordDensity,
        missingSkills: report.missingSkills,
      },
      { upsert: true, new: true }
    );

    // Save missing skills to user cognitive memory
    await AIProfileMemory.findOneAndUpdate(
      { studentId: req.user._id },
      {
        $addToSet: { weakAreas: { $each: report.missingSkills || [] } },
      },
      { upsert: true }
    );

    // Reward XP
    const user = await User.findById(req.user._id);
    user.xp += 30;
    await user.save();

    await dispatchSmartNotification(req.user._id, {
      title: 'Resume Analyzed Successfully',
      message: `Your resume score is: ${report.resumeScore}/100. Earned 30 XP!`,
      type: 'suggestion',
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare Resume vs Job Description for ATS matching
// @route   POST /api/ai/check-ats
// @access  Private
export const checkATSMatch = async (req, res, next) => {
  const { resumeText, jobDescription } = req.body;
  try {
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Please provide both resume text and job description' });
    }

    const matchReport = await geminiService.checkATSScore(resumeText, jobDescription);

    res.json({ success: true, data: matchReport });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate resume drafted contents (Summary, Project details)
// @route   POST /api/ai/draft-resume
// @access  Private
export const draftResumeContent = async (req, res, next) => {
  const { sectionType, details } = req.body;
  try {
    const text = await geminiService.generateResumeDraftContent(sectionType, details);
    res.json({ success: true, text });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate or fetch student's daily planner tasks
// @route   GET /api/ai/planner
// @access  Private
export const getDailyPlanner = async (req, res, next) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let planner = await DailyPlanner.findOne({ studentId: req.user._id, date: today });

    if (!planner) {
      // Fetch user context parameters
      const coding = await CodingProgress.findOne({ studentId: req.user._id });
      const memory = await AIProfileMemory.findOne({ studentId: req.user._id });
      const skills = coding ? coding.languagesUsed.map(l => l.language) : ['Javascript'];
      const weaknesses = memory ? memory.weakAreas : ['Dynamic Programming', 'Deployment Pipelines'];
      const goals = memory ? memory.careerGoals : 'Full Stack Developer';

      const plan = await geminiService.generateDailyPlannerTasks(skills, weaknesses, goals);

      planner = await DailyPlanner.create({
        studentId: req.user._id,
        date: today,
        ...plan,
      });

      // Update AI Agent Memory context
      await AIProfileMemory.findOneAndUpdate(
        { studentId: req.user._id },
        { currentPlannerState: today },
        { upsert: true }
      );
    }

    res.json({ success: true, data: planner });
  } catch (error) {
    next(error);
  }
};

// @desc    Audit portfolio performance, SEO, accessibility
// @route   POST /api/ai/portfolio-audit
// @access  Private
export const auditPortfolio = async (req, res, next) => {
  const { portfolioUrl } = req.body;
  try {
    if (!portfolioUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a portfolio URL' });
    }

    const report = await geminiService.analyzePortfolioUrl(portfolioUrl);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Optimize LinkedIn outline profile descriptions
// @route   POST /api/ai/linkedin-optimize
// @access  Private
export const optimizeLinkedIn = async (req, res, next) => {
  const { resumeText } = req.body;
  try {
    const suggestions = await geminiService.optimizeLinkedInProfile(resumeText || '');
    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate customized cover letter
// @route   POST /api/ai/cover-letter
// @access  Private
export const generateCoverLetter = async (req, res, next) => {
  const { resumeText, jobDescription, company, role } = req.body;
  try {
    const letter = await geminiService.generateCoverLetterText(
      resumeText || '',
      jobDescription || '',
      company || 'Target Company',
      role || 'Software Engineer'
    );
    res.json({ success: true, data: letter });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate professional placement emails
// @route   POST /api/ai/email-writer
// @access  Private
export const generateEmail = async (req, res, next) => {
  const { emailType, details } = req.body;
  try {
    const email = await geminiService.generateEmailText(emailType, details || {});
    res.json({ success: true, data: email });
  } catch (error) {
    next(error);
  }
};

// @desc    AI review GitHub Repository
// @route   POST /api/ai/review-project
// @access  Private
export const reviewProject = async (req, res, next) => {
  const { githubUrl, structure } = req.body;
  try {
    if (!githubUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a repository URL' });
    }
    const review = await geminiService.reviewGithubProject(githubUrl, structure || '');
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Update today's completed daily planner tasks
// @route   PUT /api/ai/planner
// @access  Private
export const updateDailyPlanner = async (req, res, next) => {
  const today = new Date().toISOString().split('T')[0];
  const { completedTasks } = req.body;
  try {
    const planner = await DailyPlanner.findOneAndUpdate(
      { studentId: req.user._id, date: today },
      { completedTasks },
      { new: true }
    );
    if (!planner) {
      return res.status(404).json({ success: false, message: 'Planner not found for today' });
    }
    res.json({ success: true, data: planner });
  } catch (error) {
    next(error);
  }
};

