# Workforce Pulse — API Reference

> **Status:** Draft (hackathon build, March 2026)
> **Last updated:** 2026-03-07
> **Base URL (local):** `http://localhost:3000`
> **Base URL (production):** `https://workforce-pulse.vercel.app`

All responses are JSON unless noted. Server-side API keys are never exposed to the client.

---

## ⚠️ Architecture Note — Two API Layers

The project currently has **two separate backend layers** that the team needs to be aware of:

| Layer | Location | Framework | Used by |
|---|---|---|---|
| **Frontend API routes** | `src/app/api/` | Next.js App Router | Erik's frontend (this document) |
| **Standalone backend** | `backend/` | Node.js (separate server) | Muktar / Ernest |

The endpoints in this document describe the **Next.js API routes** consumed by the frontend. If the `backend/` server exposes its own routes on a different port or base URL, those should be documented separately in `backend/README.md`. The two layers need to agree on a shared **job object shape** — see the `JobPosting` type in `src/data/mock-jobs.ts` as the reference contract.

---

## Authentication & Keys

The following environment variables must be set in `.env.local` before the API routes will work:

| Variable | Required | Used by |
|---|---|---|
| `USAJOBS_API_KEY` | Yes (for USAJOBS) | `/api/jobs/aggregate` |
| `USAJOBS_USER_AGENT` | Yes (for USAJOBS, use your email) | `/api/jobs/aggregate` |
| `GEMINI_API_KEY` | Yes (for AI feature) | `/api/ai/chat`, `/api/ai/learning-path` |
| `BRIGHT_DATA_BROWSER_WSS` | Optional | `/api/jobs/scrape` |
| `BRIGHT_DATA_API_KEY` | Optional | `/api/crawl/*` |
| `JOBAPS_RSS_URL` | Optional (has default) | `/api/jobs/aggregate` |
| `NEXT_PUBLIC_ARCGIS_*` | Optional | ArcGIS feature layers |

---

## Job Aggregation

### `GET /api/jobs/aggregate`

Fetches and merges job listings from all configured sources (JobAps RSS, USAJOBS, and optionally Indeed via Bright Data). Results are cached and refreshed **daily at midnight UTC**. Also triggered by Vercel Cron.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `sector` | string | all | Filter by sector slug, e.g. `public-safety` |
| `refresh` | boolean | false | Force a fresh fetch, bypassing cache |

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
    "lastRefreshed": "2026-03-07T00:00:00Z",
    "sources": ["jobaps", "usajobs"]
  }
}
```

**Error Responses**

| Status | Meaning |
|---|---|
| `500` | One or more sources failed; partial results may be returned |
| `503` | All sources unavailable |

> **Frontend tip:** Safe to call on page load — returns cached data instantly unless `refresh=true`. Falls back to `src/data/mock-jobs.ts` if all sources fail.

---

### `POST /api/jobs/scrape`

Triggers a live Indeed scrape via Bright Data Scraping Browser. Requires `BRIGHT_DATA_BROWSER_WSS`. If the Bright Data account is suspended, returns `503` — handle gracefully and fall back to JobAps + USAJOBS.

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

**Error Responses**

| Status | Meaning |
|---|---|
| `400` | Missing required body fields |
| `503` | `BRIGHT_DATA_BROWSER_WSS` not configured or account suspended |

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

---

### `GET /api/crawl/status/:snapshotId`

Polls the status of a triggered crawl. Crawls typically take several minutes.

**Response `200 OK`**

```json
{
  "snapshotId": "snap_abc123",
  "status": "pending | ready | failed",
  "resultUrl": "https://... (present when status=ready)"
}
```

---

## Trends & Analytics

### `GET /api/trends`

Returns computed hiring trend signals — fastest-rising skills, sector demand changes, and critical role pressure indicators. Falls back to `src/data/mock-pulse.ts` if the analytics layer is not yet built.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `sector` | string | all | Sector slug to scope results |
| `window` | string | `30d` | Time window: `7d`, `30d`, `90d` |

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

Conversational endpoint powered by **Gemini API**. Accepts a chat history and returns the assistant's next response, grounded in current job data.

**Request Body**

```json
{
  "messages": [
    { "role": "user", "content": "What skills do I need to become a firefighter in Montgomery?" }
  ],
  "context": {
    "sector": "public-safety"
  }
}
```

**Response `200 OK`**

```json
{
  "reply": "To qualify for a Firefighter I role in Montgomery, the most in-demand skills right now are...",
  "suggestedJobs": [ /* optional, same shape as job object */ ]
}
```

**Error Responses**

| Status | Meaning |
|---|---|
| `400` | Empty or malformed messages array |
| `503` | `GEMINI_API_KEY` not configured |

---

### `POST /api/ai/learning-path`

Generates a personalised career milestone roadmap for a given target role. Powered by Gemini API. Corresponds to the AI Learning Path screen in the product.

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
    { "step": 1, "label": "Current Skills",     "status": "verified"     },
    { "step": 2, "label": "Skill Gap Analysis",  "status": "in-progress"  },
    { "step": 3, "label": "AI Specialization",   "status": "recommended"  },
    { "step": 4, "label": "Target Role Reached", "status": "goal"         }
  ],
  "topRecommendations": [
    {
      "title": "Advanced SQL for Data Analytics",
      "provider": "Coursera",
      "durationHours": 12,
      "free": true
    }
  ]
}
```

---

## Missions & Playbooks

### `GET /api/missions`

Returns active workforce missions with checklist items and completion status.

**Response `200 OK`**

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

Marks a mission task as complete and updates the progress value.

**Request Body**

```json
{ "taskId": "t2" }
```

---

### `GET /api/playbooks`

Returns shareable action plans.

**Response `200 OK`**

```json
{
  "playbooks": [
    {
      "id": "pb_001",
      "title": "Public Safety Hiring Sprint",
      "likes": 4,
      "saved": true,
      "steps": ["string"]
    }
  ]
}
```

### `POST /api/playbooks`

Creates a new playbook. Body should include `title`, `sector`, `insights[]`, and `actions[]`.

### `POST /api/playbooks/:id/react`

Adds a reaction (like / save) to a playbook.

---

## Cron

### `GET /api/cron/refresh-jobs`

Called automatically by Vercel Cron **once daily at midnight UTC**. Triggers a full job aggregation cycle. Protected — only callable from the Vercel environment (verified via `CRON_SECRET` header).

---

## Mock Data (Development)

When no live data sources are configured, the frontend falls back to static fixtures in `src/data/`:

| File | Powers |
|---|---|
| `src/data/mock-jobs.ts` | All job listing endpoints |
| `src/data/mock-pulse.ts` | Trends, sectors, missions, playbooks, daily pulse tile |

Both files export typed TypeScript objects matching the shapes above. Use these to build and test UI components before the backend is connected.

---

## Notes for Frontend Integration

- Job objects share a consistent shape across all endpoints — see `JobPosting` in `src/data/mock-jobs.ts`.
- The `/api/jobs/aggregate` endpoint is safe to call on page load; returns cached data instantly unless `refresh=true`.
- Bright Data endpoints return `503` if the account is suspended — fall back to mock data gracefully.
- All AI endpoints require `GEMINI_API_KEY` in `.env.local`. Get a free key at [Google AI Studio](https://aistudio.google.com).
- Never call server-side `/api/*` routes directly from client components unless the route is explicitly public.
