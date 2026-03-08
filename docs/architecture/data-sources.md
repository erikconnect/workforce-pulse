# Workforce Pulse — Data Sources & Configuration Guide

## 🎯 How the Data System Works

Workforce Pulse uses a **smart hybrid model**: base structure (stubs) + real data injected from external APIs.

## 📊 Operation Modes

### ✅ Recommended Mode: Hybrid (Stubs + Real Data)

```env
NEXT_PUBLIC_USE_STUBS=true
NEXT_PUBLIC_API_URL=
```

**How it works:**
- Uses base structure from stubs (predefined sectors, roles, skills)
- **Injects REAL data** when APIs are configured:
  - **JobAps RSS** → Montgomery city job postings
  - **USAJOBS API** → Federal jobs in the region
  - **ArcGIS 911 Calls** → Call volume (Public Safety)
  - **ArcGIS Construction Permits** → Construction activity
  - **ArcGIS Population** → Population data
  - **Bright Data Scraping Browser** → Indeed jobs (manual, via button)

**Advantages:**
- ✅ Works without custom backend
- ✅ Real data appears automatically
- ✅ Consistent structure (doesn't break if API fails)
- ✅ Economical (doesn't require backend server)

### 🔴 Full Backend Mode (NOT recommended without backend)

```env
NEXT_PUBLIC_USE_STUBS=false
NEXT_PUBLIC_API_URL=https://your-backend.com
```

**Requirements:**
- Custom backend with endpoints:
  - `GET /pulse/summary`
  - `GET /pulse/alerts`
  - `GET /pulse/recent-postings`
  - `GET /missions/profile`
  - `GET /sectors`
  - `GET /sectors/:id`
  - `GET /skills`
  - `GET /playbooks`
  - And others...

**When to use:** Only if you have a complete backend implemented.

## 🔌 Configured APIs (Hybrid Mode)

### 1. JobAps RSS (Montgomery City Jobs)
```env
JOBAPS_RSS_URL=https://jobapscloud.com/MGM/rss.asp
```
- **Cost:** FREE
- **Update:** Automatic when `/api/jobs` is called
- **Usage:** Dashboard, sectors, insights

### 2. USAJOBS (Federal Jobs)
```env
USAJOBS_API_KEY=ye27XWfZ8TCOapvS4NbprunxM5q7JVKoirO+qEeao6k=
USAJOBS_USER_AGENT=erik@connectsti.com.br
```
- **Cost:** FREE (with API key)
- **Registration:** https://developer.usajobs.gov
- **Update:** Automatic
- **Usage:** Dashboard, sectors, insights

### 3. ArcGIS Open Data (Montgomery)
```env
NEXT_PUBLIC_ARCGIS_911_URL=https://services7.arcgis.com/...
NEXT_PUBLIC_ARCGIS_PERMITS_URL=https://gis.montgomeryal.gov/...
NEXT_PUBLIC_ARCGIS_EDUCATION_URL=https://services7.arcgis.com/...
NEXT_PUBLIC_ARCGIS_POPULATION_URL=https://services7.arcgis.com/...
```
- **Cost:** FREE (public data)
- **Update:** 1-hour cache
- **Usage:** Map, dashboard, city profile

### 4. Bright Data Scraping Browser (Indeed Scraping)
```env
BRIGHT_DATA_BROWSER_WSS=wss://brd-customer-hl_db4a586d-zone-scraping_browser1:...
```
- **Cost:** $100 credit available
- **Usage:** Manual ("Live Scrape" button on dashboard)
- **Time:** ~60-90 seconds per scrape
- **Save credits:** Don't use frequently, use JobAps + USAJOBS first

#### Dataset API (OPTIONAL - not configured)
```env
BRIGHT_DATA_API_KEY=
BRIGHT_DATA_INDEED_DATASET_ID=
BRIGHT_DATA_LINKEDIN_DATASET_ID=
```
- **Required:** Only if you want to use Crawl API instead of Scraping Browser
- **Cost:** Consumes $100 credit
- **Recommendation:** Leave blank, use Scraping Browser

## 📈 Where Data Appears

### Dashboard (`/dashboard`)
- **City Jobs Total:** JobAps + USAJOBS (auto)
- **911 Call Count:** ArcGIS 911 Calls
- **Permit Count:** ArcGIS Construction Permits
- **Sectors:** Stubs enriched with real counts
- **Live Scrape:** Bright Data (manual, via button)

### Sectors (`/sectors`)
- **Base Structure:** Stubs
- **Open Roles Count:** Calculated from JobAps + USAJOBS
- **Pulse Score:** Calculated from ArcGIS (911 calls for Public Safety, permits for Construction)

### Skills (`/skills`)
- **Base List:** Stubs
- **Demand/Growth:** Calculated from job descriptions (JobAps + USAJOBS + Indeed if run)

### Map (`/map`)
- **Layers:** ArcGIS GeoJSON
- **Fire Stations, 911 Calls, Education:** ArcGIS Open Data

## 🔧 Troubleshooting

### "Live Scrape: 0 jobs found"

**Cause:** Auto-aggregation only runs when `/api/jobs` is called for the first time.

**Solution:**
1. Access the dashboard (this triggers auto-aggregate)
2. Wait 5-10 seconds
3. Reload the page
4. Numbers should appear

**Or force manually:**
```bash
# In browser console:
await fetch('/api/jobs/aggregate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ includeIndeed: false }) })
```

### "Sectors without data"

**Check:**
1. `.env.local` has `NEXT_PUBLIC_USE_STUBS=true`
2. `JOBAPS_RSS_URL` is configured
3. `USAJOBS_API_KEY` is configured
4. Server was restarted after `.env.local` changes

### "ArcGIS timeout (500)"

**Normal!** The permits API sometimes takes >15s.  
**Solution:** Ignore, doesn't affect main functionality. Cache will work after the first successful call.

## 💰 Bright Data Credit Management ($100)

### Save credits:
1. ✅ Use JobAps + USAJOBS for daily data (free)
2. ✅ Use "Live Scrape" only for demos or specific testing
3. ✅ Don't configure auto-scrape in production
4. ❌ Avoid `includeIndeed: true` in automatic aggregation

### When to use Bright Data:
- Demos for stakeholders
- Integration testing
- Indeed vs JobAps comparison
- Specific data not available in JobAps

## 📝 Configuration Checklist

- [x] `NEXT_PUBLIC_USE_STUBS=true` (hybrid mode)
- [x] `JOBAPS_RSS_URL` configured
- [x] `USAJOBS_API_KEY` + `USAJOBS_USER_AGENT` configured
- [x] ArcGIS URLs configured
- [x] `BRIGHT_DATA_BROWSER_WSS` configured (for manual scraping)
- [x] `BRIGHT_DATA_API_KEY` blank (not needed)
- [x] Server restarted after changes

## 🚀 Next Steps

1. Access http://localhost:3000
2. Log in
3. Go to `/dashboard`
4. Check if numbers appear (wait for auto-aggregate)
5. Use "Live Scrape" only to test Indeed

---

**Last updated:** March 6, 2026  
**Status:** ✅ Configured in hybrid mode (stubs + real data)
