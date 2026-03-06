# Vercel Setup — workforce-pulse

Guide to connect the GitHub repository and configure environment variables in the Vercel project.

## 1. Connect GitHub repository

1. Access: [https://vercel.com/erikconnects-projects/workforce-pulse](https://vercel.com/erikconnects-projects/workforce-pulse)
2. Click **Settings** in the project menu.
3. In the **Git** section, click **Connect Git Repository**.
4. Choose **GitHub** and authorize if necessary.
5. Select the repository: `erikconnect/workforce-pulse`
6. Choose the branch: `main`
7. Save.

After connecting, each push to `main` will trigger an automatic deployment.

---

## 2. Environment Variables

In **Settings → Environment Variables**, add the variables below. Check **Production**, **Preview**, and **Development** as needed.

### Required for basic functionality

| Name | Value | Description |
|------|-------|-------------|
| `NEXT_PUBLIC_USE_STUBS` | `false` | Use real data in production |

### ArcGIS (Montgomery data)

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_ARCGIS_911_URL` | `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/911_Calls_Data/FeatureServer/0` |
| `NEXT_PUBLIC_ARCGIS_PERMITS_URL` | `https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Construction_Permits/FeatureServer/0` |
| `NEXT_PUBLIC_ARCGIS_POPULATION_URL` | `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Daily_Population_Trends/FeatureServer/0` |

### JobAps (Montgomery jobs)

| Name | Value |
|------|-------|
| `JOBAPS_RSS_URL` | `https://jobapscloud.com/MGM/rss.asp` |

### USAJOBS (federal jobs)

| Name | Value |
|------|-------|
| `USAJOBS_API_KEY` | *your API key from developer.usajobs.gov* |
| `USAJOBS_USER_AGENT` | *your registered email* |

### Bright Data (optional — Crawl Runner / Indeed)

| Name | Value |
|------|-------|
| `BRIGHT_DATA_API_KEY` | *your API key* |
| `BRIGHT_DATA_BROWSER_WSS` | *Scraping Browser WebSocket URL* |

---

## 3. Deploy

After configuring:

1. **Redeploy** in **Deployments** → ⋮ on the latest deployment → **Redeploy**
2. Or make a new push to `main` on GitHub to trigger automatic deployment.

---

## 4. Cron (automatic aggregation)

The `vercel.json` already defines the cron job for `/api/jobs/aggregate` every 6 hours. It runs automatically in production, as long as the `JOBAPS_RSS_URL` and `USAJOBS_*` variables are configured.
