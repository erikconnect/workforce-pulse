import mongoose from 'mongoose';

const sectorKpiSchema = new mongoose.Schema({
  label: String,
  value: mongoose.Schema.Types.Mixed,
  delta: Number,
  status: {
    type: String,
    enum: ['critical', 'watch', 'stable'],
  },
}, { _id: false });

const sectorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  pulseScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  status: {
    type: String,
    enum: ['critical', 'watch', 'stable'],
    default: 'stable',
  },
  kpis: [sectorKpiSchema],
  sparklineData: [Number],
  employeeCount: {
    type: Number,
    default: 0,
  },
  openRolesCount: {
    type: Number,
    default: 0,
  },
  description: String,
}, {
  timestamps: true,
});

export default mongoose.model('Sector', sectorSchema);
