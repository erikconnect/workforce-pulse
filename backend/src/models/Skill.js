import mongoose from 'mongoose';

const trainingResourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  provider: String,
}, { _id: false });

const skillSchema = new mongoose.Schema({
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

export default mongoose.model('Skill', skillSchema);
