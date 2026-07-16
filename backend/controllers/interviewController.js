import MockInterview from '../models/MockInterview.js';
import User from '../models/User.js';
import AIProfileMemory from '../models/AIProfileMemory.js';
import * as calendarService from '../services/calendarService.js';
import * as geminiService from '../services/geminiService.js';
import { sendEmail } from '../services/mailService.js';
import { dispatchSmartNotification } from '../services/socketService.js';

// @desc    Schedule a new virtual mock interview
// @route   POST /api/interviews/schedule
// @access  Private
export const scheduleMockInterview = async (req, res, next) => {
  const { company, role, difficulty, type, scheduledAt } = req.body;
  try {
    const student = await User.findById(req.user._id);

    // Google Calendar Sync Simulation
    const calendarSync = await calendarService.createCalendarEvent({
      summary: `AI Mock Interview: ${company} (${role})`,
      description: `CareerOS virtual ${type} interview prep session. Join directly from the dashboard.`,
      startDateTime: scheduledAt || new Date(),
      attendeeEmail: student.email,
    });

    const mockInterview = await MockInterview.create({
      studentId: req.user._id,
      company,
      role,
      difficulty,
      type,
      scheduledAt: scheduledAt || new Date(),
      googleEventId: calendarSync.eventId,
      meetLink: calendarSync.meetLink,
    });

    // Send email invitation
    const emailHtml = `
      <h1>Mock Interview Confirmed</h1>
      <p>Hello ${student.name},</p>
      <p>Your AI Virtual Interview has been scheduled successfully:</p>
      <ul>
        <li><strong>Company:</strong> ${company}</li>
        <li><strong>Role:</strong> ${role}</li>
        <li><strong>Difficulty:</strong> ${difficulty}</li>
        <li><strong>Type:</strong> ${type}</li>
        <li><strong>Schedule Time:</strong> ${scheduledAt || new Date()}</li>
      </ul>
      <p>A Google Calendar event has been generated. When it is time, log into CareerOS to launch the interactive environment.</p>
    `;
    await sendEmail({
      to: student.email,
      subject: `Mock Interview Scheduled: ${company} (${role})`,
      html: emailHtml,
    });

    // Trigger Notification
    await dispatchSmartNotification(req.user._id, {
      title: 'Interview Scheduled',
      message: `Your ${type} mock round for ${company} is scheduled for ${scheduledAt || 'now'}. Check your email.`,
      type: 'interview',
    });

    res.status(201).json({ success: true, data: mockInterview });
  } catch (error) {
    next(error);
  }
};

