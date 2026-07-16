import mongoose from 'mongoose';

const companyPrepSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    interviewProcess: [String],
    expectedTopics: [String],
    codingProblems: [
      {
        title: String,
        difficulty: String,
        link: String,
        description: String,
      },
    ],
    resources: [
      {
        name: String,
        type: { type: String, enum: ['Article', 'Video', 'Doc'] },
        url: String,
      },
    ],
    tips: [String],
    experiences: [
      {
        studentName: String,
        roleName: String,
        year: Number,
        experienceText: String,
        verdict: { type: String, enum: ['Selected', 'Rejected', 'N/A'] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CompanyPrep = mongoose.model('CompanyPrep', companyPrepSchema);
export default CompanyPrep;
