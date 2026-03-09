# Implementation Guide - Data Population System

## Quick Start (5 minutes)

### 1. Verify Backend Files Created
Check that these files exist in `backend/src/`:
- ✅ `services/dataAggregationService.js`
- ✅ `services/skillEnrichmentService.js` 
- ✅ `services/sectorAnalysisService.js`
- ✅ `services/dataPopulationOrchestrator.js`
- ✅ `routes/adminRoutes.js`

### 2. Verify Model Updates
All models should have been updated:
- ✅ `models/Skill.js` - Added demandSignal, jobCount, lastUpdated
- ✅ `models/Sector.js` - Added lastCalculated field
- ✅ `models/CacheMetadata.js` - Updated schema for flexible keys

### 3. Verify Route Registration
Check `routes/index.js` contains:
```javascript
import adminRoutes from './adminRoutes.js';
// ...
router.use('/admin', adminRoutes);
```

### 4. Verify Server Initialization
Check `server.js` contains:
```javascript
import { scheduleDataPopulation } from './services/dataPopulationOrchestrator.js';
// ...
const DATA_SYNC_INTERVAL_MINUTES = parseInt(process.env.DATA_SYNC_INTERVAL_MINUTES) || 60;
// ...
scheduleDataPopulation(DATA_SYNC_INTERVAL_MINUTES);
```

## Step-by-Step Setup

### Step 1: Install Dependencies (if needed)
```bash
cd backend
npm install axios rss-parser
npm install  # Ensure all dependencies are installed
```

### Step 2: Configure Environment Variables
Add to `backend/.env`:
```env
# Required for data aggregation
JOBAPS_RSS_URL=https://jobapscloud.com/MGM/rss.asp
USAJOBS_API_KEY=your_usajobs_api_key_here
USAJOBS_USER_AGENT=your_email@example.com

# MongoDB (Windows)
MONGODB_URI=mongodb://127.0.0.1:27017/workforce-pulse

# Data population
DATA_SYNC_INTERVAL_MINUTES=60

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Start Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
🎌 Connecting to MongoDB at mongodb://127.0.0.1:27017/workforce-pulse...
✅ MongoDB connected successfully

🚀 Server running on port 5000 in development mode
📡 API available at http://localhost:5000/api/v1
📊 Admin endpoints available at http://localhost:5000/api/v1/admin

📅 Scheduling data population every 60 minutes
✅ Data population scheduler initialized
```

### Step 4: Monitor Initial Population
The system automatically starts the first population run. Watch the logs:
```
================================================================
🚀 STARTING DATA POPULATION PIPELINE
================================================================

[1/4] Aggregating jobs from all sources...
✅ Fetched 1200 jobs from JobAps RSS
✅ Fetched 850 jobs from USAJOBS
[2/4] Extracting skills from job descriptions...
✅ Skill extraction complete: 2050 jobs updated
[3/4] Calculating skill demand metrics...
✅ Skill demand calculation complete: 287 inserted, 45 updated
[4/4] Calculating sector metrics and pulse...
✅ Sector metrics calculation complete for 8 sectors

================================================================
✅ PIPELINE COMPLETED SUCCESSFULLY
================================================================
⏱️  Total time: 45.32s
```

### Step 5: Verify Data in Database
```bash
# Check MongoDB
mongosh

# Switch to database
use workforce-pulse

# Check collections
db.jobpostings.countDocuments() 
db.skills.countDocuments()
db.sectors.find().pretty()
```

## Frontend Integration

### Endpoints Now Available

#### Jobs
```bash
GET /api/v1/jobs?sectorId=healthcare&limit=50
GET /api/v1/jobs/insights
```

#### Skills  
```bash
GET /api/v1/skills
GET /api/v1/admin/skills/top?limit=20
```

#### Sectors
```bash
GET /api/v1/sectors
GET /api/v1/admin/sectors/summary
GET /api/v1/admin/pulse/summary
```

#### Admin (Manual Triggers)
```bash
POST /api/v1/admin/populate/run-pipeline
GET /api/v1/admin/population/status
GET /api/v1/admin/cache/stats
```

### Update Frontend `.env`
```env
# Point to backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_USE_STUBS=false  # Now using real MongoDB data
```

### Frontend Code Changes
Components can now fetch from database instead of stubs:

**Before (Stubs):**
```typescript
const jobs = mockJobs;  // Static mock data
```

