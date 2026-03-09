# MongoDB Job Scraping Tracker

## Overview

The scraping system now fully persists all job data to MongoDB with comprehensive tracking of new vs existing jobs. This allows you to see real numbers on:

- **New Jobs**: Jobs discovered for the first time in this scrape
- **Recurring Jobs**: Jobs that were already in the database and found again
- **Scrape Count**: How many times each job has been discovered across all scrapes
- **Last Scraped**: When each job was last seen in an active scrape

## Database Schema Updates

### JobPosting Model Fields

```javascript
{
  // ... existing fields ...
  
  // NEW TRACKING FIELDS
  scrapedCount: {
    type: Number,           // How many times this job has been found
    default: 1,
    index: true,
  },
  firstScrapedAt: {
    type: Date,            // When this job was first discovered
    default: Date.now,
    index: true,
  },
  lastScrapedAt: {
    type: Date,            // When this job was last found
    default: Date.now,
    index: true,
  },
  isActive: {
    type: Boolean,         // Whether job was found in last scrape
    default: true,
    index: true,
  },
}
```

## Key Endpoints

### 1. POST /api/v1/jobs/bulk - Bulk Upsert with Stats

Saves jobs and returns detailed statistics about new vs existing jobs.

**Response Example:**

```json
{
  "success": true,
  "data": {
    "newJobs": 45,
    "updatedJobs": 120,
    "reoccurringJobs": 120,
    "totalProcessed": 165,
    "uniqueCount": 165,
    "summary": {
      "total": 165,
      "new": 45,
      "updated": 120,
      "timestamp": "2026-03-08T10:30:00Z"
    }
  }
}
```

### 2. GET /api/v1/jobs/stats - Scraping Statistics

Get comprehensive statistics about scraped jobs from all sources.

**Response Example:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalJobs": 1250,
      "activeJobs": 1150,
      "inactiveJobs": 100,
      "newJobs": 320,
      "recurringJobs": 930,
      "recursionRate": "74.4%"
    },
    "sourceBreakdown": [
      {
        "source": "indeed",
        "total": 450,
        "new": 120,
        "recurring": 330,
        "avgScrapedCount": 2.8
      }
    ],
    "topRecurring": [
      {
        "title": "Police Officer",
        "org": "City of Montgomery",
        "scrapedCount": 15,
        "source": "jobaps"
      }
    ],
    "mostScraped": [
      {
        "title": "Firefighter",
        "org": "Fire Department",
        "scrapedCount": 22,
        "source": "usajobs"
      }
    ],
    "lastScrapedAt": "2026-03-08T10:15:00Z"
  }
}
```

### 3. GET /api/jobs/stats - Frontend Stats Endpoint

Frontend proxy to the backend stats endpoint.

## Frontend Components

### useScrapingStats Hook

```typescript
import { useScrapingStats } from "@/hooks/use-scraping-stats";

const { stats, isLoading, error, refetch } = useScrapingStats();
// Auto-refreshes every 30 seconds
// stats includes: summary, sourceBreakdown, topRecurring, mostScraped
```

### ScrapingStatsCard Component

```typescript
import { ScrapingStatsCard } from "@/components/dashboard/scraping-stats-card";

<ScrapingStatsCard />
```

Displays:

- Total jobs count
- New jobs (green badge with trending icon)
- Recurring jobs (blue badge with percentage)
- Last scrape time
- Source breakdown with new/recurring split
- Most frequently found jobs

## How It Works

### During a Scrape

1. **Aggregator** collects jobs from all sources (JobAps, USAJOBS, Indeed, LinkedIn, Glassdoor)
2. **Store.bulkUpsert()** sends jobs to backend API
3. **Backend Controller** does:
   - Checks which job IDs already exist in MongoDB
   - For NEW jobs: Sets `scrapedCount: 1`, `firstScrapedAt: now`
   - For EXISTING jobs: Increments `scrapedCount`, updates `lastScrapedAt`
   - Returns stats about new vs updated jobs
4. **Frontend** receives stats and can display them to users

### Tracking Metrics

- **New Jobs**: `scrapedCount === 1` after first scrape
- **Recurring Jobs**: `scrapedCount > 1` (found multiple times)
- **Active**: `isActive: true` (found in recent scrapes)
- **Recursion Rate**: `recurringJobs / totalJobs * 100%`
- **Average Scrapes per Job**: `totalScrapedCount / totalJobs`

## Example Insights

From these metrics, you can answer:

✅ "How many new jobs did we find today?" → `stats.summary.newJobs`  
✅ "What % of jobs are recurring?" → `stats.summary.recursionRate`  
✅ "Which jobs keep reappearing?" → `stats.topRecurring`  
✅ "Which source has the most new jobs?" → `stats.sourceBreakdown[].new` (sorted)  
✅ "What's the net new jobs over time?" → Track `newJobs` per scrape over time  

## Implementation Notes

### Indexes for Performance

- `{ scrapedCount: 1, lastScrapedAt: -1 }` - Find active recurring jobs
- `{ isActive: 1, lastScrapedAt: -1 }` - Find recently scraped jobs
- `{ source: 1, postedDate: -1 }` - Filter by source
- `{ sectorId: 1, postedDate: -1 }` - Filter by sector

### Query Examples

```javascript
// Get all recurring jobs (found multiple times)
await JobPosting.find({ scrapedCount: { $gt: 1 } })
  .sort({ scrapedCount: -1 });

// Get most frequently found jobs in last 7 days
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
await JobPosting.find({ lastScrapedAt: { $gte: sevenDaysAgo } })
  .sort({ scrapedCount: -1 });

// Get inactive jobs (not found recently)
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await JobPosting.find({ 
  lastScrapedAt: { $lt: thirtyDaysAgo },
  isActive: true 
}).select('title org source');

// Get jobs by source with stats
await JobPosting.aggregate([
  { $match: { source: 'indeed' } },
  { $group: {
      _id: null,
      total: { $sum: 1 },
      recurring: { $sum: { $cond: [{ $gt: ['$scrapedCount', 1] }, 1, 0] } },
      avgScrapedCount: { $avg: '$scrapedCount' }
    }
  }
]);
```

## Next Steps

1. **View Dashboard**: Visit `/dashboard` to see the ScrapingStatsCard
2. **Manual Scrape**: POST to `/api/jobs/scrape` to trigger a full scrape
3. **Track Over Time**: Implement a cron job to log `stats` periodically
4. **Build Reports**: Create charts showing new jobs/source over time
5. **Alert System**: Set up alerts when recursion rate exceeds thresholds

## Files Changed

- `backend/src/models/JobPosting.js` - Added tracking fields
- `backend/src/controllers/jobController.js` - Enhanced bulkUpsertJobs and added getScrapingStats
- `backend/src/routes/jobRoutes.js` - Added /stats endpoint
- `src/app/api/jobs/store.ts` - Track bulk upsert stats
- `src/app/api/jobs/stats/route.ts` - New frontend stats proxy
- `src/hooks/use-scraping-stats.ts` - New React hook for stats
- `src/components/dashboard/scraping-stats-card.tsx` - New dashboard component
- `src/app/api/jobs/scrape-cache.ts` - Enhanced with stats tracking
