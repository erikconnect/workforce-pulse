import CacheMetadata from '../models/CacheMetadata.js';
import JobPosting from '../models/JobPosting.js';
import Skill from '../models/Skill.js';
import Mission from '../models/Mission.js';
import Playbook from '../models/Playbook.js';
import CommunityProfile from '../models/CommunityProfile.js';

// Default TTLs (in minutes)
const TTL_CONFIG = {
  jobs: 1440,       // 24 hours
  skills: 720,      // 12 hours  
  missions: 60,     // 1 hour
  playbooks: 2880,  // 48 hours
  profiles: 1440,   // 24 hours
  maps: 10080,      // 1 week
  sectors: 10080,   // 1 week
};

/**
 * GET /api/v1/cache/status
 * Returns cache freshness for all data types
 */
export const getCacheStatus = async (req, res) => {
  try {
    const allTypes = Object.keys(TTL_CONFIG);
    const cacheRecords = await CacheMetadata.find({ dataType: { $in: allTypes } });
    
    const status = allTypes.map(dataType => {
      const cache = cacheRecords.find(c => c.dataType === dataType);
      if (!cache) {
        return {
          dataType,
          status: 'empty',
          lastUpdated: null,
          recordCount: 0,
          ttlMinutes: TTL_CONFIG[dataType],
          isFresh: false,
        };
      }
      return {
        dataType: cache.dataType,
        status: cache.isFresh() ? 'fresh' : 'stale',
        lastUpdated: cache.lastUpdated,
        recordCount: cache.recordCount,
        ttlMinutes: cache.ttlMinutes,
        isFresh: cache.isFresh(),
        ageMinutes: Math.floor((Date.now() - cache.lastUpdated.getTime()) / 1000 / 60),
      };
    });

    res.json({ success: true, data: status });
  } catch (error) {
    console.error('❌ [Cache Status] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/cache/invalidate
 * Invalidate cache for specific data types (force refresh)
 * Body: { dataTypes: ['jobs', 'skills'] }
 */
export const invalidateCache = async (req, res) => {
  try {
    const { dataTypes } = req.body;
    if (!Array.isArray(dataTypes) || dataTypes.length === 0) {
      return res.status(400).json({ success: false, error: 'dataTypes array required' });
    }

    // Set lastUpdated to epoch (force stale)
    await CacheMetadata.updateMany(
      { dataType: { $in: dataTypes } },
      { lastUpdated: new Date(0) }
    );

    res.json({ success: true, invalidated: dataTypes });
  } catch (error) {
    console.error('❌ [Cache Invalidate] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/cache/refresh
 * Touch cache for specific data type (mark as fresh)
 * Body: { dataType: 'jobs', recordCount: 123 }
 */
export const refreshCache = async (req, res) => {
  try {
    const { dataType, recordCount, source } = req.body;
    if (!dataType || !TTL_CONFIG[dataType]) {
      return res.status(400).json({ success: false, error: 'Invalid dataType' });
    }

    const cache = await CacheMetadata.touch(dataType, recordCount, source);
    res.json({ success: true, data: cache });
  } catch (error) {
    console.error('❌ [Cache Refresh] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/cache/check/:dataType
 * Check if specific cache is fresh
 */
export const checkCache = async (req, res) => {
  try {
    const { dataType } = req.params;
    const cache = await CacheMetadata.findOne({ dataType });
    
    if (!cache) {
      return res.json({
        success: true,
        data: { dataType, isFresh: false, status: 'empty' }
      });
    }

    res.json({
      success: true,
      data: {
        dataType: cache.dataType,
        isFresh: cache.isFresh(),
        status: cache.isFresh() ? 'fresh' : 'stale',
        lastUpdated: cache.lastUpdated,
        recordCount: cache.recordCount,
        ageMinutes: Math.floor((Date.now() - cache.lastUpdated.getTime()) / 1000 / 60),
        ttlMinutes: cache.ttlMinutes,
      }
    });
  } catch (error) {
    console.error('❌ [Cache Check] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
