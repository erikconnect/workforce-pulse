import mongoose from 'mongoose';

const communityProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  streak: {
    type: Number,
    default: 0,
    min: 0,
  },
  skillPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  sectorPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  playbookPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  skillActionsCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  sectorActionsCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  playbooksCreated: {
    type: Number,
    default: 0,
    min: 0,
  },
  playbooksLiked: {
    type: Number,
    default: 0,
    min: 0,
  },
  playbooksSaved: {
    type: Number,
    default: 0,
    min: 0,
  },
  redemptionPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  engagementLedger: [{ type: String }],
}, {
  timestamps: true,
});

export default mongoose.model('CommunityProfile', communityProfileSchema);
