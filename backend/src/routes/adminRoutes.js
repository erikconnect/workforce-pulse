/**
 * Admin Routes
 * Endpoints for manually triggering data population and monitoring status
 */

import express from 'express';
import {
  runDataPopulationPipeline,
  getPopulationStatus,
} from '../services/dataPopulationOrchestrator.js';
import {
  getAggregationStatus,
} from '../services/dataAggregationService.js';
import {
  getTopSkills,
} from '../services/skillEnrichmentService.js';
import {
  getAllSectorsSummary,
  calculateWorkforcePulse,
} from '../services/sectorAnalysisService.js';
import CacheMetadata from '../models/CacheMetadata.js';
import JobPosting from '../models/JobPosting.js';
import Skill from '../models/Skill.js';
import Sector from '../models/Sector.js';

const router = express.Router();

/**
 * Trigger complete data population pipeline
 * POST /api/v1/admin/populate/run-pipeline
 */
router.post('/populate/run-pipeline', async (req, res, next) => {
  try {
    console.log('📋 Admin triggered data population pipeline');
    
    const results = await runDataPopulationPipeline();
    
    res.status(200).json({
      success: true,
      message: 'Data population pipeline completed',
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Trigger job aggregation only
 * POST /api/v1/admin/populate/jobs
 */
router.post('/populate/jobs', async (req, res, next) => {
  try {
    console.log('📋 Admin triggered job aggregation');
    
    const { aggregateAllJobs } = await import('../services/dataAggregationService.js');
    const results = await aggregateAllJobs();
    
    res.status(200).json({
      success: true,
      message: 'Job aggregation completed',
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Trigger skill extraction only
 * POST /api/v1/admin/populate/skills
 */
router.post('/populate/skills', async (req, res, next) => {
  try {
    console.log('📋 Admin triggered skill extraction');
    
    const { enrichJobsWithSkills, calculateSkillDemand, updateSkillRelatedRoles } = await import('../services/skillEnrichmentService.js');
    
    const enrichResult = await enrichJobsWithSkills();
    const demandResult = await calculateSkillDemand();
    const rolesResult = await updateSkillRelatedRoles();
    
    res.status(200).json({
      success: true,
      message: 'Skill extraction, demand calculation, and role mapping completed',
      data: {
        enrichment: enrichResult,
        skillDemand: demandResult,
        relatedRoles: rolesResult,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Trigger sector metrics calculation only
 * POST /api/v1/admin/populate/sectors
 */
router.post('/populate/sectors', async (req, res, next) => {
  try {
    console.log('📋 Admin triggered sector metrics calculation');
    
    const { calculateSectorMetrics } = await import('../services/sectorAnalysisService.js');
    const results = await calculateSectorMetrics();
    
    res.status(200).json({
      success: true,
      message: 'Sector metrics calculation completed',
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update skill related roles mapping
 * POST /api/v1/admin/skills/update-roles
 */
router.post('/skills/update-roles', async (req, res, next) => {
  try {
    console.log('📋 Admin triggered skill-roles mapping update');
    
    const { updateSkillRelatedRoles } = await import('../services/skillEnrichmentService.js');
    const result = await updateSkillRelatedRoles();
    
    res.status(200).json({
      success: true,
      message: 'Skill-roles mapping completed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get population status
 * GET /api/v1/admin/population/status
 */
router.get('/population/status', async (req, res, next) => {
  try {
    const status = await getPopulationStatus();
    
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get aggregation details
 * GET /api/v1/admin/population/aggregation
 */
router.get('/population/aggregation', async (req, res, next) => {
  try {
    const status = await getAggregationStatus();
    
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get cache statistics
 * GET /api/v1/admin/cache/stats
 */
router.get('/cache/stats', async (req, res, next) => {
  try {
    const cacheMetadata = await CacheMetadata.find();
    
    const totalJobs = await JobPosting.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalSectors = await Sector.countDocuments();

    const stats = {
      lastUpdated: new Date(),
      jobCounts: {
        total: totalJobs,
        bySource: {
          jobaps: await JobPosting.countDocuments({ source: 'jobaps' }),
          usajobs: await JobPosting.countDocuments({ source: 'usajobs' }),
          indeed: await JobPosting.countDocuments({ source: 'indeed' }),
          linkedin: await JobPosting.countDocuments({ source: 'linkedin' }),
        },
      },
      skillStats: {
        total: totalSkills,
        categories: await Skill.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),
      },
      sectorStats: {
        total: totalSectors,
      },
      cacheMetadata,
    };
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get overall workforce pulse
 * GET /api/v1/admin/pulse/summary
 */
router.get('/pulse/summary', async (req, res, next) => {
  try {
    const pulse = await calculateWorkforcePulse();
    
    res.json({
      success: true,
      data: pulse,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all sectors summary
 * GET /api/v1/admin/sectors/summary
 */
router.get('/sectors/summary', async (req, res, next) => {
  try {
    const sectors = await getAllSectorsSummary();
    
    res.json({
      success: true,
      count: sectors.length,
      data: sectors,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get top skills
 * GET /api/v1/admin/skills/top
 */
router.get('/skills/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skills = await getTopSkills(limit);
    
    res.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Clear cache (use with caution)
 * POST /api/v1/admin/cache/clear
 */
router.post('/cache/clear', async (req, res, next) => {
  try {
    const { types = ['jobs'] } = req.body;
    
    console.warn('⚠️  Admin clearing cache for types:', types);
    
    const results = {};
    
    if (types.includes('jobs')) {
      results.jobsDeleted = await JobPosting.deleteMany({ source: 'indeed' });
    }
    
    if (types.includes('cache-metadata')) {
      results.cacheMetadataDeleted = await CacheMetadata.deleteMany({});
    }
    
    res.json({
      success: true,
      message: 'Cache cleared',
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check endpoint
 * GET /api/v1/admin/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export default router;
