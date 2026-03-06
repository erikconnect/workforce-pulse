# Workforce Pulse — API Reference

> **Status:** Draft (hackathon build, March 2026)  
> **Base URL (local):** `http://localhost:3000`  
> **Base URL (production):** `https://<your-vercel-deployment>.vercel.app`

All endpoints are Next.js App Router Route Handlers. All responses are JSON unless noted. Server-side API keys are never exposed to the client.

---

## Authentication & Keys

The following environment variables must be set in `.env.local` before the API routes will work:

| Variable | Required | Used by |
|---|---|---|
| `USAJOBS_API_KEY` | Yes (for USAJOBS) | `/api/jobs/aggregate` |
| `USAJOBS_USER_AGENT` | Yes (for USAJOBS) | `/api/jobs/aggregate` |
| `BRIGHT_DATA_BROWSER_WSS` | Optional | `/api/jobs/scrape` |
| `BRIGHT_DATA_API_KEY` | Optional | `/api/crawl/*` |
| `JOBAPS_RSS_URL` | Optional (has default) | `/api/jobs/aggregate` |
| `NEXT_PUBLIC_ARCGIS_*` | Optional | ArcGIS feature layers |

---

## Job Aggregation

### `GET /api/jobs/aggregate`

Fetches and merges job listings from all configured sources (JobAps RSS, USAJOBS, and optionally Indeed via Bright Data). Results are cached in Vercel KV and refreshed every 6 hours. Also triggered by Vercel Cron.

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
      "location": "Montgomery, AL",
      "postedAt": "2026-03-01T00:00:00Z",
      "skills": ["CPR", "Hazmat", "Emergency Response"],
      "url": "https://..."
    }
  ],
  "meta": {
    "total": 142,
    "lastRefreshed": "2026-03-06T08:00:00Z",
    "sources": ["jobaps", "usajobs"]
  }
}
```

**Error Responses**

| Status | Meaning |
|---|---|
| `500` | One or more sources failed; partial results may be returned |
| `503` | All sources unavailable |

---

### `POST /api/jobs/scrape`

Triggers a live Indeed scrape using the Bright Data Scraping Browser. Requires `BRIGHT_DATA_BROWSER_WSS` to be set.

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

Returns computed hiring trend signals derived from the aggregated job store — fastest-rising skills, sector demand changes, and critical role pressure indicators.

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

## AI Recruiter Assistant

### `POST /api/ai/chat`

Conversational endpoint powered by Gemini API. Accepts a chat history and returns the assistant's next response, grounded in current job data.

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
| `503` | Gemini API key not configured |

---

## Missions & Playbooks

### `GET /api/missions`

Returns active workforce missions with their checklist items and completion status.

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

---

## Cron

### `GET /api/cron/refresh-jobs`

Called automatically by Vercel Cron every 6 hours. Triggers a full job aggregation cycle. Protected — only callable from the Vercel environment (verified via `CRON_SECRET` header).

---

## Notes for Frontend Integration

- All `/api/*` routes are server-side only. Never call them with client-side `fetch` unless the route is explicitly intended to be public.
- Job objects share a consistent shape across all endpoints — map to the `Job` TypeScript type in `src/types/`.
- The `/api/jobs/aggregate` endpoint is safe to call on page load; it returns cached data instantly unless `refresh=true`.
- Bright Data endpoints will return `503` if the account is suspended or KYC is incomplete — handle gracefully in the UI with a fallback to the cached job store.
