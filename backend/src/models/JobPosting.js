import mongoose from 'mongoose';

const jobPostingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  org: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  postedDate: {
    type: Date,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ['indeed', 'linkedin', 'glassdoor', 'jobaps', 'usajobs'],
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  sectorId: {
    type: String,
    index: true,
  },
  extractedSkills: [{
    type: String,
  }],
  salary: String,
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
  },
}, {
  timestamps: true,
});

// Indexes for common queries
jobPostingSchema.index({ sectorId: 1, postedDate: -1 });
jobPostingSchema.index({ source: 1, postedDate: -1 });
jobPostingSchema.index({ extractedSkills: 1 });

export default mongoose.model('JobPosting', jobPostingSchema);
