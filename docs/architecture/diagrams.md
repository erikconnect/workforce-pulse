# Component & Data Flow Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages (Role-Based)                                       │   │
│  │                                                            │   │
│  │  Dashboard Page                    Skills Page            │   │
│  │  ├─ Admin Dashboard               ├─ Skill Grid           │   │
│  │  │  ├─ CityProfile (hero)         │  ├─ Category Filter   │   │
│  │  │  ├─ 4 Health KPI cards         │  ├─ Demand Filter     │   │
│  │  │  ├─ Sector strips               │  └─ Search bar        │   │
│  │  │  └─ LiveScrape widget          │                        │   │
│  │  │                                 │  Missions Page        │   │
│  │  └─ Citizen Dashboard             │  ├─ Mission Grid       │   │
│  │     ├─ CityProfile (hero)         │  ├─ Status tabs        │   │
│  │     ├─ 4 User KPI cards           │  └─ Create dialog      │   │
│  │     ├─ Featured missions           │                        │   │
│  │     ├─ Featured jobs               │  Playbooks Page       │   │
│  │     └─ Recent badge                │  ├─ Playbook Grid     │   │
│  │                                     │  ├─ Search            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Reusable Components                                      │   │
│  │                                                            │   │
│  │  ┌──────────────────┐    ┌──────────────────┐             │   │
│  │  │ SignalCard       │    │ InsightCards     │             │   │
│  │  │ ├─ Tone styling  │    │ ├─ Icon mapping  │             │   │
│  │  │ ├─ Icon + Value  │    │ ├─ Staggered     │             │   │
│  │  │ ├─ Status text   │    │ │  animation     │             │   │
│  │  │ ├─ Stats grid    │    │ └─ CTA link      │             │   │
│  │  │ ├─ Chips array   │    │                  │             │   │
│  │  │ └─ Action button │    │ SkillCard        │             │   │
│  │  │                  │    │ ├─ Sparkline     │             │   │
│  │  │ JobCard          │    │ ├─ Tags          │             │   │
│  │  │ ├─ Title + dept  │    │ └─ Status badge  │             │   │
│  │  │ ├─ Salary bar    │    │                  │             │   │
│  │  │ ├─ Deadline      │    │ MissionCard      │             │   │
│  │  │ │  urgency ring  │    │ ├─ Progress bar  │             │   │
│  │  │ ├─ Description   │    │ ├─ Steps         │             │   │
│  │  │ │  preview       │    │ ├─ Reward badge  │             │   │
│  │  │ └─ Like/Save btn │    │ └─ Tags          │             │   │
│  │  │                  │    │                  │             │   │
│  │  │ PlaybookCard     │    │ QuickActions     │             │   │
│  │  │ ├─ Stars rating  │    │ ├─ 6 nav buttons │             │   │
│  │  │ ├─ Difficulty    │    │ └─ Glass panel   │             │   │
│  │  │ ├─ Like/Save     │    │                  │             │   │
│  │  │ └─ Author info   │    │ + More...        │             │   │
│  │  └──────────────────┘    └──────────────────┘             │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      React Query (Data Management)       │
        ├─────────────────────────────────────────┤
        │ • Caching + Invalidation                 │
        │ • Mutations for CRUD                     │
        │ • Stale-while-revalidate                 │
        │ • Error handling + loading states        │
        └─────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ Services Layer  │ │ Services Layer  │ │ Services Layer  │
    │ (Stubs Mode)    │ │ (Real API Mode) │ │ (Real API MODE) │
    ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
    │ USE_STUBS=true  │ │ USE_STUBS=false │ │ (Same code)     │
    │                 │ │                 │ │                 │
    │ fetchSkills()   │ │ if (USE_STUBS)  │ │ Calls to:       │
    │ ├─ Filter stubs │ │   return        │ │ /api/jobs       │
    │ │  locally      │ │   mutable stub  │ │ /api/sectors    │
    │ └─ Return array │ │ else            │ │ /api/skills     │
    │                 │ │   fetch(...)    │ │ /api/missions   │
    │ fetchMissions() │ │                 │ │ /api/playbooks  │
    │ ├─ Return mut   │ │ Services:       │ │                 │
    │ │  copy of stubs│ │ • jobs.ts       │ │ Real API Routes │
    │ └─ Points award │ │ • sectors.ts    │ │ (Express Server)│
    │                 │ │ • skills.ts     │ │ ├─ MongoDB      │
    │ createMission() │ │ • missions.ts   │ │ ├─ Bright Data  │
    │ ├─ Generate ID  │ │ • playbooks.ts  │ │ │  (Scraper)    │
    │ ├─ Add to       │ │ • workforce-    │ │ ├─ JobAps RSS   │
    │ │  mutable list │ │   data.ts       │ │ ├─ USAJOBS API  │
    │ └─ Award points │ │ • community-    │ │ ├─ ArcGIS API   │
    │                 │ │   profile.ts    │ │ └─ MongoDB      │
    │ ...             │ └─────────────────┘ └─────────────────┘
    │                 │
    └─────────────────┘
              │
        ┌─────────────────────────────────────────┐
        │  /src/services/stubs/                   │
        ├─────────────────────────────────────────┤
        │ • sectors.stub.ts (8 sectors)           │
        │ • skills.stub.ts (~20 skills)           │
        │ • missions.stub.ts (5-10 missions)      │
        │ • playbooks.stub.ts (10+ playbooks)     │
        │ • roles.stub.ts (roles per sector)      │
        │                                          │
        │ Mutable copies during session:           │
        │ • mutableMissions [] in missions.ts      │
        │ • mutablePlaybooks [] in playbooks.ts    │
        └─────────────────────────────────────────┘
