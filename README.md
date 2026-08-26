# Workforce Pulse 🌊

A civic workforce intelligence dashboard that scrapes job postings and translates them into hiring trends, in-demand skills, and training needs for the Montgomery job market. Built for the World Wide Vibes Hackathon 2 (GenAI / vibe coding).

> **✨ Latest Updates (March 2026)**
> - 📚 Comprehensive documentation reorganization with clear navigation
> - 🧹 Clean, production-ready codebase
> - 🤖 6 specialized AI agents for accelerated development
> - 📊 Enhanced job tracking with MongoDB integration
> - 🎨 Montgomery-specific civic branding and design system

## Overview

Workforce Pulse helps city workforce and HR leaders, department leads (especially Public Safety), and education partners:

- 🚨 Detect early staffing pressure signals for critical roles (Police, Firefighters, EMS)
- 📈 Identify which skills are newly required or rising fast
- 🎯 Translate demand into training programs or recruitment actions
- 🤝 Coordinate and share plans across stakeholders
- 🏛️ Present Montgomery-specific civic branding with custom iconography and city seal placement

**60-second loop:** What's changing? → What's driving it? → What should we do next? → Who owns it?

## ✨ Features

- **Dashboard** — Critical roles overview, training needs, fastest-rising skills, sector health
- **Job Listings** — Aggregated multi-source job board with real-time scraping
- **Sectors** — Impact scoring and hiring trends per sector (Public Safety prioritized)
- **Skills** — In-demand skills tracking and trend analysis
- **Missions** — Checklist-based action tracking with progress monitoring
- **Playbooks** — Shareable action plans with community engagement
- **Map View** — Geospatial visualization of workforce data and city landmarks
- **Settings** — Bright Data configuration, API management, preferences
- **Crawl Runner** — On-demand job scraping from LinkedIn, Indeed, Glassdoor

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 16.1.6 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS 3.4.17 with Montgomery civic design tokens
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Data Fetching:** TanStack Query v5.90.21
- **Charts:** Recharts 3.8.0
- **Maps:** React Leaflet 5.0.0
- **Authentication:** NextAuth 4.24.13

### Backend

- **API Server:** Express 4.18.2
- **Database:** MongoDB (Mongoose 8.1.1)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Joi 17.12.0

### Testing & Tools

- **Unit Tests:** Vitest 4.0.18
- **Browser Automation:** Playwright-core 1.58.2
- **Job Scraping:** Bright Data (Scraping Browser + Crawl API)
- **Open Data:** ArcGIS FeatureServers, JobAps RSS

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (for backend API)

## 🚀 Quick Start

### Frontend Setup

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

   `.env.example` defaults to `NEXT_PUBLIC_USE_STUBS=true`, so you can run the frontend without the backend for UI work.

   For full-stack development, set:

   ```bash
   NEXT_PUBLIC_USE_STUBS=false
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

   See [.env.example](.env.example) for the complete variable list.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## 🔐 Authentication Setup (Register + Sign In)

Workforce Pulse supports:

- Demo credentials (local development)
- Google OAuth
- LinkedIn OAuth
- GitHub OAuth
- Microsoft (Azure AD) OAuth
- Auth0 OAuth (optional)

The `/login` page now includes a **Register** mode. Any configured OAuth provider will appear automatically.

### 1. NextAuth Base Variables

Add these to `.env.local`:

```bash
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret with:

```bash
npx auth secret
```

### 2. OAuth Provider Variables

Configure one or more providers:

```bash
# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# GitHub
GITHUB_ID=
GITHUB_SECRET=
# (alternative naming also supported)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Microsoft / Azure AD
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Auth0 (optional)
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_ISSUER=
```

### 3. Redirect/Callback URL

For each provider app, set callback URL to:

```text
http://localhost:3000/api/auth/callback/<provider>
```

Examples:

- Google: `http://localhost:3000/api/auth/callback/google`
- LinkedIn: `http://localhost:3000/api/auth/callback/linkedin`
- GitHub: `http://localhost:3000/api/auth/callback/github`
- Azure AD: `http://localhost:3000/api/auth/callback/azure-ad`
- Auth0: `http://localhost:3000/api/auth/callback/auth0`

For production, replace `http://localhost:3000` with your deployed domain.

