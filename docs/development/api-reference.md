# Workforce Pulse — API Reference

> **Status:** Draft (hackathon build, March 2026)
> **Last updated:** 2026-03-08
> **Base URL (local):** `http://localhost:3000`
> **Base URL (production):** `https://workforce-pulse.vercel.app`

All responses are JSON unless noted. Server-side API keys are never exposed to the client.

---

## Architecture Overview

The project has two layers working together:

| Layer | Location | Framework | Role |
|---|---|---|---|
| **Frontend + API routes** | `src/app/api/` | Next.js App Router | UI, public endpoints, AI routes |
| **Backend server** | `backend/` | Node.js + MongoDB | Data ingestion, job storage, aggregation |

The Next.js frontend consumes its own `/api/*` routes. The `backend/` Node.js server handles data ingestion from JobAps, USAJOBS, and Bright Data, storing results in MongoDB. The frontend API routes read from MongoDB (via the backend) or fall back to `src/data/mock-*.ts` fixtures during development.

The shared data contract between layers is the `JobPosting` type defined in `src/data/mock-jobs.ts`. Both layers must produce and consume this shape.

> **Backend integration status (as of 2026-03-08):** MongoDB connection is actively being integrated. If the backend is unavailable, all endpoints fall back to mock data automatically.

---

## Authentication & Keys

| Variable | Required | Used by |
|---|---|---|
| `USAJOBS_API_KEY` | Yes (for USAJOBS) | `/api/jobs/aggregate` |
| `USAJOBS_USER_AGENT` | Yes (for USAJOBS, use your email) | `/api/jobs/aggregate` |
| `GEMINI_API_KEY` | Yes (for AI features) | `/api/ai/chat`, `/api/ai/learning-path` |
| `MONGODB_URI` | Yes (for backend) | `backend/` Node.js server |
| `BRIGHT_DATA_BROWSER_WSS` | Optional | `/api/jobs/scrape` |
| `BRIGHT_DATA_API_KEY` | Optional | `/api/crawl/*` |
| `JOBAPS_RSS_URL` | Optional (has default) | `/api/jobs/aggregate` |
| `NEXT_PUBLIC_ARCGIS_*` | Optional | ArcGIS feature layers |

---

## Public Endpoints (no login required)

### `GET /api/jobs/public`

Returns a list of job postings accessible without authentication. Intended for the public-facing job board — visible to any Montgomery resident without signing in. Supports keyword search and basic filtering.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | Keyword search (title, org, skills) |
| `sector` | string | all | Filter by sector slug, e.g. `public-safety` |
| `source` | string | all | Filter by source: `jobaps`, `usajobs`, `indeed` |
| `limit` | number | 20 | Max results to return |
| `offset` | number | 0 | Pagination offset |

**Response `200 OK`**

```json
{
  "jobs": [
    {
      "id": "string",
      "title": "Firefighter I",
      "source": "jobaps | usajobs | indeed",
      "sector": "public-safety",
      "org": "City of Montgomery Fire Department",
      "location": "Montgomery, AL",
      "postedAt": "2026-03-01T00:00:00Z",
      "skills": ["CPR", "Hazmat", "Emergency Response"],
      "critical": true,
      "url": "https://..."
    }
  ],
  "meta": {
    "total": 142,
    "query": "firefighter",
    "sources": ["jobaps", "usajobs"]
  }
}
```

> **Note:** This endpoint returns a safe subset of job data — no internal analytics, Impact Scores, or mission data. Those remain behind authentication.

---

## Authenticated Endpoints (login required)

All endpoints below require a valid session. Unauthenticated requests return `401`.

---

### `GET /api/jobs/aggregate`

Fetches and merges job listings from all configured sources. Results refreshed **daily at midnight UTC** via Vercel Cron. Returns full job objects including `critical` flag and sector metadata.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `sector` | string | all | Filter by sector slug |
| `refresh` | boolean | false | Force a fresh fetch, bypassing cache |

**Response `200 OK`** — same job shape as `/api/jobs/public` plus:

```json
{
  "jobs": [ /* full JobPosting shape */ ],
  "meta": {
    "total": 142,
    "lastRefreshed": "2026-03-08T00:00:00Z",
    "sources": ["jobaps", "usajobs"],
    "backendConnected": true
  }
}
```

**Error Responses**

| Status | Meaning |
|---|---|
| `401` | Not authenticated |
| `500` | One or more sources failed; partial results returned |
| `503` | All sources unavailable — falls back to mock data |

---

### `POST /api/jobs/scrape`

Triggers a live Indeed scrape via Bright Data Scraping Browser. Returns `503` if account is suspended — fall back gracefully to JobAps + USAJOBS.

**Request Body**

```json
{
  "keyword": "firefighter",
  "location": "Montgomery, AL",
  "limit": 20
}
```

**Response `200 OK`**

```json
{
  "scraped": 18,
  "jobs": [ /* same shape as aggregate response */ ]
}
```

