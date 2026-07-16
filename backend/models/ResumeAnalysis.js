import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeScore: {
      type: Number,
      default: 0,
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    keywordDensity: [
      {
        keyword: String,
        count: Number,
      },
    ],
    missingSkills: {
      type: [String],
      default: [],
    },
    matchingSkills: {
      type: [String],
      default: [],
    },
    grammarFeedback: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    weakSections: {
      type: [String],
      default: [],
    },
    jobDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
export default ResumeAnalysis;
