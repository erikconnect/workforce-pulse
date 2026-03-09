import mongoose from 'mongoose';

const missionStepSchema = new mongoose.Schema({
  id: String,
  order: Number,
  title: String,
  description: String,
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: Date,
}, { _id: false });

const impactMetricSchema = new mongoose.Schema({
  label: String,
  before: Number,
  after: Number,
  unit: String,
}, { _id: false });

const missionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
    index: true,
  },
  priority: {
    type: String,
    enum: ['critical', 'watch', 'stable'],
    default: 'stable',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  steps: [missionStepSchema],
  sectorId: {
    type: String,
    index: true,
  },
  rewardPoints: {
    type: Number,
    default: 100,
  },
  participantCount: {
    type: Number,
    default: 0,
  },
  communityImpact: String,
  tags: [String],
  impactMetrics: [impactMetricSchema],
  assignee: String,
  dueDate: Date,
}, {
  timestamps: true,
});

export default mongoose.model('Mission', missionSchema);
