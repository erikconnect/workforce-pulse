import JobPosting from '../models/JobPosting.js';
import CacheMetadata from '../models/CacheMetadata.js';

// Get all job postings with filters
export const getJobs = async (req, res, next) => {
  try {
    const {
      sectorId,
      source,
      limit = 50,
      skip = 0,
      sortBy = 'postedDate',
      order = 'desc',
    } = req.query;

    const filter = {};
    if (sectorId) filter.sectorId = sectorId;
    if (source) filter.source = source;

    const jobs = await JobPosting.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await JobPosting.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get job insights
export const getJobInsights = async (req, res, next) => {
  try {
    const totalPostings = await JobPosting.countDocuments();
    
    // Top roles with extracted skills
    const topRolesRaw = await JobPosting.aggregate([
      { $group: { 
        _id: '$title', 
        count: { $sum: 1 }, 
        sectorId: { $first: '$sectorId' },
        allSkills: { $push: '$extractedSkills' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Process top roles to include requiredSkills
    const topRoles = topRolesRaw.map(role => {
      // Flatten and count skill occurrences across all jobs for this role
      const skillFreq = {};
      for (const skillsArray of role.allSkills) {
        if (Array.isArray(skillsArray)) {
          for (const skill of skillsArray) {
            skillFreq[skill] = (skillFreq[skill] || 0) + 1;
          }
        }
      }

      // Get top 5 most frequent skills for this role (appearing in at least 20% of jobs)
      const threshold = Math.max(1, Math.ceil(role.count * 0.2));
      const requiredSkills = Object.entries(skillFreq)
        .filter(([_, count]) => count >= threshold)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill]) => skill.toLowerCase()
          .replace(/[/:()]/g, '-')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''));

      return {
        title: role._id,
        count: role.count,
        sectorId: role.sectorId,
        requiredSkills,
      };
    });

    // Top skills
    const topSkills = await JobPosting.aggregate([
      { $unwind: '$extractedSkills' },
      { $group: { _id: '$extractedSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { name: '$_id', count: 1, growthSignal: 'steady', _id: 0 } },
    ]);

    // Sector breakdown
    const sectorBreakdown = await JobPosting.aggregate([
      { $match: { sectorId: { $ne: null } } },
      { $group: { _id: '$sectorId', count: { $sum: 1 } } },
      { $project: { sectorId: '$_id', count: 1, percentChange: { $literal: 0 }, _id: 0 } },
    ]);

    // Critical roles count (public-safety sector)
    const criticalRolesCount = await JobPosting.countDocuments({ sectorId: 'public-safety' });

    // Postings by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const postingsByDay = await JobPosting.aggregate([
      { $match: { postedDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$postedDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: {
        totalPostings,
        lastUpdated: new Date().toISOString(),
        topRoles,
        topSkills,
        sectorBreakdown,
        criticalRolesCount,
        postingsByDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create or update job posting
export const upsertJob = async (req, res, next) => {
  try {
    const job = await JobPosting.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk upsert jobs
export const bulkUpsertJobs = async (req, res, next) => {
  try {
    const { jobs } = req.body;

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'jobs array is required and must not be empty' },
      });
    }

    const now = new Date();
    const newJobIds = new Set(jobs.map(j => j.id));
    
    // Find which jobs already exist
    const existingJobs = await JobPosting.find({ id: { $in: Array.from(newJobIds) } });
    const existingIds = new Set(existingJobs.map(j => j.id));
    
    // Build bulk operations with proper tracking
    const bulkOps = jobs.map(job => {
      const isNew = !existingIds.has(job.id);
      
      return {
        updateOne: {
          filter: { id: job.id },
          update: isNew 
            ? {
                $set: {
                  ...job,
                  firstScrapedAt: now,
                  lastScrapedAt: now,
                  scrapedCount: 1,
                  isActive: true,
                }
              }
            : {
                $set: {
                  ...job,
                  lastScrapedAt: now,
                  isActive: true,
                },
                $inc: { scrapedCount: 1 },
              },
          upsert: true,
        },
      };
    });

    const result = await JobPosting.bulkWrite(bulkOps);
    
    // upsertedCount = newly inserted; matchedCount = existing documents seen again
    const newCount = result.upsertedCount;
    const updatedCount = result.matchedCount;

    // Touch cache to mark jobs as fresh
    const totalJobs = await JobPosting.countDocuments();
    await CacheMetadata.touch('jobs', totalJobs, 'scrape');

    res.json({
      success: true,
      data: {
        newJobs: newCount,
        updatedJobs: updatedCount,
        reoccurringJobs: updatedCount, // Same job found multiple times
        totalProcessed: jobs.length,
        uniqueCount: newJobIds.size,
        summary: {
          total: jobs.length,
          new: newCount,
          updated: updatedCount,
          timestamp: now.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get scraping statistics
export const getScrapingStats = async (req, res, next) => {
  try {
    const totalJobs = await JobPosting.countDocuments();
    const activeJobs = await JobPosting.countDocuments({ isActive: true });
    const inactiveJobs = await JobPosting.countDocuments({ isActive: false });
    
    // Jobs scraped once (new in last collection)
    const newJobs = await JobPosting.countDocuments({ scrapedCount: 1 });
    
    // Jobs found multiple times (recurring)
    const recurringJobs = await JobPosting.countDocuments({ scrapedCount: { $gt: 1 } });
    
    // Top recurring jobs (found most often)
    const topRecurring = await JobPosting.find({ scrapedCount: { $gt: 1 } })
      .sort({ scrapedCount: -1 })
      .limit(10)
      .select('title org scrapedCount source lastScrapedAt');

    // Scraping by source
    const sourceBreakdown = await JobPosting.aggregate([
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$scrapedCount', 1] }, 1, 0] } },
          recurring: { $sum: { $cond: [{ $gt: ['$scrapedCount', 1] }, 1, 0] } },
          avgScrapedCount: { $avg: '$scrapedCount' },
        }
      },
      {
        $project: {
          source: '$_id',
          total: 1,
          new: 1,
          recurring: 1,
          avgScrapedCount: { $round: ['$avgScrapedCount', 2] },
          _id: 0,
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Last scrape time
    const lastScrape = await JobPosting.findOne()
      .sort({ lastScrapedAt: -1 })
      .select('lastScrapedAt');

    // Most scraped jobs (all time)
    const mostScraped = await JobPosting.find()
      .sort({ scrapedCount: -1 })
      .limit(5)
      .select('title org scrapedCount source');

    res.json({
      success: true,
      data: {
        summary: {
          totalJobs,
          activeJobs,
          inactiveJobs,
          newJobs,
          recurringJobs,
          recursionRate: totalJobs > 0 ? ((recurringJobs / totalJobs) * 100).toFixed(2) + '%' : '0%',
        },
        sourceBreakdown,
        topRecurring,
        mostScraped,
        lastScrapedAt: lastScrape?.lastScrapedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete all jobs
export const clearJobs = async (req, res, next) => {
  try {
    const result = await JobPosting.deleteMany({});

    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
