import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    role: {
      type: String,
      required: [true, 'Please add a role name'],
    },
    package: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'OA', 'Technical', 'HR', 'Offer', 'Rejected', 'Joined'],
      default: 'Applied',
    },
    interviewDates: [
      {
        stage: String,
        date: Date,
      },
    ],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    timeline: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);
export default Application;
