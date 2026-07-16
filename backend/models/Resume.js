import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
    },
    templateType: {
      type: String,
      enum: ['ats', 'google', 'harvard', 'modern'],
      default: 'modern',
    },
    summary: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: String,
        endDate: String,
        grade: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: String,
        link: String,
      },
    ],
    contactInfo: {
      phone: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const resumeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    versions: [resumeVersionSchema],
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
