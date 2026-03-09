import mongoose from 'mongoose';

/**
 * CacheMetadata - tracks last update time for cached data types
 * Enables cache-first strategy: check DB before scraping/fetching
 */
const cacheMetadataSchema = new mongoose.Schema({
  // Flexible key - can be dataType or source
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  dataType: String, // e.g., 'jobs', 'skills', 'missions'
  source: String, // e.g., "jobaps", "usajobs", "skill-demand"
  lastFetched: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  recordCount: {
    type: Number,
    default: 0,
  },
  jobsCount: Number,
  skillsCount: Number,
  sectorsCount: Number,
  ttlMinutes: {
    type: Number,
    default: 1440, // 24 hours default
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending',
  },
  metadata: mongoose.Schema.Types.Mixed, // flexible metadata
}, {
  timestamps: true,
});

// Helper: check if cache is fresh
cacheMetadataSchema.methods.isFresh = function() {
  const ageMinutes = (Date.now() - this.lastUpdated.getTime()) / 1000 / 60;
  return ageMinutes < this.ttlMinutes;
};

// Static: Update cache timestamp
cacheMetadataSchema.statics.touch = async function(dataType, recordCount = 0, source = null) {
  const key = source || dataType;
  return this.findOneAndUpdate(
    { key },
    {
      key,
      dataType,
      source,
      lastFetched: new Date(),
      lastUpdated: new Date(),
      recordCount,
      status: 'success',
    },
    { upsert: true, new: true }
  );
};

export default mongoose.model('CacheMetadata', cacheMetadataSchema);