### 4. Demo Accounts (Credentials Provider)

- Admin: `admin@montgomery.gov` / `demo123`
- Citizen: `citizen@montgomery.gov` / `demo123`

Use these when OAuth keys are not configured yet.

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   npm install
   ```

2. **Configure backend environment**

   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `PORT` - Server port (default: 5000)
   - `API_VERSION` - API prefix version (default: `v1`)
   - `CORS_ORIGIN` - Frontend origin (default: `http://localhost:3000`)
   - `JWT_SECRET` - Secret for JWT tokens
   - `BRIGHT_DATA_API_KEY` - For job scraping
   - `BRIGHT_DATA_BROWSER_WSS` - Optional Bright Data Scraping Browser endpoint
   - `USAJOBS_API_KEY` - For federal job listings

3. **Run backend server**

   ```bash
   npm run dev
   ```

   Backend runs on [http://localhost:5000](http://localhost:5000).

## 📜 Scripts

### Frontend Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start dev server                |
| `npm run build`   | Build for production            |
| `npm run start`   | Start production server         |
| `npm run lint`    | Run ESLint                      |
| `npm run test`    | Run Vitest unit tests           |

### Backend Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start dev server (nodemon)      |
| `npm run start`   | Start production server         |
| `npm run lint`    | Run ESLint                      |
| `npm run test`    | Run Jest tests                  |

## 🎯 Demo Flow

1. **Daily Pulse (Dashboard)** — Critical roles, training needs, fastest-rising skills, sector strip.
2. **Jobs** — Browse aggregated job listings from multiple sources with filters and search.
3. **Sectors** — Impact Score and hiring trends per sector. Public Safety is prioritized.
4. **Sector Detail** — Hiring chart, critical roles, skills, missions.
5. **Skills** — Track in-demand skills and their growth trends.
6. **Missions** — Checklist-based actions with progress tracking.
7. **Playbooks** — Shareable action plans with likes and saves.
8. **Map** — Geospatial view of workforce data overlaid on Montgomery city landmarks.
9. **Crawl Runner** — Trigger on-demand job scraping from LinkedIn, Indeed, Glassdoor.

## 🧪 Development Modes

### Frontend-only / stub mode

- Keep `NEXT_PUBLIC_USE_STUBS=true` in `.env.local`
- Run `npm run dev` from the repo root
- Use this mode for UI work, branding, and page development without MongoDB or the Express API

### Full-stack mode

- Set `NEXT_PUBLIC_USE_STUBS=false`
- Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`
- Start MongoDB
- Run `npm run dev` in `backend/`
- Run `npm run dev` in the repo root

## 🔌 Data Sources

Jobs are aggregated **automatically** from multiple sources (no manual crawl required):

- **JobAps** — City of Montgomery official job listings (RSS: jobapscloud.com/MGM).
- **USAJOBS** — Federal job listings for Montgomery area ([data.usajobs.gov](https://data.usajobs.gov) API).
- **Indeed** — Via Bright Data Scraping Browser when `BRIGHT_DATA_BROWSER_WSS` is configured.
- **LinkedIn, Glassdoor** — Use the Crawl Runner at `/crawl` with Bright Data Dataset IDs for on-demand enrichment.

The job store is populated automatically on first load and refreshed daily via Vercel Cron. When deployed, the cron runs once per day (midnight UTC); jobs also load on first request if the store is empty.

## 🌐 Automatic Job Aggregation

Jobs are fetched automatically from JobAps and USAJOBS. For USAJOBS, register at [developer.usajobs.gov](https://developer.usajobs.gov/) and add `USAJOBS_API_KEY` and `USAJOBS_USER_AGENT` (your email) to `.env.local`.

## ⚡ Bright Data Setup

Workforce Pulse uses two Bright Data integrations:

1. **Scraping Browser** (Indeed job scraping) — Set `BRIGHT_DATA_BROWSER_WSS` in `.env.local` with your WebSocket URL from the Bright Data dashboard (Scraping Browser zone).

2. **Crawl API / Dataset API** — Set `BRIGHT_DATA_API_KEY` in `.env.local` for the Crawl Runner and Settings. Configure Dataset ID in **Settings → Bright Data**. The Crawl Runner at `/crawl` lets you trigger crawls with custom URLs.

API keys are server-side only; never expose them to the client.

## 🗂️ Project Structure

**Clean, organized, and production-ready!** No test files, no duplicates, just essential code and comprehensive documentation.

```plaintext
workforce-pulse/
├── 📂 src/                     # Next.js Application
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/              # Main application routes
│   │   │   ├── dashboard/      # 📊 Dashboard page
│   │   │   ├── jobs/           # 💼 Job listings with filters
│   │   │   ├── sectors/        # 🏢 Sector analysis
│   │   │   ├── skills/         # 🎯 Skills tracking
│   │   │   ├── missions/       # ✅ Action missions
│   │   │   ├── playbooks/      # 📖 Shareable playbooks
│   │   │   ├── map/            # 🗺️ Geospatial visualization
│   │   │   ├── settings/       # ⚙️ User settings & config
│   │   │   └── crawl/          # 🤖 Job scraping runner
│   │   ├── (marketing)/        # Landing & marketing pages
│   │   └── api/                # API routes
│   │       ├── jobs/           # Job aggregation endpoints
│   │       ├── brightdata/     # Bright Data integration
│   │       ├── city-jobs/      # JobAps RSS parser
│   │       └── workforce-data/ # ArcGIS data endpoints
│   ├── components/             # React components
│   │   ├── branding/           # 🏛️ Montgomery civic branding
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── jobs/               # Job cards & filters
│   │   ├── sectors/            # Sector components
│   │   ├── skills/             # Skills visualization
│   │   ├── missions/           # Mission tracking
│   │   ├── playbooks/          # Playbook components
│   │   ├── map/                # Map & geospatial
│   │   ├── brightdata/         # Scraping UI
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # shadcn/ui components
│   ├── services/               # API service layer
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── data/                   # Mock/stub data
│   ├── models/                 # TypeScript models
│   ├── integrations/           # Integration helpers
│   └── types/                  # TypeScript types
│
├── 📂 backend/                 # Express.js API Server
│   ├── src/
│   │   ├── models/             # MongoDB schemas
│   │   │   ├── JobPosting.js   # 💼 Job posting with tracking
│   │   │   ├── Mission.js      # ✅ Community missions
│   │   │   ├── Playbook.js     # 📖 Action playbooks
│   │   │   ├── PulseCheckIn.js # 📊 Daily pulse tracking
│   │   │   ├── CommunityProfile.js
│   │   │   ├── BenefitRedemption.js
│   │   │   ├── Sector.js       # 🏢 Sector data
│   │   │   └── Skill.js        # 🎯 Skills data
│   │   ├── routes/             # Express routes
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helper functions
│   │   ├── seeds/              # Database seeders
│   │   ├── config/             # Configuration
│   │   └── server.js           # Server entry point
│   ├── Dockerfile              # Container configuration
│   └── README.md               # Backend documentation
│
├── 📂 docs/                    # **Comprehensive Documentation**
│   ├── README.md               # 📍 Documentation hub
│   ├── agents.md               # 🤖 AI agents quick reference
│   ├── getting-started/        # 🚀 Onboarding guides
│   │   ├── setup.md            # Environment setup
│   │   ├── quick-reference.md  # Common commands
│   │   └── agents.md           # AI agents guide
│   ├── architecture/           # 🏗️ System design
│   │   ├── overview.md         # Architecture overview
│   │   ├── diagrams.md         # System diagrams
│   │   ├── design-system.md    # UI/UX patterns
│   │   ├── data-sources.md     # External APIs
│   │   └── caching-system.md   # Caching strategy
│   ├── development/            # 💻 Development guides
│   │   ├── implementation-guide.md
│   │   ├── api-reference.md
│   │   ├── code-recipes.md
│   │   ├── mongodb-job-tracking.md
│   │   └── (feature guides)
│   ├── integrations/           # 🔌 External services
│   │   ├── brightdata-crawl-api.md
│   │   ├── scraping-setup.md
│   │   └── (integration docs)
│   ├── deployment/             # 🚀 Deployment
│   │   ├── vercel-setup.md
│   │   ├── database-setup.md
│   │   └── deployment-checklist.md
│   └── archive/                # 📦 Historical docs
│
├── 📂 .github/
│   └── copilot/                # 🤖 6 specialized AI agents
│       ├── Frontend Agent.agent.md
│       ├── Backend Agent.agent.md
│       ├── Integration Agent.agent.md
│       ├── Testing Agent.agent.md
│       ├── Documentation Agent.agent.md
│       └── DevOps Agent.agent.md
│
├── 📂 public/
│   └── images/                 # 🖼️ Static assets
│       ├── city-logo.png
│       ├── montgomery-city-mark.png
│       └── montgomery-[1-3].jpg
│
└── 📄 Configuration Files
    ├── .env.example            # Environment template
    ├── .eslintrc.json          # ESLint config
    ├── components.json         # shadcn/ui config
    ├── next.config.js          # Next.js config
    ├── package.json            # Dependencies
    ├── tailwind.config.ts      # Tailwind CSS
    ├── tsconfig.json           # TypeScript
    ├── vercel.json             # Vercel deployment
    └── vitest.config.ts        # Testing config
```

## 🤖 AI Agents

Workforce Pulse includes **6 specialized AI agents** configured in `.github/copilot/` to accelerate development across all aspects of the project.

### Available Agents

| Agent | Expertise | Use For |
|-------|-----------|----------|
| 🎨 **Frontend Agent** | Next.js, React 19, TypeScript, Tailwind CSS | UI components, pages, styling, client-side logic |
| 🔧 **Backend Agent** | Express, MongoDB, API design, validation | Server routes, controllers, database models |
| 🔌 **Integration Agent** | External APIs, Bright Data, job scraping | API integrations, data transformations, scraping |
| ✅ **Testing Agent** | Vitest, unit tests, E2E tests, QA | Writing tests, debugging, quality assurance |
| 📝 **Documentation Agent** | Technical writing, API docs, comments | Documentation, README files, code comments |
| 🚀 **DevOps Agent** | Vercel, CI/CD, Docker, optimization | Deployment, build configs, performance tuning |

### Quick Examples

```bash
# Frontend development
@Frontend Agent: Create a responsive job filter component with sector selection

# Backend API
@Backend Agent: Add validation middleware for mission creation

# External integrations
@Integration Agent: Add error handling for Bright Data API calls

# Testing
@Testing Agent: Write unit tests for the job aggregation service

# Documentation
@Documentation Agent: Update API docs with the new filter endpoint

# Deployment
@DevOps Agent: Optimize the Vercel build configuration
```

📖 **Full Guide**: [docs/getting-started/agents.md](docs/getting-started/agents.md) | **Quick Reference**: [docs/agents.md](docs/agents.md)

## 📚 Documentation
**Comprehensive, organized, and easy to navigate!** All documentation has been professionally organized with lowercase filenames and clear categorization.
**� Full Documentation Hub**: [docs/README.md](docs/README.md) - Complete documentation index

**👉 Start Here**: [Setup Guide](docs/getting-started/setup.md) and [Quick Reference](docs/getting-started/quick-reference.md)

### Quick Links

- **New to the project?** → [Getting Started](docs/getting-started/) | [Setup Guide](docs/getting-started/setup.md)
- **Need code examples?** → [Code Recipes](docs/development/code-recipes.md)
- **Understanding architecture?** → [Architecture Overview](docs/architecture/overview.md)
- **Using AI agents?** → [Agents Guide](docs/getting-started/agents.md)
- **Deploying?** → [Deployment](docs/deployment/) | [Vercel Setup](docs/deployment/vercel-setup.md)
- **API reference?** → [API Documentation](docs/development/api-reference.md)
- **Job scraping?** → [Scraping Setup](docs/integrations/scraping-setup.md)
- **Project status?** → [Integration Status](docs/development/integration-status.md)

### Documentation Sections

- 🚀 **[Getting Started](docs/getting-started/)** - Setup, quick reference, and AI agents guide
- 🏗️ **[Architecture](docs/architecture/)** - System design, diagrams, and data sources
- 💻 **[Development](docs/development/)** - Implementation guides, API docs, and code recipes
- 🔌 **[Integrations](docs/integrations/)** - External APIs and job scraping setup
- 🚀 **[Deployment](docs/deployment/)** - Database setup, Vercel deployment, and checklists

### By Role

- **Frontend Developers** → [Getting Started](docs/getting-started/) → [Architecture](docs/architecture/) → [Code Recipes](docs/development/code-recipes.md)
- **Backend Developers** → [Getting Started](docs/getting-started/) → [API Reference](docs/development/api-reference.md) → [MongoDB Job Tracking](docs/development/mongodb-job-tracking.md)
- **DevOps/Deployment** → [Deployment](docs/deployment/) → [Vercel Setup](docs/deployment/vercel-setup.md)
- **Integration Work** → [Integrations](docs/integrations/) → [Bright Data Guide](docs/integrations/brightdata-crawl-api.md)

## 🎯 Project Status

✅ **Production Ready** - Clean codebase with comprehensive documentation  
✅ **Well Documented** - 40+ documentation files organized by category  
✅ **AI-Assisted Development** - 6 specialized agents configured  
✅ **MongoDB Integration** - Complete job tracking with scraping metadata  
✅ **Multi-Source Scraping** - JobAps, USAJOBS, Indeed, LinkedIn, Glassdoor  
✅ **Montgomery Branding** - Custom civic design system and iconography  
✅ **Testing Ready** - Vitest configuration with test structure  
✅ **Deployment Ready** - Vercel optimized with Docker support  

## 🔧 Troubleshooting

### Common Issues

#### "BRIGHT_DATA_API_KEY is not configured"

Add the key to `.env.local` and restart the dev server.

#### "BRIGHT_DATA_BROWSER_WSS not configured"

- Required for POST `/api/jobs/scrape` (Indeed scraping).
Get the WebSocket URL from Bright Data Scraping Browser zone.

#### Snapshot not ready

Crawls can take several minutes. The Crawl Runner polls automatically.

#### ArcGIS / JobAps errors

Check that `NEXT_PUBLIC_ARCGIS_*` and `JOBAPS_RSS_URL` are set in `.env.local`.

#### MongoDB connection errors

Ensure `MONGODB_URI` is set correctly in `backend/.env`. Check MongoDB is running locally or your cloud connection is active.

#### USAJOBS API errors

- Verify `USAJOBS_API_KEY` and `USAJOBS_USER_AGENT` are set.
- User agent must be a valid email address.

## 🚢 Deployment

### Quick Deploy to Vercel (Auto-Deploy Enabled)

**✅ Your GitHub repo is already connected to Vercel!**  
**✅ MongoDB Atlas is configured!**

Every push to `main` automatically deploys to production! 🎉

#### Step 1: Add Environment Variables (One-Time Setup)

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

**MONGODB_URI**
```
mongodb+srv://USER:PASSWORD@workforce-pulse.incefrw.mongodb.net/workforce-pulse?retryWrites=true&w=majority&appName=Workforce-pulse
```

**NEXT_PUBLIC_USE_STUBS**
```
false
```

#### Step 2: Push to Deploy

Use the quick script:
```powershell
.\push-to-deploy.ps1
```

Or manually:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Vercel automatically builds and deploys!** ✨

#### Step 3: Monitor Deployment

Watch live at: [vercel.com/dashboard](https://vercel.com/dashboard)

Deployment typically takes 2-3 minutes.

### Complete Auto-Deploy Guide

📖 **[AUTO_DEPLOY_GUIDE.md](AUTO_DEPLOY_GUIDE.md)** - Complete workflow, monitoring, troubleshooting

📖 **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Quick start guide

### MongoDB Atlas Configuration

✅ **Already configured!**
- **Cluster**: workforce-pulse.incefrw.mongodb.net
- **Database**: workforce-pulse
- **Connection**: Set in `.env.local` and ready for Vercel

**⚠️ Important**: Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access for Vercel deployment.

### What Happens on Deploy

1. ✅ Vercel detects your push to GitHub
2. ✅ Builds your Next.js application
3. ✅ API routes connect directly to MongoDB Atlas
4. ✅ Cron job configured for daily job updates (midnight UTC)
5. ✅ Deploys to global edge network
6. ✅ Sends deployment notification

### Test Deployment

After deploying, verify these endpoints:
- `https://your-app.vercel.app/api/skills`
- `https://your-app.vercel.app/api/jobs/stats`
- `https://your-app.vercel.app/api/jobs/aggregate`

### Branch Previews

- **main branch** → Production deployment
- **other branches** → Preview deployments with unique URLs
- **Pull requests** → Automatic preview deployments

### Additional Resources

- [Vercel Dashboard](https://vercel.com/dashboard) - Monitor deployments
- [MongoDB Atlas](https://cloud.mongodb.com/) - Database management
- [docs/deployment/](docs/deployment/) - Technical documentation

### Backend Deployment

The backend includes a Dockerfile for container deployment:

```bash
cd backend
docker build -t workforce-pulse-backend .
docker run -p 5000:5000 --env-file .env workforce-pulse-backend
```

## 🔐 Environment Variables

### Frontend (`.env.local`)

```bash
# Feature flags
NEXT_PUBLIC_USE_STUBS=false

# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Bright Data
BRIGHT_DATA_API_KEY=your_api_key
BRIGHT_DATA_BROWSER_WSS=wss://brd-customer-xxx-zone-xxx:pass@brd.superproxy.io:9222
BRIGHT_DATA_INDEED_DATASET_ID=gd_xxx
BRIGHT_DATA_LINKEDIN_DATASET_ID=gd_xxx

# USAJOBS
USAJOBS_API_KEY=your_api_key
USAJOBS_USER_AGENT=your-email@example.com

# JobAps RSS
JOBAPS_RSS_URL=https://jobapscloud.com/MGM/rss.asp

# ArcGIS endpoints
NEXT_PUBLIC_ARCGIS_911_URL=https://services7.arcgis.com/...
NEXT_PUBLIC_ARCGIS_STATIONS_URL=https://services7.arcgis.com/...
# ... see .env.example for complete list

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

### Backend (`backend/.env`)

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/workforce-pulse

# JWT
JWT_SECRET=your_jwt_secret

# Bright Data
BRIGHT_DATA_API_KEY=your_api_key

# USAJOBS
USAJOBS_API_KEY=your_api_key
USAJOBS_USER_AGENT=your-email@example.com
```

## 📄 License

Private — hackathon project.

## 🎉 Project Highlights

### What Makes Workforce Pulse Special

- **🎯 Civic-Focused**: Designed specifically for Montgomery, Alabama's workforce development needs
- **🤖 AI-Accelerated**: 6 specialized AI agents reduce development time and improve code quality
- **📊 Data-Driven**: Real-time job market intelligence from multiple authoritative sources
- **🏛️ Community-Centered**: Montgomery-specific branding with custom civic design system
- **📚 Well-Documented**: 40+ documentation files with clear navigation and examples
- **🧹 Production-Ready**: Clean codebase, comprehensive tests, deployment-ready

### Key Achievements

✅ **Multi-Source Job Aggregation** - JobAps, USAJOBS, Indeed, LinkedIn, Glassdoor  
✅ **MongoDB Job Tracking** - Automatic tracking of new vs. recurring job postings  
✅ **Interactive Dashboard** - Real-time workforce signals and trend analysis  
✅ **Geospatial Visualization** - Map view with Montgomery landmarks and workforce data  
✅ **Action Planning** - Missions and Playbooks for community coordination  
✅ **Comprehensive Documentation** - Organized by role and task, easy to navigate  

## 🙏 Acknowledgments

Built for **World Wide Vibes Hackathon 2** (March 2026), focusing on civic tech solutions for Montgomery, Alabama's workforce development challenges.

Special thanks to:
- Montgomery city officials for civic branding resources
- Bright Data for job scraping capabilities
- The open-source community for amazing tools and frameworks

## 🚀 Next Steps

Interested in the project? Here's how to get started:

1. **Quick Start**: Follow the [Setup Guide](docs/getting-started/setup.md)
2. **Explore Docs**: Browse the [Documentation Hub](docs/README.md)
3. **Use AI Agents**: Check out the [AI Agents Guide](docs/getting-started/agents.md)
4. **Deploy**: Follow the [Deployment Guide](docs/deployment/vercel-setup.md)

---

**Questions?** Check the [Setup Guide](docs/getting-started/setup.md), [Quick Reference](docs/getting-started/quick-reference.md), or browse the comprehensive documentation in [docs/](docs/).

**Last Updated**: March 9, 2026 | **Status**: ✅ Production Ready
