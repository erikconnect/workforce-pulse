import mongoose from 'mongoose';

const playbookStepSchema = new mongoose.Schema({
  order: Number,
  instruction: String,
}, { _id: false });

const playbookSchema = new mongoose.Schema({
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
  summary: String,
  authorName: String,
  authorAvatar: String,
  sectorId: {
    type: String,
    index: true,
  },
  tags: [String],
  likes: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
  steps: [playbookStepSchema],
  likedBy: [{
    type: String,
  }],
  savedBy: [{
    type: String,
  }],
}, {
  timestamps: true,
});

playbookSchema.index({ tags: 1 });
playbookSchema.index({ createdAt: -1 });

export default mongoose.model('Playbook', playbookSchema);