---

## Crawl Runner (Bright Data Datasets)

### `POST /api/crawl/trigger`

Initiates a Bright Data dataset crawl for LinkedIn or Glassdoor enrichment.

**Request Body**

```json
{
  "datasetId": "string",
  "urls": ["https://www.linkedin.com/jobs/..."]
}
```

**Response `202 Accepted`**

```json
{
  "snapshotId": "snap_abc123",
  "status": "pending",
  "pollUrl": "/api/crawl/status/snap_abc123"
}
```

### `GET /api/crawl/status/:snapshotId`

**Response `200 OK`**

```json
{
  "snapshotId": "snap_abc123",
  "status": "pending | ready | failed",
  "resultUrl": "https://..."
}
```

---

## Trends & Analytics

### `GET /api/trends`

Returns hiring trend signals — rising skills, sector pressure, critical roles. Falls back to `src/data/mock-pulse.ts` if analytics layer not yet built.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `sector` | string | all | Sector slug |
| `window` | string | `30d` | `7d`, `30d`, `90d` |

**Response `200 OK`**

```json
{
  "risingSkills": [
    { "skill": "Crisis Intervention", "growthPct": 42, "sector": "public-safety" }
  ],
  "criticalRoles": [
    { "role": "Police Officer", "openings": 31, "urgency": "high" }
  ],
  "sectorPressure": [
    { "sector": "public-safety", "impactScore": 87 }
  ]
}
```

---

## AI Assistant

### `POST /api/ai/chat`

Conversational endpoint powered by **Gemini API**, grounded in current Montgomery job data.

**Request Body**

```json
{
  "messages": [
    { "role": "user", "content": "What skills do I need to become a firefighter in Montgomery?" }
  ],
  "context": { "sector": "public-safety" }
}
```

**Response `200 OK`**

```json
{
  "reply": "To qualify for a Firefighter I role in Montgomery...",
  "suggestedJobs": [ /* optional */ ]
}
```

### `POST /api/ai/learning-path`

Generates a personalised career roadmap for a given target role.

**Request Body**

```json
{
  "currentSkills": ["Logistics Coordinator", "Basic SQL"],
  "targetRole": "Senior Logistics Analyst",
  "sector": "technology"
}
```

**Response `200 OK`**

```json
{
  "estimatedMonths": 4.5,
  "progressPct": 35,
  "milestones": [
    { "step": 1, "label": "Current Skills",     "status": "verified"    },
    { "step": 2, "label": "Skill Gap Analysis",  "status": "in-progress" },
    { "step": 3, "label": "AI Specialization",   "status": "recommended" },
    { "step": 4, "label": "Target Role Reached", "status": "goal"        }
  ],
  "topRecommendations": [
    { "title": "Advanced SQL for Data Analytics", "provider": "Coursera", "durationHours": 12, "free": true }
  ]
}
```

**Error Responses (both AI endpoints)**

| Status | Meaning |
|---|---|
| `400` | Empty or malformed messages array |
| `503` | `GEMINI_API_KEY` not configured |

---

## Missions & Playbooks

### `GET /api/missions`

```json
{
  "missions": [
    {
      "id": "mission_001",
      "title": "Boost Firefighter Recruitment Q2 2026",
      "sector": "public-safety",
      "tasks": [
        { "id": "t1", "label": "Post on JobAps", "done": true },
        { "id": "t2", "label": "Partner with AIDT training", "done": false }
      ],
      "progress": 0.5
    }
  ]
}
```

### `POST /api/missions/:id/complete-step`

```json
{ "taskId": "t2" }
```

### `GET /api/playbooks`

```json
{
  "playbooks": [
    { "id": "pb_001", "title": "Public Safety Hiring Sprint", "likes": 4, "saved": true, "steps": ["string"] }
  ]
}
```

### `POST /api/playbooks` — create a new playbook (title, sector, insights[], actions[])
### `POST /api/playbooks/:id/react` — add like or save reaction

---

## Cron

### `GET /api/cron/refresh-jobs`

Called by Vercel Cron **once daily at midnight UTC**. Protected via `CRON_SECRET` header.

---

## Mock Data Fallback (Development)

| File | Powers |
|---|---|
| `src/data/mock-jobs.ts` | All job listing endpoints |
| `src/data/mock-pulse.ts` | Trends, sectors, missions, playbooks, daily pulse |

---

## Integration Notes

- Public job board (`/api/jobs/public`) requires no auth — safe to call from any page including the landing page.
- All analytics, missions, and playbooks endpoints require authentication.
- MongoDB URI must be set in both `.env.local` (frontend) and `backend/.env` (Node.js server).
- All AI endpoints require `GEMINI_API_KEY`. Free key at [Google AI Studio](https://aistudio.google.com).
- Bright Data returns `503` if account is suspended — always fall back to JobAps + USAJOBS gracefully.
