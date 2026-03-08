import mongoose from 'mongoose';

const pulseCheckInSchema = new mongoose.Schema({
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
  lastCheckInDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('PulseCheckIn', pulseCheckInSchema);