**After (Database):**
```typescript
const { data: jobs } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => fetch('/api/v1/jobs').then(r => r.json())
});
```

## Manual Testing

### Test 1: Trigger Population
```bash
curl -X POST http://localhost:5000/api/v1/admin/populate/run-pipeline | jq
```

### Test 2: Check Status
```bash
curl http://localhost:5000/api/v1/admin/population/status | jq
```

### Test 3: View Skills
```bash
curl http://localhost:5000/api/v1/admin/skills/top?limit=10 | jq
```

### Test 4: View Sectors
```bash
curl http://localhost:5000/api/v1/admin/sectors/summary | jq '.data[] | {id, name, pulseScore, status}'
```

### Test 5: View Cache Stats
```bash
curl http://localhost:5000/api/v1/admin/cache/stats | jq
```

## Common Issues & Solutions

### Issue: "Cannot find module 'axios'"
**Solution:**
```bash
cd backend
npm install axios rss-parser
```

### Issue: "MongoDB connection refused"
**Solution:**
- Verify MongoDB is running: `mongod`
- Check URI in `.env` (Windows: `mongodb://127.0.0.1:27017/workforce-pulse`)
- Verify no IPv6 issues

### Issue: "USAJOBS API returns 401"
**Solution:**
- Generate new API key at https://developer.usajobs.gov
- Ensure User-Agent is email address
- Update `.env` with correct values

### Issue: "No jobs being fetched"
**Solution:**
1. Check API endpoints are accessible:
   ```bash
   curl https://jobapscloud.com/MGM/rss.asp
   ```
2. Verify environment variables
3. Check MongoDB write permissions
4. Review logs for errors

### Issue: "Skills not extracted"
**Solution:**
- Ensure job descriptions are populated
- Check skill taxonomy in `skillEnrichmentService.js`
- Manually trigger: `POST /api/v1/admin/populate/skills`

## Performance Tuning

### For Large Datasets (10,000+ Jobs)

**Increase batch size:**
```javascript
// In dataAggregationService.js
const bulkOps = jobsWithSectors.map(...);
await JobPosting.bulkWrite(bulkOps, { ordered: false });
```

**Disable logging in production:**
```env
LOG_LEVEL=error
```

**Optimize for specific sectors:**
```bash
# Only populate certain sectors
POST /api/v1/admin/populate/sectors
```

## Monitoring & Maintenance

### Daily Checks
- Monitor status endpoint response times
- Check MongoDB disk usage
- Review error logs

### Weekly Tasks
- Check aggregation completeness
- Verify skill taxonomy accuracy
- Review sector metric calculations

### Monthly Tasks
- Analyze data quality
- Update skill taxonomy as needed
- Review and adjust sync interval
- Archive old cache metadata

## Scaling Considerations

### Stage 1: Current (Single Server)
- 10,000 jobs
- Auto-sync every 60 minutes
- Real-time population on demand

### Stage 2: Production Ready
- 50,000+ jobs
- Distributed MongoDB replica set
- Sync every 120 minutes (reduce load)
- Add caching layer (Redis)

### Stage 3: Enterprise
- 1,000,000+ jobs
- Database sharding
- Message queue (RabbitMQ/Kafka)
- Async job processing
- Multi-region deployment

## Success Metrics

After implementation, you should see:
- ✅ Database populated with 1,000+ job postings
- ✅ 200+ unique skills extracted
- ✅ All 8 sectors with pulse scores calculated
- ✅ Admin endpoints responding in <500ms
- ✅ Frontend showing real data from MongoDB
- ✅ Automatic data refresh every hour

## Next Steps

1. **Enable Authentication** (Production)
   - Add middleware to `/api/v1/admin/*`
   - Implement role-based access control

2. **Add Monitoring**
   - Set up APM (New Relic, DataDog)
   - Create alerts for population failures
   - Log to centralized system

3. **Scale Backend**
   - Move to production MongoDB Atlas
   - Add Redis caching
   - Implement request queuing

4. **Expand Data Sources**
   - Add LinkedIn job scraping
   - Integrate career training APIs
   - Connect wage/salary databases

5. **Enhance Skill Taxonomy**
   - Add industry-specific skills
   - Implement skill relationships
   - Create skill learning paths

## Support & Questions

Refer to:
- `data-population-system.md` - Full documentation
- `mongodb-job-tracking.md` - Job tracking details
- Backend logs - Detailed error messages
- MongoDB logs - Connection issues