// @desc    Start / Initialize interview session
// @route   POST /api/interviews/:id/start
// @access  Private
export const startInterview = async (req, res, next) => {
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview || interview.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Generate first question
    const question = await geminiService.getNextInterviewQuestion(
      interview.company,
      interview.role,
      interview.type,
      interview.difficulty,
      []
    );

    interview.questionsList = [{ question, answer: '', evaluation: '' }];
    await interview.save();

    res.json({ success: true, firstQuestion: question, data: interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit candidate text/speech answer and get follow-up
// @route   POST /api/interviews/:id/submit-answer
// @access  Private
export const submitAnswer = async (req, res, next) => {
  const { answerText, voiceStats, codingState, whiteboardState } = req.body;
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const currentQuestionIndex = interview.questionsList.length - 1;
    if (currentQuestionIndex < 0) {
      return res.status(400).json({ success: false, message: 'Interview has not started' });
    }

    // Save answer
    interview.questionsList[currentQuestionIndex].answer = answerText;

    // Evaluate current response
    const evaluation = await geminiService.evaluateInterviewAnswer(
      interview.questionsList[currentQuestionIndex].question,
      answerText
    );

    interview.questionsList[currentQuestionIndex].evaluation = JSON.stringify(evaluation);

    // Save dynamic voice analytics telemetry if supplied
    if (voiceStats) {
      interview.voiceAnalytics = {
        ...interview.voiceAnalytics,
        ...voiceStats,
      };
    }

    // Save coding IDE editor state if present
    if (codingState) {
      interview.codingState = {
        ...interview.codingState,
        ...codingState,
      };
    }

    // Save whiteboard coordinates snapshot if present
    if (whiteboardState) {
      interview.whiteboardState = {
        ...interview.whiteboardState,
        ...whiteboardState,
      };
    }

    // Limit interview flow length (e.g. 5 questions)
    if (interview.questionsList.length >= 5) {
      await interview.save();
      return res.json({
        success: true,
        finished: true,
        message: 'All questions completed. Proceeding to compile final scorecard report.',
      });
    }

    // Generate context-aware follow-up question
    const history = interview.questionsList.map(q => q.question);
    const nextQuestion = evaluation.followUpQuestion || await geminiService.getNextInterviewQuestion(
      interview.company,
      interview.role,
      interview.type,
      interview.difficulty,
      history
    );

    interview.questionsList.push({ question: nextQuestion, answer: '', evaluation: '' });
    await interview.save();

    res.json({
      success: true,
      finished: false,
      nextQuestion,
      feedback: evaluation.feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview and compile final scoring
// @route   POST /api/interviews/:id/complete
// @access  Private
export const completeInterview = async (req, res, next) => {
  const { videoAnalytics } = req.body;
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Analyze whole transcript using Gemini
    const reviewData = await geminiService.generateFinalInterviewReport(interview.questionsList);

    interview.scorecard = reviewData.scorecard;
    interview.report = {
      strengths: reviewData.strengths,
      weaknesses: reviewData.weaknesses,
      likelyResult: reviewData.likelyResult,
      improvementPlan: reviewData.improvementPlan,
      detailedFeedback: reviewData.detailedFeedback,
    };
    interview.isCompleted = true;

    // Apply webcam metrics if supplied
    if (videoAnalytics) {
      interview.videoAnalytics = {
        ...interview.videoAnalytics,
        ...videoAnalytics,
      };
    }

    await interview.save();

    // Sync findings with AI agent profile memory
    await AIProfileMemory.findOneAndUpdate(
      { studentId: req.user._id },
      {
        previousInterviewsSummary: `Completed ${interview.type} round. Overall Score: ${interview.scorecard.overall}. Key weakness: ${interview.report.weaknesses[0] || 'None'}.`,
        $addToSet: { weakAreas: { $each: reviewData.weaknesses || [] } },
      },
      { upsert: true }
    );

    // Gamification Reward: Level up / Coins check
    const user = await User.findById(req.user._id);
    user.xp += 150; // High value for mock interview completion
    user.coins += 50;

    // Award "Public Speaker" badge if communication score >= 80
    if (interview.scorecard.communication >= 80 && !user.badges.some(b => b.name === 'Public Speaker')) {
      user.badges.push({
        name: 'Public Speaker',
        icon: 'volume-2',
        description: 'Earned by scoring 80+ in Communication during an AI Interview!',
      });
    }

    await user.save();

    await dispatchSmartNotification(req.user._id, {
      title: 'Interview Report Ready',
      message: `Your score for the ${interview.company} round is: ${interview.scorecard.overall}/100. Earned 150 XP!`,
      type: 'interview',
    });

    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule scheduled mock interview
// @route   PUT /api/interviews/:id/reschedule
// @access  Private
export const rescheduleInterview = async (req, res, next) => {
  const { scheduledAt } = req.body;
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview || interview.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Interview details not found' });
    }

    if (interview.googleEventId) {
      await calendarService.updateCalendarEvent(interview.googleEventId, { startDateTime: scheduledAt });
    }

    interview.scheduledAt = scheduledAt;
    await interview.save();

    res.json({ success: true, message: 'Interview scheduled date updated successfully', data: interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel mock interview
// @route   DELETE /api/interviews/:id
// @access  Private
export const cancelMockInterview = async (req, res, next) => {
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview || interview.studentId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.googleEventId) {
      await calendarService.deleteCalendarEvent(interview.googleEventId);
    }

    await interview.deleteOne();
    res.json({ success: true, message: 'Interview booking removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get completed interview history
// @route   GET /api/interviews/history
// @access  Private
export const getInterviewHistory = async (req, res, next) => {
  try {
    const history = await MockInterview.find({
      studentId: req.user._id,
      isCompleted: true,
    }).sort({ updatedAt: -1 });

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};
