import JobPosting from '../models/JobPosting.js';
import Sector from '../models/Sector.js';
import PulseCheckIn from '../models/PulseCheckIn.js';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isYesterday(reference, compare) {
  if (!reference || !compare) return false;
  const refStart = startOfDay(reference);
  const cmpStart = startOfDay(compare);
  const dayMs = 24 * 60 * 60 * 1000;
  return refStart.getTime() - cmpStart.getTime() === dayMs;
}

function timeAgo(fromDate) {
  const now = Date.now();
  const diffMs = Math.max(0, now - new Date(fromDate).getTime());
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function inferUrgency(sectorId) {
  if (sectorId === 'public-safety') return 'critical';
  if (sectorId === 'healthcare' || sectorId === 'construction') return 'watch';
  return 'stable';
}

async function getCheckInState(userId = 'local-user') {
  const record = await PulseCheckIn.findOne({ userId });
  if (!record) {
    return { streak: 0, lastCheckInDate: null, checkInCompleted: false };
  }

  const today = new Date();
  const completedToday = sameDay(record.lastCheckInDate, today);
  return {
    streak: record.streak || 0,
    lastCheckInDate: record.lastCheckInDate,
    checkInCompleted: completedToday,
  };
}

// GET /api/v1/pulse/alerts
export const getPulseAlerts = async (req, res, next) => {
  try {
    const [criticalSectors, criticalRolesCount] = await Promise.all([
      Sector.find({ status: 'critical' }).select({ id: 1, name: 1, _id: 0 }).limit(3),
      JobPosting.countDocuments({ sectorId: 'public-safety' }),
    ]);

    const alerts = [];

    if (criticalRolesCount > 0) {
      alerts.push({
        id: 'alert-critical-roles',
        severity: criticalRolesCount >= 20 ? 'critical' : 'watch',
        message: `Public Safety has ${criticalRolesCount} active openings requiring attention.`,
        cta: { label: 'View sector', href: '/sectors/public-safety' },
        dismissible: false,
      });
    }

    for (const sector of criticalSectors) {
      alerts.push({
        id: `alert-sector-${sector.id}`,
        severity: 'critical',
        message: `${sector.name} is in critical status and needs intervention planning.`,
        cta: { label: 'Open sector', href: `/sectors/${sector.id}` },
        dismissible: true,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'alert-stable-overview',
        severity: 'stable',
        message: 'Workforce pulse is stable. Keep monitoring hiring velocity and skills demand.',
        dismissible: true,
      });
    }

    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/pulse/summary
export const getPulseSummary = async (req, res, next) => {
  try {
    const [criticalRolesCount, topSkills, openRolesTotal, checkIn] = await Promise.all([
      JobPosting.countDocuments({ sectorId: 'public-safety' }),
      JobPosting.aggregate([
        { $unwind: '$extractedSkills' },
        { $group: { _id: '$extractedSkills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $project: { _id: 0, name: '$_id' } },
      ]),
      Sector.aggregate([
        { $group: { _id: null, total: { $sum: '$openRolesCount' } } },
      ]),
      getCheckInState('local-user'),
    ]);

    const trainingNeedsCount = (openRolesTotal[0]?.total || 0);
    const overallStatus = criticalRolesCount >= 20
      ? 'critical'
      : criticalRolesCount >= 8
        ? 'watch'
        : 'stable';

    res.json({
      date: new Date().toISOString().slice(0, 10),
      criticalRolesCount,
      fastestRisingSkills: topSkills.map((s) => s.name),
      trainingNeedsCount,
      overallStatus,
      checkInStreak: checkIn.streak,
      checkInCompleted: checkIn.checkInCompleted,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/pulse/check-in
export const submitPulseCheckIn = async (req, res, next) => {
  try {
    const userId = req.body?.userId || 'local-user';
    const today = new Date();

    let record = await PulseCheckIn.findOne({ userId });
    if (!record) {
      record = await PulseCheckIn.create({ userId, streak: 1, lastCheckInDate: today });
      return res.json({ streak: 1 });
    }

    if (sameDay(record.lastCheckInDate, today)) {
      return res.status(409).json({
        success: false,
        error: { message: "Today's check-in has already been completed." },
      });
    }

    record.streak = isYesterday(today, record.lastCheckInDate)
      ? (record.streak || 0) + 1
      : 1;
    record.lastCheckInDate = today;
    await record.save();

    res.json({ streak: record.streak });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/pulse/recent-postings
export const getRecentPostings = async (req, res, next) => {
  try {
    const jobs = await JobPosting.find({})
      .sort({ postedDate: -1 })
      .limit(10)
      .select({ id: 1, title: 1, org: 1, sectorId: 1, postedDate: 1, _id: 0 });

    const postings = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      org: job.org,
      urgency: inferUrgency(job.sectorId),
      timeAgo: timeAgo(job.postedDate),
    }));

    res.json(postings);
  } catch (error) {
    next(error);
  }
};
