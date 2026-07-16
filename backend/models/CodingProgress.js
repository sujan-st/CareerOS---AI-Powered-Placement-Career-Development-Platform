import mongoose from 'mongoose';

const codingProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    githubUsername: { type: String, default: '' },
    leetcodeUsername: { type: String, default: '' },
    codeforcesUsername: { type: String, default: '' },
    hackerrankUsername: { type: String, default: '' },
    codechefUsername: { type: String, default: '' },

    solvedProblems: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    contestRating: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    languagesUsed: [
      {
        language: String,
        count: Number,
      },
    ],
    heatmapData: [
      {
        date: String,
        count: Number,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CodingProgress = mongoose.model('CodingProgress', codingProgressSchema);
export default CodingProgress;
