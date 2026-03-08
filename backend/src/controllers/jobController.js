import JobPosting from '../models/JobPosting.js';

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
    
    // Top roles
    const topRoles = await JobPosting.aggregate([
      { $group: { _id: '$title', count: { $sum: 1 }, sectorId: { $first: '$sectorId' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { title: '$_id', count: 1, sectorId: 1, _id: 0 } },
    ]);

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

    const bulkOps = jobs.map(job => ({
      updateOne: {
        filter: { id: job.id },
        update: { $set: job },
        upsert: true,
      },
    }));

    const result = await JobPosting.bulkWrite(bulkOps);

    res.json({
      success: true,
      data: {
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        total: jobs.length,
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