```

---

## Data Query Flow

### Example: Dashboard Load

```
User visits /dashboard
         │
         ▼
[useUserRole] Hook
    │
    ├─→ isCitizen = true?  ───→ Yes ──→ <CitizenDashboard>
    │                           │
    │                           ▼
    │                    Multiple Queries:
    │                    ┌─────────────────────────┐
    │                    │ useQuery({               │
    │                    │   queryKey: [cityJobs] │
    │                    │   queryFn: () =>        │
    │                    │     fetch('/api/cities) │
    │                    │ })                      │
    │                    ├─ onSuccess:             │
    │                    │  setFeaturedJobs()      │
    │                    │  setNextDeadline()      │
    │                    └─────────────────────────┘
    │
    └─→ isAdmin = true?  ───→ Yes ──→ <AdminDashboard>
                            │
                            ▼
                     Multiple Queries:
                     ┌──────────────────┐
                     │ [pulseSummary]   │
                     │ [sectors]        │
                     │ [jobInsights]    │
                     │ [workforceData]  │
                     └──────────────────┘
```

### Example: Mission Step Update

```
User clicks checkbox on mission step
         │
         ▼
Step Component
  │
  ├─ onClick → mutation.mutate(stepId)
  │
  ▼
useMutation {
  mutationFn: updateMissionStep(missionId, stepId, true)
}
  │
  ├─ If USE_STUBS:
  │  ├─ Find mission in mutableMissions[]
  │  ├─ Toggle step.completed
  │  ├─ Recalculate mission.progress
  │  ├─ Award points via adjustDomainPoints()
  │  ├─ Update streak if mission completed
  │  └─ Return updated mission
  │
  └─ Else:
     ├─ PATCH /api/missions/:id/steps/:stepId
     ├─ { completed: true }
     └─ Return persisted mission
        │
        ▼
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["missions"]       ← Refetch missions list
      })
      queryClient.invalidateQueries({
        queryKey: ["missionMemberProfile"] ← Refetch points
      })
    }
        │
        ▼
    UI re-renders with:
    ├─ Updated step checkbox state
    ├─ Updated progress bar
    ├─ Updated points/streak display
    └─ Celebration animation
```

---

## Sector Enrichment Flow

```
User visits Skills or Dashboard
         │
         ▼
useQuery({
  queryKey: ["sectors"],
  queryFn: fetchSectors
})
         │
         ▼
