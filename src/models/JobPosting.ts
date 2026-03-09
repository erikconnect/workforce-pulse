/**
 * Mongoose model for JobPosting
 * TypeScript version for Next.js API routes
 */

import mongoose, { Schema, Model } from 'mongoose';
import type { JobPosting as JobPostingType } from '@/services/types';

export interface IJobPosting {
  id: string;
  title: string;
  org: string;
  location: string;
  postedDate: Date;         // MongoDB stores as Date object, not ISO string
  description: string;
  source: string;
  url: string;
  sectorId?: string | null;
  extractedSkills: string[];
  salary?: string;
  jobType?: string;
  scrapedCount: number;
  firstScrapedAt: Date;
  lastScrapedAt: Date;
  isActive: boolean;
}

const jobPostingSchema = new Schema<IJobPosting>({
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
  // Scraping tracking fields
  scrapedCount: {
    type: Number,
    default: 1,
    index: true,
  },
  firstScrapedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastScrapedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for common queries
jobPostingSchema.index({ sectorId: 1, postedDate: -1 });
jobPostingSchema.index({ source: 1, postedDate: -1 });
jobPostingSchema.index({ extractedSkills: 1 });
jobPostingSchema.index({ scrapedCount: 1, lastScrapedAt: -1 });
jobPostingSchema.index({ isActive: 1, lastScrapedAt: -1 });

// Prevent model recompilation in development
const JobPosting: Model<IJobPosting> = 
  mongoose.models.JobPosting || mongoose.model<IJobPosting>('JobPosting', jobPostingSchema);

export default JobPosting;
