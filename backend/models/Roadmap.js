import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    role: { type: String, required: true },
    company: { type: String, required: true },
    weeklyTasks: [
      {
        weekNumber: Number,
        topic: String,
        goals: [String],
        isCompleted: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    monthlyTasks: [
      {
        monthNumber: Number,
        topic: String,
        goals: [String],
        isCompleted: { type: Boolean, default: false },
      },
    ],
    completionPercentage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