fetchSectors() in services/api/sectors.ts
         │
         ├─→ Load base sectors from stub
         │   ├─ Public Safety
         │   ├─ Healthcare
         │   ├─ Technology
         │   └─ ... (8 total)
         │
         ├─→ Fetch real job data
         │   GET /api/jobs
         │   Returns: {
         │     count: 847,
         │     insights: {
         │       sectorBreakdown: [
         │         { sectorId: "public-safety", count: 247, percentChange: 12.3 },
         │         { sectorId: "healthcare", count: 156, percentChange: -5.2 },
         │         ...
         │       ]
         │     }
         │   }
         │
         ├─→ Enrich each sector
         │   For each sector {
         │     Find jobsInSector.count
         │     │
         │     ├─ If 1-5 jobs → pulseScore = 30-50 → status="stable"
         │     ├─ If 6-15 jobs → pulseScore = 50-65 → status="watch"
         │     └─ If 16+ jobs → pulseScore = 65-90 → status="critical"
         │     │
         │     Also update:
         │     ├─ openRolesCount = job count
         │     ├─ KPI calculations
         │     └─ Trend visualization
         │   }
         │
         └─→ Return enriched sectors[]
              │
              ▼
         Components render with:
         ├─ Color-coded by status
         ├─ Job count in KPI
         └─ Visual indicators (rings, bars)
```

---

## Component Rendering: SignalCard Example

```
Input:
<DashboardSignalCard
  tone="watch"
  icon={Trophy}
  title="My Points"
  value={<AnimatedCounter value={2850} />}
  status="Level 5"
  description="340 pts to level 6"
  stats={[
    { label: "Mission pts", value: "1200" },
    { label: "Skill pts", value: "850" },
    { label: "Next level", value: "3190" }
  ]}
/>
         │
         ▼
Renders:
┌───────────────────────────────────────┐
│               WATCH TONE               │  ← Amber gradient bg
├───────────────────────────────────────┤
│ Progress              (eyebrow)        │
│ My Points             (title)          │
│ ├─ Trophy icon [watch bg amber box]   │ ├─ Status: Level 5
│ │ 2,850 pts  (animated counter)       │
│ │ 340 pts to next level               │ (description)
│ │                                     │
│ │ ┌─ Mission pts: 1,200               │ (stats grid)
│ │ ├─ Skill pts:     850               │
│ │ └─ Next level:  3,190               │
│ │                                     │
│ │ [View rewards] (action button)      │
│ │                                     │
│ └─ Custom child content (if provided) │
└───────────────────────────────────────┘

Tone Styling Applied:
├─ Shell: Amber gradient + border
├─ Icon wrap: Amber bg + icon color
├─ Badge: Amber text on lt amber bg
├─ Stats: Amber-tinted bg
└─ All text: Amber tone colors
```

---

## Mission Creation Flow

```
User clicks "+ Create Mission"
         │
         ▼
Dialog opens with form:
┌────────────────────────────────────────┐
│ New Mission                         [x] │
├────────────────────────────────────────┤
│ Title: [_____________________________]  │
│ Description: [_______________________] │
│ Priority: [Critical ▼]                 │
│ Sector: [Healthcare ▼]                 │
│ Due Date: [MM/DD/YYYY]                 │
│                                        │
│ Add Steps:                             │
│ Step 1: [                              │
│   Title: [________________]            │
│   Description: [___________]           │
│   Due Date: [MM/DD/YYYY]               │
│   [- Remove]                           │
│ ]                                      │
│ [+ Add Step]                           │
│                                        │
│             [Cancel] [Create]          │
└────────────────────────────────────────┘
         │
         User fills form and clicks [Create]
         │
         ▼
useMutation {
  mutationFn: createMission(payload)
}
         │
         ├─ If USE_STUBS:
         │  ├─ Create new Mission object {
         │  │    id: `mission-${Date.now()}`,
         │  │    ...payload,
         │  │    rewardPoints: 180 (if critical) + steps*10
         │  │  }
         │  ├─ Add to mutableMissions[]
         │  ├─ recordMissionAction()
         │  └─ Return new mission
         │
         └─ Else:
            ├─ POST /api/missions
            ├─ { title, description, priority, sectorId, ... }
            └─ Return persisted mission
               │
               ▼
           onSuccess: () => {
             dialog.close()
             queryClient.invalidateQueries({ queryKey: ["missions"] })
           }
               │
               ▼
           Missions list refetchesand shows new mission
