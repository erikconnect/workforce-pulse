import mongoose from 'mongoose';

const trainingResourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  provider: String,
}, { _id: false });

const skillSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
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
    enum: ['technical', 'soft', 'certification', 'tool', 'other'],
    default: 'other',
  },
  demandLevel: {
    type: String,
    enum: ['critical', 'watch', 'stable'],
    default: 'stable',
  },
  growthRate: {
    type: Number,
    default: 0,
  },
  sparklineData: [Number],
  relatedRoles: [String],
  trainingResources: [trainingResourceSchema],
}, {
  timestamps: true,
});

export default mongoose.model('Skill', skillSchema);
