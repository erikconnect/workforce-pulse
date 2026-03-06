# Workforce Pulse

A civic workforce intelligence dashboard that scrapes job postings and translates them into hiring trends, in-demand skills, and training needs for the Montgomery job market. Built for the World Wide Vibes Hackathon 2 (GenAI / vibe coding).

## Overview

Workforce Pulse helps city workforce and HR leaders, department leads (especially Public Safety), and education partners:

- Detect early staffing pressure signals for critical roles (Police, Firefighters, EMS)
- Identify which skills are newly required or rising fast
- Translate demand into training programs or recruitment actions
- Coordinate and share plans across stakeholders

**60-second loop:** What’s changing? → What’s driving it? → What should we do next? → Who owns it?

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui, Montgomery civic design tokens
- **Data fetching:** TanStack Query v5
- **Charts:** Recharts
- **Job scraping:** Bright Data (Scraping Browser, Playwright)
- **Open data:** ArcGIS FeatureServers, JobAps RSS (City of Montgomery)

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd workforce-pulse
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.local` or any file containing secrets.

   ```bash
   cp .env.example .env.local
   ```

   See [.env.example](.env.example) for required variables.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start dev server                |
| `npm run build`   | Build for production            |
| `npm run start`   | Start production server         |
| `npm run lint`    | Run ESLint                      |
| `npm run test`    | Run unit tests                  |

## Demo Flow

1. **Daily Pulse (Dashboard)** — Critical roles, training needs, fastest-rising skills, sector strip.
2. **Sectors** — Impact Score and hiring trends per sector. Public Safety is prioritized.
3. **Sector Detail** — Hiring chart, critical roles, skills, missions.
4. **Missions** — Checklist-based actions with progress tracking.
5. **Playbooks** — Shareable action plans with likes and saves.

## Data Sources

Jobs are aggregated **automatically** from multiple sources (no manual crawl required):

- **JobAps** — City of Montgomery official job listings (RSS: jobapscloud.com/MGM).
- **USAJOBS** — Federal job listings for Montgomery area (data.usajobs.gov API).
- **Indeed** — Via Bright Data Scraping Browser when `BRIGHT_DATA_BROWSER_WSS` is configured.
- **LinkedIn, Glassdoor** — Use the Crawl Runner at `/crawl` with Bright Data Dataset IDs for on-demand enrichment.

The job store is populated automatically on first load and refreshed daily via Vercel Cron. When deployed, the cron runs once per day (midnight UTC); jobs also load on first request if the store is empty.

## Automatic Job Aggregation

Jobs are fetched automatically from JobAps and USAJOBS. For USAJOBS, register at [developer.usajobs.gov](https://developer.usajobs.gov/) and add `USAJOBS_API_KEY` and `USAJOBS_USER_AGENT` (your email) to `.env.local`.

## Bright Data Setup

Workforce Pulse uses two Bright Data integrations:

1. **Scraping Browser** (Indeed job scraping) — Set `BRIGHT_DATA_BROWSER_WSS` in `.env.local` with your WebSocket URL from the Bright Data dashboard (Scraping Browser zone).

2. **Crawl API / Dataset API** — Set `BRIGHT_DATA_API_KEY` in `.env.local` for the Crawl Runner and Settings. Configure Dataset ID in **Settings → Bright Data**. The Crawl Runner at `/crawl` lets you trigger crawls with custom URLs.

API keys are server-side only; never expose them to the client.

## Troubleshooting

- **"BRIGHT_DATA_API_KEY is not configured"** — Add the key to `.env.local` and restart the dev server.
- **"BRIGHT_DATA_BROWSER_WSS"** — Required for POST `/api/jobs/scrape` (Indeed scraping). Get the WebSocket URL from Bright Data Scraping Browser zone.
- **Snapshot not ready** — Crawls can take several minutes. The Crawl Runner polls automatically.
- **ArcGIS / JobAps errors** — Check that `NEXT_PUBLIC_ARCGIS_*` and `JOBAPS_RSS_URL` are set in `.env.local`.

## Documentation

- [docs/full-idea-project.txt](docs/full-idea-project.txt) — Full product specification.
- [docs/claims-validation.md](docs/claims-validation.md) — Claims validation and architecture evaluation.
- [docs/shimmering-forging-pudding.md](docs/shimmering-forging-pudding.md) — Design system and API integration notes.
- [docs/sparkling-giggling-planet.md](docs/sparkling-giggling-planet.md) — Implementation plan.

## License

Private — hackathon project.
