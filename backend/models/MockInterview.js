import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['HR', 'Technical', 'Behavioral', 'Coding', 'System Design', 'Mixed'],
      default: 'Mixed',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // Google Calendar & Meet Sync
    googleEventId: String,
    meetLink: String,

    // Interview Transcript & Conversation History
    questionsList: [
      {
        question: String,
        answer: String,
        evaluation: String,
      },
    ],

    // Advanced Voice Analytics
    voiceAnalytics: {
      speakingSpeedWpm: { type: Number, default: 0 },
      fillerWordsCount: { type: Number, default: 0 },
      silenceDurationSeconds: { type: Number, default: 0 },
      voicePitchHz: { type: Number, default: 0 },
      voiceEnergy: { type: Number, default: 0 },
      pronunciationScore: { type: Number, default: 0 },
      accentScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
    },

    // AI Video Analytics
    videoAnalytics: {
      eyeContactPercentage: { type: Number, default: 100 },
      smileCount: { type: Number, default: 0 },
      headPoseScore: { type: Number, default: 100 },
      attentionTrackingScore: { type: Number, default: 100 },
      dominantEmotion: { type: String, default: 'Neutral' },
      confidenceEstimation: { type: Number, default: 100 },
    },

    // Monaco IDE Coding State
    codingState: {
      code: { type: String, default: '' },
      language: { type: String, default: 'javascript' },
      correctnessScore: { type: Number, default: 0 },
      timeComplexity: { type: String, default: 'N/A' },
      spaceComplexity: { type: String, default: 'N/A' },
      codeQualityScore: { type: Number, default: 0 },
      namingConventionScore: { type: Number, default: 0 },
      aiFeedback: { type: String, default: '' },
    },

    // Live Whiteboard JSON Snapshot
    whiteboardState: {
      elements: { type: String, default: '[]' },
      zoom: { type: Number, default: 1 },
      aiReview: { type: String, default: '' },
    },

    // Overall Evaluation & Scorecard
    scorecard: {
      communication: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    report: {
      strengths: [String],
      weaknesses: [String],
      likelyResult: { type: String, default: 'Borderline' },
      improvementPlan: [String],
      detailedFeedback: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
export default MockInterview;
