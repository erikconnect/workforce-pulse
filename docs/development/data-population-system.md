# Data Population System Documentation

## Overview

The Workforce Pulse Data Population System automatically aggregates job market data from multiple sources, enriches it with skills extraction, and calculates sector metrics. All data is stored in MongoDB for optimal performance and reduced API calls.

## Architecture

### Services

#### 1. **Data Aggregation Service** (`dataAggregationService.js`)
Fetches job postings from all configured sources:
- **JobAps RSS**: Montgomery city jobs
- **USAJOBS API**: Federal government jobs
- **Bright Data**: Indeed/LinkedIn jobs (manual trigger)
- **ArcGIS APIs**: Construction permits, 911 calls (future)

**Key Functions:**
- `aggregateAllJobs()`: Main aggregation pipeline
- `fetchJobApsJobs()`: Fetch from JobAps RSS
- `fetchUSAJobsJobs()`: Fetch from USAJOBS API
- `getAggregationStatus()`: Get current data status

#### 2. **Skill Enrichment Service** (`skillEnrichmentService.js`)
Extracts and analyzes skills from job descriptions:
- **Taxonomy-based extraction**: 100+ predefined skills across categories
- **Demand calculation**: Ranks skills by job posting frequency
- **Categories**: Technical, Healthcare, Soft Skills, Tools, Certifications

**Key Functions:**
- `enrichJobsWithSkills()`: Extract skills from job descriptions
- `calculateSkillDemand()`: Calculate demand metrics per skill
- `getTopSkills(limit)`: Get top in-demand skills

#### 3. **Sector Analysis Service** (`sectorAnalysisService.js`)
Calculates sector KPIs and pulse scores:
- **Pulse Score**: 0-100 based on job volume, growth, and skill requirements
- **Trend Analysis**: Week-over-week posting changes
- **Sparkline Data**: 7-day historical trend visualization
- **Status Levels**: Critical, Watch, Stable

**Key Functions:**
- `calculateSectorMetrics()`: Compute sector KPIs
- `calculateWorkforcePulse()`: Overall workforce health
- `getSectorWithMetrics(sectorId)`: Detailed sector view

#### 4. **Data Population Orchestrator** (`dataPopulationOrchestrator.js`)
Coordinates all services in proper sequence:
1. Fetch jobs from all sources
2. Extract skills from descriptions
3. Calculate skill demand
4. Update sector metrics & pulse
5. Generate reports

**Key Functions:**
- `runDataPopulationPipeline()`: Complete pipeline execution
- `scheduleDataPopulation(intervalMinutes)`: Automatic scheduling
- `getPopulationStatus()`: Status dashboard

### Admin Endpoints

All endpoints require no authentication in development (add middleware for production).

#### Manual Triggers
```bash
# Run complete pipeline
POST /api/v1/admin/populate/run-pipeline

# Run jobs aggregation only
POST /api/v1/admin/populate/jobs

# Run skill extraction only
POST /api/v1/admin/populate/skills

# Run sector metrics only
POST /api/v1/admin/populate/sectors
```

#### Status & Monitoring
```bash
# Pipeline status
GET /api/v1/admin/population/status

# Aggregation details
GET /api/v1/admin/population/aggregation

# Cache statistics
GET /api/v1/admin/cache/stats

# Workforce pulse summary
GET /api/v1/admin/pulse/summary

# All sectors summary
GET /api/v1/admin/sectors/summary

# Top skills
GET /api/v1/admin/skills/top?limit=20
```

#### Maintenance
```bash
# Clear cache (⚠️ use with caution)
POST /api/v1/admin/cache/clear
Body: { "types": ["jobs", "cache-metadata"] }

# Health check
GET /api/v1/admin/health
```

## Configuration

### Environment Variables

```env
# Data Sources
JOBAPS_RSS_URL=https://jobapscloud.com/MGM/rss.asp
USAJOBS_API_KEY=your_api_key
USAJOBS_USER_AGENT=your_email@example.com
BRIGHT_DATA_BROWSER_WSS=wss://your_bright_data_url

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/workforce-pulse

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Data Population Scheduler
DATA_SYNC_INTERVAL_MINUTES=60  # Run pipeline every 60 minutes
```

## Workflow

### Automatic Population (Scheduled)

1. **Server Startup**: Data population scheduler initializes automatically
2. **Interval Trigger**: Runs at configured interval (default: 60 minutes)
3. **Pipeline Execution**: 
   - Fetches from all sources
   - Extracts skills
   - Calculates metrics
   - Updates MongoDB
4. **Logging**: All operations logged to console

### Manual Population

**Via cURL:**
```bash
# Trigger complete pipeline
curl -X POST http://localhost:5000/api/v1/admin/populate/run-pipeline

# Check status
curl http://localhost:5000/api/v1/admin/population/status | jq
```

**Via Admin Dashboard** (recommended):
1. Navigate to Admin section
2. Click "Populate Data"
3. View real-time progress
4. Check metrics in dashboard

## Data Flow Diagram

```
External Sources
├─ JobAps RSS
├─ USAJOBS API
├─ Bright Data (Indeed)
└─ ArcGIS APIs
      ↓
Data Aggregation Service
      ↓
JobPostings stored in MongoDB
      ↓
Skill Enrichment Service
      ├─ Extract skills
      └─ Calculate demand → Skill Collection
      ↓
Sector Analysis Service
      ├─ Calculate KPIs
      ├─ Compute pulse scores
      └─ Generate trends → Sector Collection
      ↓
Frontend/Dashboard
├─ Jobs listing
├─ Skill recommendations
├─ Sector insights
└─ Workforce pulse
```

