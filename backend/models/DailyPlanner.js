import mongoose from 'mongoose';

const dailyPlannerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    codingGoal: { type: String, default: '' },
    resumeTask: { type: String, default: '' },
    revisionTopic: { type: String, default: '' },
    mockInterviewGoal: { type: String, default: '' },
    jobApplicationGoal: { type: String, default: '' },
    dailyMotivation: { type: String, default: '' },
    estimatedCompletionTimeMinutes: { type: Number, default: 0 },
    completedTasks: {
      type: [String], // Array of completed task keys, e.g. ['codingGoal', 'revisionTopic']
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const DailyPlanner = mongoose.model('DailyPlanner', dailyPlannerSchema);
export default DailyPlanner;
