/**
 * Mongoose model for Skill
 * TypeScript version for Next.js API routes
 */

import mongoose, { Schema, Model, Document } from 'mongoose';

interface ITrainingResource {
  title: string;
  url: string;
  provider: string;
}

export interface ISkill extends Document {
  id?: string;
  name: string;
  category: 'technical' | 'soft' | 'certification' | 'tool' | 'healthcare' | 'leadership' | 'operations' | 'safety' | 'cloud' | 'data-science' | 'software-development' | 'other';
  demandLevel: 'critical' | 'watch' | 'stable';
  demandSignal: number;
  jobCount: number;
  growthRate: number;
  sparklineData: number[];
  relatedRoles: string[];
  trainingResources: ITrainingResource[];
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const trainingResourceSchema = new Schema<ITrainingResource>({
  title: String,
  url: String,
  provider: String,
}, { _id: false });

const skillSchema = new Schema<ISkill>({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    enum: [
      'technical', 
      'soft', 
      'certification', 
      'tool', 
      'healthcare', 
      'leadership',
      'operations',
      'safety',
      'cloud',
      'data-science',
      'software-development',
      'other'
    ],
    default: 'other',
    index: true,
  },
  demandLevel: {
    type: String,
    enum: ['critical', 'watch', 'stable'],
    default: 'stable',
    index: true,
  },
  demandSignal: {
    type: Number,
    default: 0,
    index: true,
  },
  jobCount: {
    type: Number,
    default: 0,
  },
  growthRate: {
    type: Number,
    default: 0,
  },
  sparklineData: [Number],
  relatedRoles: [String],
  trainingResources: [trainingResourceSchema],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Prevent model recompilation in development
const Skill: Model<ISkill> = 
  mongoose.models.Skill || mongoose.model<ISkill>('Skill', skillSchema);

export default Skill;
