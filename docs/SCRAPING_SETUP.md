# ⚠️ MongoDB Job Scraping - Setup Required

## The Problem

The scraping integration requires **both servers running**:
- **Frontend** (Next.js): http://localhost:3000
- **Backend API** (Express + MongoDB): http://localhost:5000/api/v1

Your error `[LinkedIn] ❌ Error: fetch failed` means the frontend cannot reach the backend.

## Quick Start - Run Both Servers

### Option 1: Two Terminal Windows (Recommended for Windows)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
# Wait for: MongoDB connected ✅
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
# Visit http://localhost:3000
```

### Option 2: Using provided batch file

```powershell
# In the root directory:
.\run-dev.bat
```

This opens two windows - one for each server.

### Option 3: Using VS Code terminals

1. Press `Ctrl+Shift+```  - Opens VS Code terminal
2. Open second terminal: Click `+` in terminal panel
3. **Terminal 1**: `cd backend && npm run dev`
4. **Terminal 2**: `npm run dev`

---

## Prerequisites

### ✅ MongoDB Running

Must have MongoDB running locally on port 27017:

```powershell
# Start MongoDB (if installed locally):
mongod

# Or if using MongoDB Atlas, update .env.local:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workforce-pulse
```

### ✅ Backend Dependencies Installed

```powershell
cd backend
npm install
cd ..
```

### ✅ Frontend Dependencies Installed

```powershell
npm install
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_STUBS=false
```

### Backend (.env or .env.local in /backend)
```
MONGODB_URI=mongodb://127.0.0.1:27017/workforce-pulse
PORT=5000
NODE_ENV=development
```

---

## How Scraping Works Now

1. **Frontend** calls `POST /api/jobs/scrape`
2. **Frontend** calls `GET /api/jobs/stats`
3. These route to **Backend API** at `http://localhost:5000/api/v1`
4. **Backend** reads from MongoDB
5. **Backend** returns stats with new vs recurring jobs

---

## Troubleshooting

### "Could not connect to MongoDB"
- Start MongoDB: `mongod`
- Check connection string in backend `.env`

### "Port 5000 already in use"
- Kill existing process: `lsof -ti:5000 | xargs kill -9`
- Or change `PORT` in backend `.env`

### "Backend still not responding"
- Confirm backend is running: `http://localhost:5000/api/v1/jobs/stats`
- Check console for errors
- Verify `MONGODB_URI` is correct

### "Scraping takes a long time"
- Indeed/LinkedIn scrapers need Bright Data connection
- Check `BRIGHT_DATA_BROWSER_WSS` is set in `.env.local`
- First scrape always takes longer (initializes)

---

## What's Being Scraped

**Default sources:**
- ✅ JobAps (City of Montgomery) - RSS feed
- ✅ USAJOBS (Federal jobs) - API
- ✅ Indeed - Bright Data Scraping Browser (if configured)
- ✅ LinkedIn - Bright Data Scraping Browser (if configured)
- ✅ Glassdoor - Bright Data Scraping Browser (if configured)

**Stored in MongoDB with tracking:**
- `scrapedCount` - How many times found
- `firstScrapedAt` - When discovered
- `lastScrapedAt` - Most recent discovery
- `isActive` - In recent scrapes

---

## Testing the Setup

Once both servers are running:

```bash
# Test backend directly
curl http://localhost:5000/api/v1/jobs/stats

# Test via frontend
curl http://localhost:3000/api/jobs/stats

# Trigger manual scrape
curl -X POST http://localhost:3000/api/jobs/scrape
```

---

## Run This Now

**Window 1:**
```
cd backend && npm install && npm run dev
```

**Window 2 (in new terminal):**
```
npm install && npm run dev
```

Then visit: http://localhost:3000

✅ Once both are running, go to dashboard to see ScrapingStatsCard!
