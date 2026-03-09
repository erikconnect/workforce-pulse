/**
 * Sector Analysis Service
 * Calculates sector metrics, pulse scores, and KPIs based on job market data
 */

import JobPosting from '../models/JobPosting.js';
import Sector from '../models/Sector.js';
import CacheMetadata from '../models/CacheMetadata.js';

/**
 * Calculate pulse status based on score
 */
function calculatePulseStatus(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'watch';
  return 'stable';
}

/**
 * Calculate sector metrics from job data
 */
export async function calculateSectorMetrics() {
  try {
    console.log('\n🔄 Calculating sector metrics...');
    const startTime = Date.now();

    // Get all existing sectors
    const sectors = await Sector.find();
    console.log(`Processing ${sectors.length} sectors`);

    let metricsCalculated = 0;

    for (const sector of sectors) {
      // Count active jobs in sector
      const activeJobCount = await JobPosting.countDocuments({
        sectorId: sector.id,
        isActive: true,
      });

      // Get 7-day postings
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentPostingCount = await JobPosting.countDocuments({
        sectorId: sector.id,
        postedDate: { $gte: sevenDaysAgo },
        isActive: true,
      });

      // Get 14-day postings for comparison
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const previousPeriodCount = await JobPosting.countDocuments({
        sectorId: sector.id,
        postedDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
        isActive: true,
      });

      // Calculate week-over-week change
      const woWChange = previousPeriodCount > 0 
        ? Math.round((recentPostingCount - previousPeriodCount) / previousPeriodCount * 100)
        : recentPostingCount > 0 ? 100 : 0;

      // Get top skills in sector (unique skillset indicator)
      const sectorSkills = await JobPosting.aggregate([
        { $match: { sectorId: sector.id, isActive: true } },
        { $unwind: '$extractedSkills' },
        { $group: { _id: '$extractedSkills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      const topSkillsCount = sectorSkills.length;

      // Calculate pulse score (0-100)
      // Factors: job volume (40%), growth (40%), skill requirements (20%)
      const maxJobsExpected = 500;
      const volumeScore = Math.min(100, (activeJobCount / maxJobsExpected) * 40);
      const growthScore = woWChange > 0 
        ? Math.min(40, Math.abs(woWChange))
        : Math.max(0, 40 + woWChange);
      const skillScore = topSkillsCount * 4; // 5 skills max = 20 points
      
      const pulseScore = Math.min(100, Math.round(
        (volumeScore + growthScore + skillScore) / 2
      ));

      const pulseStatus = calculatePulseStatus(pulseScore);

      // Generate sparkline data (7 days)
      const sparklineData = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayCount = await JobPosting.countDocuments({
          sectorId: sector.id,
          postedDate: { $gte: dayStart, $lte: dayEnd },
          isActive: true,
        });

        sparklineData.push(dayCount);
      }

      // Calculate critical roles (rare + high-demand skills)
      const criticalRoles = await JobPosting.countDocuments({
        sectorId: sector.id,
        isActive: true,
        extractedSkills: { $in: ['aws', 'kubernetes', 'nursing', 'engineering'] },
      });

      // Unmapped skills (skills that appear in jobs but aren't in our taxonomy)
      const unmappedCount = Math.max(0, topSkillsCount - 5);

      // Update KPIs
      const kpis = [
        {
          label: 'Postings (7d)',
          value: recentPostingCount,
          delta: woWChange,
          status: woWChange > 5 ? 'critical' : woWChange > 0 ? 'watch' : 'stable',
        },
        {
          label: 'WoW Change',
          value: `${woWChange > 0 ? '+' : ''}${woWChange}%`,
          delta: woWChange,
          status: woWChange > 10 ? 'critical' : woWChange > 0 ? 'watch' : 'stable',
        },
        {
          label: 'Critical Roles',
          value: criticalRoles,
          delta: 0,
          status: criticalRoles > 5 ? 'critical' : criticalRoles > 2 ? 'watch' : 'stable',
        },
        {
          label: 'Unmapped Skills',
          value: unmappedCount,
          delta: 0,
          status: unmappedCount > 5 ? 'critical' : unmappedCount > 2 ? 'watch' : 'stable',
        },
      ];

      // Update sector in database
      await Sector.findByIdAndUpdate(
        sector._id,
        {
          $set: {
            openRolesCount: activeJobCount,
            pulseScore,
            status: pulseStatus,
            kpis,
            sparklineData,
            lastCalculated: new Date(),
          },
        }
      );

      metricsCalculated++;
    }

    await CacheMetadata.findOneAndUpdate(
      { key: 'sector-metrics' },
      {
        key: 'sector-metrics',
        dataType: 'sectors',
        source: 'sector-metrics',
        lastFetched: new Date(),
        lastUpdated: new Date(),
        recordCount: metricsCalculated,
        sectorsCount: metricsCalculated,
        status: 'success',
      },
      { upsert: true }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Sector metrics calculation complete for ${metricsCalculated} sectors in ${duration}s\n`);

    return {
      success: true,
      sectorsCalculated: metricsCalculated,
      duration,
    };
  } catch (error) {
    console.error('❌ Error calculating sector metrics:', error.message);
    throw error;
  }
}

/**
 * Get sector with detailed metrics
 */
export async function getSectorWithMetrics(sectorId) {
  try {
    const sector = await Sector.findOne({ id: sectorId });
    if (!sector) {
      throw new Error(`Sector not found: ${sectorId}`);
    }

    // Get jobs in sector
    const jobs = await JobPosting.find({ sectorId: sector.id, isActive: true })
      .sort({ postedDate: -1 })
      .limit(100);

    // Get top roles in sector
    const topRoles = await JobPosting.aggregate([
      { $match: { sectorId: sector.id, isActive: true } },
      { $group: { _id: '$title', count: { $sum: 1 }, org: { $first: '$org' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { role: '$_id', count: 1, org: 1, _id: 0 } },
    ]);

    // Get top skills in sector
    const topSkills = await JobPosting.aggregate([
      { $match: { sectorId: sector.id, isActive: true } },
      { $unwind: '$extractedSkills' },
      { $group: { _id: '$extractedSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { skill: '$_id', count: 1, _id: 0 } },
    ]);

    return {
      sector: sector.toObject(),
      jobsInSector: jobs.length,
      recentJobs: jobs,
      topRoles,
      topSkills,
      lastCalculated: sector.lastCalculated,
    };
  } catch (error) {
    console.error('Error getting sector metrics:', error.message);
    throw error;
  }
}

/**
 * Get all sectors with summary metrics
 */
export async function getAllSectorsSummary() {
  try {
    const sectors = await Sector.find()
      .sort({ pulseScore: -1 })
      .select('id name pulseScore status kpis openRolesCount employeeCount');

    return sectors;
  } catch (error) {
    console.error('Error getting sectors summary:', error.message);
    throw error;
  }
}

/**
 * Calculate overall workforce pulse
 */
export async function calculateWorkforcePulse() {
  try {
    const sectors = await Sector.find();
    
    if (sectors.length === 0) {
      return {
        overallScore: 50,
        status: 'stable',
        sectors: [],
      };
    }

    // Calculate weighted average of sector scores
    const avgScore = Math.round(
      sectors.reduce((sum, s) => sum + s.pulseScore, 0) / sectors.length
    );

    // Count status distribution
    const statuses = {
      critical: sectors.filter(s => s.status === 'critical').length,
      watch: sectors.filter(s => s.status === 'watch').length,
      stable: sectors.filter(s => s.status === 'stable').length,
    };

    // Determine overall status
    let overallStatus = 'stable';
    if (statuses.critical > sectors.length * 0.3) {
      overallStatus = 'critical';
    } else if (statuses.watch > sectors.length * 0.3) {
      overallStatus = 'watch';
    }

    return {
      overallScore: avgScore,
      status: overallStatus,
      statusDistribution: statuses,
      totalSectors: sectors.length,
      sectors: sectors.map(s => ({
        id: s.id,
        name: s.name,
        score: s.pulseScore,
        status: s.status,
        openRoles: s.openRolesCount,
      })),
    };
  } catch (error) {
    console.error('Error calculating workforce pulse:', error.message);
    throw error;
  }
}