```

---

## Job Scraping Integration

```
User clicks [Live Scrape] button
         │
         ▼
onClick handler:
  setStatus("scraping")
  setProgress(10)
         │
         ▼
POST /api/jobs/scrape
  │
  ├─ Backend connects to Bright Data Scraping Browser
  │    (Takes 60-90 seconds)
  │
  ├─ Scrapes all configured queries:
  │    └─ Montgomery job boards (Indeed, LinkedIn, JobAps, etc.)
  │
  ├─ For each job posting:
  │    ├─ Extract title, salary, description
  │    ├─ Auto-classify sectorId (ML)
  │    ├─ Extract skills from description
  │    └─ Store in MongoDB
  │
  ├─ Generate insights:
  │    ├─ Top skills by frequency
  │    ├─ Sector breakdown
  │    ├─ Salary ranges
  │    ├─ Hiring trends
  │    └─ 7-day timelines
  │
  ├─ Cache in memory
  │
  └─ Return ScrapeResult {
       jobs: 847,
       topSectors: ["Public Safety", "Healthcare"},
       newSkills: ["CPR", "CDL", "Nursing"]
     }
       │
       ▼
   Frontend received response:
   ├─ setProgress(100)
   ├─ setStatus("done")
   ├─ setResult(data)
   │
   └─ Invalidate queries:
       ├─ ["pulseSummary"]      ← Dashboard KPIs
       ├─ ["sectors"]           ← Sector enrichment
       ├─ ["cityJobs"]          ← Featured jobs
       ├─ ["job-insights"]      ← Insights cards
       └─ ["skills"]            ← Skill trends
          │
          ▼
      All components refetch → UI updates with fresh data
```

---

## State Management Summary

### Global State (Server Queries via React Query)
- `["sectors"]` - Sector list with KPIs
- `["skills"]` - Skill catalog
- `["missions"]` - Mission list
- `["playbooks"]` - Playbook list
- `["pulseSummary"]` - Daily check-in status
- `["missionMemberProfile"]` - User's gamification state
- `["jobInsights"]` - Aggregated job intelligence
- `["cityJobs"]` - Featured job list

### Local/Session State (Stubs Mode)
- `mutableMissions[]` in missions.ts
- `mutablePlaybooks[]` in playbooks.ts
- `communityProfile` in community-profile.ts
- Component-level loading/error states

### UI State (Component-Level)
- Dashboard radio buttons (Admin/Citizen)
- Mission status filter tabs
- Search/filter inputs
- Modal dialog visibility
- Expanded/collapsed cards

---

## File Dependencies Map

```
pages/*.tsx
├─ use [React Query] → fetches data
├─ use [Services] → api/jobs, api/sectors, etc.
├─ use [Hooks] → use-job-insights, use-user-role
└─ render [Components] → dashboard/*, jobs/*, etc.

services/api/*.ts
├─ check USE_STUBS flag
├─ conditionally:
│  ├─ STUBS: use stubs/*.stub.ts
│  └─ REAL: fetch from backend /api/...
└─ export async function()

services/types/*.ts
├─ TypeScript interfaces for everything
├─ Used by api/*.ts
├─ Used by components
└─ Used by hooks

components/**/*.tsx
├─ accept props (mostly types from services/types)
├─ use React Query (useQuery, useMutation)
├─ use hooks (useUserRole, useTotalJobs)
└─ render JSX with Tailwind + Lucide icons

hooks/*.ts
├─ use React Query
├─ use services/api functions
├─ custom logic + memoization
└─ export custom hooks

stubs/**/*.stub.ts
├─ export const data arrays
├─ imported by services/api/*.ts
└─ used when NEXT_PUBLIC_USE_STUBS=true
```

---

## Summary: Key Takeaways

1. **Architecture**: Service layer abstraction allows seamless toggle between stubs and real API
2. **Data Flow**: React Query manages all state, components are presentational
3. **Gamification**: Points system auto-calculates on mission/playbook actions
4. **Job Integration**: Real scraping pipeline feeds into sector enrichment
5. **Extensibility**: New pages/components easily added by following existing patterns
6. **TypeScript-first**: Full type safety across all layers

