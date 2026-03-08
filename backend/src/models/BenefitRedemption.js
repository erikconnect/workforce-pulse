import mongoose from 'mongoose';

const benefitRedemptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  benefitId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  pointsSpent: {
    type: Number,
    required: true,
    min: 0,
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'expired'],
    default: 'fulfilled',
  },
}, {
  timestamps: true,
});

export default mongoose.model('BenefitRedemption', benefitRedemptionSchema);
