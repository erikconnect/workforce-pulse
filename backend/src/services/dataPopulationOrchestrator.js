/**
 * Data Population Orchestrator
 * Coordinates all data aggregation, enrichment, and calculation services
 * Handles scheduling and logging
 */

import {
  aggregateAllJobs,
  getAggregationStatus,
} from './dataAggregationService.js';
import {
  enrichJobsWithSkills,
  calculateSkillDemand,
} from './skillEnrichmentService.js';
import {
  calculateSectorMetrics,
  calculateWorkforcePulse,
} from './sectorAnalysisService.js';

/**
 * Run complete data population pipeline
 * Order matters: jobs → skills → sectors → pulse
 */
export async function runDataPopulationPipeline() {
  const pipelineStart = Date.now();
  const results = {
    startTime: new Date().toISOString(),
    steps: {},
    totalDuration: null,
    success: false,
    error: null,
  };

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING DATA POPULATION PIPELINE');
    console.log('='.repeat(60));

    // Step 1: Aggregate jobs from all sources
    console.log('\n[1/4] Aggregating jobs from all sources...');
    try {
      const aggregationResult = await aggregateAllJobs();
      results.steps.aggregation = aggregationResult;
      console.log(`✅ Step 1 complete`);
    } catch (error) {
      console.error(`❌ Step 1 failed:`, error.message);
      results.steps.aggregation = { error: error.message, success: false };
      throw error;
    }

    // Step 2: Extract skills from job descriptions
    console.log('\n[2/4] Extracting skills from job descriptions...');
    try {
      const enrichmentResult = await enrichJobsWithSkills();
      results.steps.enrichment = enrichmentResult;
      console.log(`✅ Step 2 complete`);
    } catch (error) {
      console.error(`❌ Step 2 failed:`, error.message);
      results.steps.enrichment = { error: error.message, success: false };
      // Continue despite skill extraction failure
    }

    // Step 3: Calculate skill demand metrics
    console.log('\n[3/4] Calculating skill demand metrics...');
    try {
      const skillDemandResult = await calculateSkillDemand();
      results.steps.skillDemand = skillDemandResult;
      console.log(`✅ Step 3 complete`);
    } catch (error) {
      console.error(`❌ Step 3 failed:`, error.message);
      results.steps.skillDemand = { error: error.message, success: false };
      // Continue despite skill demand failure
    }

    // Step 4: Calculate sector metrics and pulse
    console.log('\n[4/4] Calculating sector metrics and pulse...');
    try {
      const sectorMetricsResult = await calculateSectorMetrics();
      results.steps.sectorMetrics = sectorMetricsResult;

      const pulseResult = await calculateWorkforcePulse();
      results.steps.pulse = pulseResult;

      console.log(`✅ Step 4 complete`);
    } catch (error) {
      console.error(`❌ Step 4 failed:`, error.message);
      results.steps.sectorMetrics = { error: error.message, success: false };
      // Continue despite sector metrics failure
    }

    results.success = true;
    const totalDuration = ((Date.now() - pipelineStart) / 1000).toFixed(2);
    results.totalDuration = totalDuration;

    console.log('\n' + '='.repeat(60));
    console.log('✅ PIPELINE COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total time: ${totalDuration}s`);
    console.log(`📊 Results summary:`);
    console.log(JSON.stringify(results.steps, null, 2));
    console.log('='.repeat(60) + '\n');

    return results;
  } catch (error) {
    results.success = false;
    results.error = error instanceof Error ? error.message : String(error);
    const totalDuration = ((Date.now() - pipelineStart) / 1000).toFixed(2);
    results.totalDuration = totalDuration;

    console.log('\n' + '='.repeat(60));
    console.log('❌ PIPELINE FAILED');
    console.log('='.repeat(60));
    console.log(`⏱️  Time before failure: ${totalDuration}s`);
    console.log(`Error: ${results.error}`);
    console.log('='.repeat(60) + '\n');

    return results;
  }
}

/**
 * Get status of data population
 */
export async function getPopulationStatus() {
  try {
    const aggregationStatus = await getAggregationStatus();
    
    return {
      timestamp: new Date().toISOString(),
      aggregation: aggregationStatus,
      readyForUse: aggregationStatus.totalJobs > 0,
    };
  } catch (error) {
    console.error('Error getting population status:', error.message);
    throw error;
  }
}

/**
 * Schedule data population on interval
 * Call this in server startup
 */
export function scheduleDataPopulation(intervalMinutes = 60) {
  try {
    console.log(`📅 Scheduling data population every ${intervalMinutes} minutes`);

    // Run immediately on startup
    runDataPopulationPipeline().catch(error => {
      console.error('❌ Initial pipeline run failed:', error.message);
    });

    // Schedule recurring
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      console.log(`\n⏰ Scheduled data population triggered (interval: ${intervalMinutes} min)`);
      runDataPopulationPipeline().catch(error => {
        console.error('❌ Scheduled pipeline run failed:', error.message);
      });
    }, intervalMs);

    console.log('✅ Data population scheduler initialized');
  } catch (error) {
    console.error('Error scheduling data population:', error.message);
  }
}

export default {
  runDataPopulationPipeline,
  getPopulationStatus,
  scheduleDataPopulation,
};
