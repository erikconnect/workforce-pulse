# Workforce Pulse — Setup Guide

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values. For stub-only development (no Bright Data, no ArcGIS), you can leave most variables as-is with `NEXT_PUBLIC_USE_STUBS=true`.

3. **Never commit** `.env.local` or any file containing API keys or secrets.

## Key Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_USE_STUBS` | `true` = use stub data; `false` = call real APIs |
| `BRIGHT_DATA_BROWSER_WSS` | Required for job scraping (Indeed via Bright Data Scraping Browser) |
| `NEXT_PUBLIC_ARCGIS_*` | ArcGIS open data endpoints for workforce-data API |
| `JOBAPS_RSS_URL` | City of Montgomery official job listings (RSS) |

## Communication Norms

- **Language:** English only (team members are in different time zones).
- **Updates:** Use a structured format:
  - Update:
  - Blocker:
  - Next:
- **Threads:** Use threads for deep technical discussions.