## Database Schema

### JobPosting
```javascript
{
  id: String,              // Unique identifier
  title: String,           // Job title
  org: String,            // Organization name
  location: String,       // Job location
  postedDate: Date,       // Posted timestamp
  description: String,    // Full job description
  source: String,         // jobaps|usajobs|indeed|linkedin
  url: String,           // Application URL
  sectorId: String,      // Mapped sector (auto-identified)
  extractedSkills: [String], // Extracted skills from description
  salary: String,        // Salary range if available
  jobType: String,       // full-time|part-time|contract|etc
  scrapedCount: Number,  // Times this job was scraped
  isActive: Boolean,     // Current/archived flag
  timestamps: Dates      // Created/updated
}
```

### Skill
```javascript
{
  name: String,           // Skill name
  category: String,       // technical|healthcare|soft|tool|certification
  demandLevel: String,    // critical|watch|stable
  demandSignal: Number,   // # of job postings with this skill
  jobCount: Number,       // Job postings containing skill
  sparklineData: [Number], // 7-day trend data
  lastUpdated: Date       // Last calculation time
}
```

### Sector
```javascript
{
  id: String,            // Unique sector ID
  name: String,          // Sector name
  pulseScore: Number,    // 0-100 health score
  status: String,        // critical|watch|stable
  openRolesCount: Number, // Active jobs in sector
  employeeCount: Number, // Estimated workforce in sector
  kpis: [               // Key performance indicators
    {
      label: String,     // e.g., "Postings (7d)"
      value: Mixed,      // Raw value
      delta: Number,     // Week-over-week change %
      status: String     // critical|watch|stable
    }
  ],
  sparklineData: [Number], // 7-day posting trend
  lastCalculated: Date   // Last metrics update
}
```

## Performance Optimization

### Caching Strategy
- **MongoDB indexes**: On frequently queried fields
- **Aggregation pipeline**: For complex analytics
- **CacheMetadata**: Tracks last update timestamps
- **TTL**: Configurable cache expiration (default 24h)

### Query Optimization
- Bulk upsert for job postings (10,000+ docs)
- Aggregation pipeline for analytics
- Sparse indexes on optional fields
- Pagination for large result sets

### API Rate Limiting
- JobAps RSS: No rate limit (free)
- USAJOBS: Official API throttling
- Bright Data: Managed via account
- Implement request retry with backoff

## Troubleshooting

### Issue: "Job aggregation returns 0 results"
**Solution:**
1. Check environment variables configured
2. Verify network access to APIs
3. Check API credentials/keys
4. Review MongoDB connection
5. Check logs for API errors

### Issue: "Skill extraction too slow"
**Solution:**
1. Reduce job batch size
2. Run during off-peak hours
3. Consider async/parallel processing
4. Index on extractedSkills field

### Issue: "Sector metrics not updating"
**Solution:**
1. Ensure jobs are properly mapped to sectors
2. Check sector IDs match between Job and Sector collections
3. Verify CacheMetadata timestamps
4. Check MongoDB connection persistence

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable authentication on `/api/v1/admin/*` endpoints
- [ ] Configure rate limiting middleware
- [ ] Set up MongoDB backups
- [ ] Configure monitoring/alerting
- [ ] Set reasonable `DATA_SYNC_INTERVAL_MINUTES` (60-180 min)
- [ ] Test full pipeline in staging
- [ ] Set up error logging/reporting
- [ ] Document custom sector mappings
- [ ] Plan skill taxonomy updates

## API Response Examples

### Population Status
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-03-08T10:30:00Z",
    "aggregation": {
      "totalJobs": 3247,
      "jobsBySource": {
        "jobaps": 1200,
        "usajobs": 847,
        "indeed": 1200,
        "linkedin": 0
      },
      "cacheMetadata": [...]
    },
    "readyForUse": true
  }
}
```

### Skill Top List
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "name": "nursing",
      "category": "healthcare",
      "demandLevel": "critical",
      "jobCount": 342,
      "sparklineData": [45, 48, 52, 55, 58, 60, 62]
    },
    {
      "name": "python",
      "category": "technical",
      "demandLevel": "critical",
      "jobCount": 287,
      "sparklineData": [35, 38, 40, 42, 45, 48, 50]
    }
  ]
}
```

### Sector Summary
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "public-safety",
      "name": "Public Safety",
      "pulseScore": 78,
      "status": "critical",
      "openRoles": 312,
      "kpis": [
        {
          "label": "Postings (7d)",
          "value": 214,
          "delta": 12,
          "status": "critical"
        }
      ]
    }
  ]
}
```

## Next Steps

1. **Start the server**: `npm run dev`
2. **Check health**: `GET /health`
3. **Trigger first population**: `POST /api/v1/admin/populate/run-pipeline`
4. **Monitor progress**: `GET /api/v1/admin/population/status`
5. **View results**: Check sectors, skills, and jobs endpoints
6. **Configure scheduling**: Set `DATA_SYNC_INTERVAL_MINUTES` as needed

## Support

For issues or questions:
1. Check logs in terminal/console
2. Review MongoDB connection
3. Verify all API credentials
4. Check network connectivity
5. Review troubleshooting section
