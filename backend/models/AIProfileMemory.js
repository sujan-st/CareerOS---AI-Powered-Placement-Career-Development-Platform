import mongoose from 'mongoose';

const aiProfileMemorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    previousInterviewsSummary: {
      type: String,
      default: '',
    },
    previousSuggestions: {
      type: [String],
      default: [],
    },
    careerGoals: {
      type: String,
      default: 'Get a software engineering job at a top product company',
    },
    customContext: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AIProfileMemory = mongoose.model('AIProfileMemory', aiProfileMemorySchema);
export default AIProfileMemory;
