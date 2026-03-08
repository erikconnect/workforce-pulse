# Workforce Pulse - Workspace Structure & Integration Summary

**Analysis Date**: March 7, 2026  
**Scope**: Complete dashboard, skills, missions, playbooks architecture

---

## 🎯 QUICK OVERVIEW

```
FRONTEND (Next.js)
  ├─ Pages (Role-based)
  │  ├─ Dashboard → [Admin | Citizen] view
  │  ├─ Skills page
  │  ├─ Missions page
  │  └─ Playbooks page
  │
  ├─ Services Layer (React Query)
  │  ├─ /api/jobs → Job postings + insights
  │  ├─ /api/sectors → Sectors enriched with job data
  │  ├─ /api/skills → Skill demand
  │  ├─ /api/missions → Community missions (CRUD)
  │  ├─ /api/playbooks → Playbooks (CRUD)
  │  └─ Stubs ↔ Real API (toggle with NEXT_PUBLIC_USE_STUBS)
  │
  └─ Components (Reusable)
     ├─ DashboardSignalCard (KPI display)
     ├─ InsightCards (AI insights)
     ├─ JobCard (Job listing)
     └─ SkillCard, MissionCard, PlaybookCard

BACKEND (Express.js + MongoDB)
  ├─ POST /api/jobs/scrape → Bright Data integration
  ├─ GET/POST /api/missions → Mission management
  ├─ GET/POST /api/playbooks → Playbook management
  └─ External APIs
     ├─ Bright Data (job scraping)
     ├─ JobAps RSS (city jobs)
     ├─ USAJOBS API
     └─ ArcGIS (911 calls, permits)
```

---

## 📊 DATA STRUCTURES

### Core Types (TypeScript)
```typescript
// Pulse System
type PulseStatus = "critical" | "watch" | "stable"

// Sector - Workforce indicator
interface Sector {
  id: string
  name: string
  pulseScore: number          // 0-100 based on open jobs
  status: PulseStatus         // Calculated from pulseScore
  kpis: SectorKpi[]           // Business metrics
  sparklineData: number[]     // 7-day trend
  openRolesCount: number      // Jobs in this sector
  employeeCount: number
}

// Skill - In-demand capability
interface Skill {
  id: string
  name: string
  category: string            // "Healthcare", "IT", etc.
  demandLevel: PulseStatus
  growthRate: number          // Percentage
  sparklineData: number[]     // 7-day trend
  relatedRoles: string[]      // Role IDs
  trainingResources: {
    title: string
    url: string
    provider: string
  }[]
}

// Mission - Community initiative
interface Mission {
  id: string
  title: string
  status: "active" | "completed" | "paused"
  priority: PulseStatus       // Affects reward: critical=180pts, watch=130, stable=90
  progress: number            // 0-100% from completed steps
  steps: MissionStep[]        // Checklist items
  sectorId: string
  rewardPoints: number
  participantCount: number
  dueDate: string
}

// Playbook - Step-by-step workflow
interface Playbook {
  id: string
  title: string
  summary: string
  authorName: string
  difficulty: "starter" | "operator" | "advanced"
  steps: { order: number; instruction: string }[]
  sectorId: string
  likes: number               // Community engagement
  saves: number
  rewardPoints: number
  linkedSkills: string[]
}

// Job Posting - Raw job data
interface JobPosting {
  id: string
  title: string
  org: string
  location: string
  salary?: string
  description: string
  source: string              // "indeed", "linkedin", "jobaps"
  url: string
  sectorId: string | null     // Auto-classified
  extractedSkills: string[]   // Parsed from description
  postedDate: string
}

// Gamification
interface MissionMemberProfile {
  id: string
  level: number
  points: number
  nextLevelPoints: number
  streak: number              // Daily check-in streak
  missionPoints: number       // Points from mission completions
  skillPoints: number         // Points from skill tracking
  badges: MissionMemberBadge[]
  completedMissionCount: number
  activeMissionCount: number
}
```

---

## 🏠 PAGES & COMPONENTS

### Dashboard (`/src/app/(app)/dashboard/page.tsx`)

**Two Variants** (role-based):

#### 1. Citizen Dashboard
```
┌─────────────────────────────────────────┐
│ "Good morning, Citizen"                 │
│ Explore opportunities, join missions    │
├─────────────────────────────────────────┤
│         Montgomery, Alabama              │  ← CityProfile component
│  911: 4.2K │ Permits: 156 │ Jobs: 847   │
└─────────────────────────────────────────┘
     ↓ 4 KPI Cards (DashboardSignalCard)
┌──────────┬──────────┬──────────┬──────────┐
│ My Points│ Active   │ Open     │ Check-In │
│  (Trophy)│ Missions │ Jobs     │ & Badges │
│ Level 5  │ (Target) │(Briefcase)│(Checkmark)
│ 2,850    │ 3 active │ 847 jobs │ 7-day    │
│ 340 → L6 │ 80% comp │ Nursing  │ streak   │
└──────────┴──────────┴──────────┴──────────┘
     ↓ Featured Content
┌────────────────────┬────────────────────┐
│ High-reward mission│ Recent badge       │
│ "Reduce hiring..." │ "Community Builder"│
└────────────────────┴────────────────────┘
```

**Data Queries**:
- `cityJobs` → `/api/city-jobs` → `{ count, lastFetched, jobs[] }`
- `missions` → Fetch all missions
- `missionMemberProfile` → User's gamification state
- `pulseSummary` → Daily check-in streak

#### 2. Admin Dashboard  
```
┌─────────────────────────────────────────┐
│ "Good morning, City Admin"              │
│ Workforce health overview               │
├─────────────────────────────────────────┤
│    Overall Health: 68/100 STABLE        │
│          [||||||||||||||||____]          │
└─────────────────────────────────────────┘
     ↓ 4 System Health Cards
┌──────────┬──────────┬──────────┬──────────┐
│ Public   │Immediate │Training  │ Status   │
│ Safety   │ Needs    │ Gaps     │ Mix      │
│ (CRITICAL)           │          │          │
│ 427 open │ 3 skills │ 1,200    │ 2/8 OK   │
└──────────┴──────────┴──────────┴──────────┘
     ↓ Sector Cards (strip view)
[Public Safety] [Healthcare] [Technology] ...
```

**Data Queries**:
- `pulseSummary` → Overall metrics
- `sectors` → All sector health
- `jobInsights` → Critical roles, skills
- `workforceData` → Demographics

---

### Skills Page (`/src/app/(app)/skills/page.tsx`)

```
┌─────────────────────────────────────────┐
│ Skills  🔍[Search]  [All ▼] [All ▼]     │
│                  Category  Demand Level  │
├─────────────────────────────────────────┤
│ Grid of skill cards:                     │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ CDL      │ │ Nursing  │ │ Cloud    │  │
│ │●●●●●●··· │ │●●●●●    │ │●        │  │
│ │Safety    │ │Healthcare│ │Technology│  │
│ │[CRITICAL]│ │[WATCH]   │ │[STABLE]  │  │
│ │+15.2%▲   │ │+8.1%▲    │ │+2.1%     │  │
│ │7-day     │ │Public    │ │        │  │
│ │trend     │ │Safety    │ │      │  │
│ │          │ │Police    │ │          │  │
│ └──────────┘ └──────────┘ └──────────┘  │
│ [Learn]      [Learn]       [Learn]      │
└─────────────────────────────────────────┘
```

**Data Structure**:
```typescript
interface Skill {
  name: string
  category: string
  demandLevel: PulseStatus
  growthRate: number              // For arrows
  sparklineData: number[]         // 7 mini bars
  relatedRoles: string[]
  trainingResources: { title, url, provider }[]
}
```

**Filtering**: 
- Category: Hardcoded list in page
- Demand Level: critical/watch/stable
- Search: Client-side string matching

**Status**: ✅ Using stubs, need skill extraction from jobs

---

### Missions Page (`/src/app/(app)/missions/page.tsx`)

```
┌─────────────────────────────────────────┐
│ Missions  [All ▼] [+ Create Mission]    │
│ Tab: All  Active  Paused  Completed     │
├─────────────────────────────────────────┤
│ ┌────────────────────────────────────┐  │
│ │ Reduce hiring timeline (CRITICAL)  │  │
│ │ Work with Public Safety recruiting │  │
│ │ [████████████████░░] 85% complete  │  │
│ │ Step 1: ✓ Implement new process   │  │
│ │ Step 2: ✓ Train 5 recruiters      │  │
│ │ Step 3: □ Review hiring data      │  │
│ │ Reward: +180 pts  Joined: 12 people│  │
│ │ Tags: [Critical] [Public Safety]   │  │
│ │ Community impact: 23 faster hires  │  │
│ │ Due: Mar 20, 2026                  │  │
│ │ [Continue] [View details]          │  │
│ └────────────────────────────────────┘  │
│ ... more mission cards ...              │
└─────────────────────────────────────────┘
```

**Data Structure**:
```typescript
interface Mission {
  title: string
  description: string
  status: "active" | "completed" | "paused"
  priority: PulseStatus
  progress: number                // Auto-calc from completed steps
  steps: {
    title: string
    completed: boolean
    dueDate: string
  }[]
  sectorId: string
  rewardPoints: number            // Based on priority + step count
  participantCount: number
  communityImpact: string
  tags: string[]
  impactMetrics?: { label, before, after, unit }[]
  dueDate: string
}
```

**Features**:
- Step toggle → updates progress
- Points awarded on completion
- Streak tracker for consistent engagement
- Can create new missions (dialog form)

**Status**: ✅ Using stubs, points system functional

---

### Playbooks Page (`/src/app/(app)/playbooks/page.tsx`)

```
┌─────────────────────────────────────────┐
│ Playbooks  🔍[Search]  [+ Create]       │
├─────────────────────────────────────────┤
│ Filter: [Difficulty ▼] [Sector ▼]       │
│                                          │
│ ┌──────────────┐ ┌──────────────┐ ...   │
│ │ ⭐⭐⭐⭐⭐    │ │ ⭐⭐⭐⭐      │       │
│ │ Nursing      │ │ Cloud Setup  │       │
│ │ Onboarding   │ │ for Beginners│       │
│ │ Workflow     │ │             │       │
│ │ By: Jane D   │ │ By: Team IT │       │
│ │ [STARTER]    │ │ [OPERATOR]  │       │
│ │ 4 steps      │ │ 5 steps     │       │
│ │ ~6 hours     │ │ ~10 hours   │       │
│ │ +18 pts      │ │ +28 pts     │       │
│ │ ♡ 24 ❤ 8    │ │ ♡ 156 ❤ 42 │       │
│ │ [View]       │ │ [View]      │       │
│ └──────────────┘ └──────────────┘ ...   │
└─────────────────────────────────────────┘
```

**Data Structure**:
```typescript
interface Playbook {
  title: string
  summary: string
  authorName: string
  authorAvatar: string
  difficulty: "starter" | "operator" | "advanced"
  steps: { order: number; instruction: string }[]
  sectorId: string
  tags: string[]
  likes: number
  saves: number
  rewardPoints: number
  estimatedHours: number
  linkedSkills: string[]
  hasLiked: boolean              // User engagement
  hasSaved: boolean
}
```

**Difficulty Auto-calc**:
- < 3 steps → starter
- 3-4 steps → operator  
- 5+ steps → advanced

**Status**: ✅ Using stubs, CRUD operations functional

---

## 🧩 REUSABLE COMPONENTS

### DashboardSignalCard
**Purpose**: KPI display with customizable tone and layout

**Props**:
```typescript
{
  title: string                              // "My Points"
  eyebrow?: string                          // "Progress"
  status?: string                           // "Level 5"
  icon: ElementType                         // Icon component (Lucide icon)
  tone: "critical" | "watch" | "stable" | "neutral"  // Color scheme
  value: ReactNode                          // Number or Skeleton
  suffix?: string                           // "pts", "active", "jobs"
  description: string                       // Long explanation
  stats?: Array<{
    label: string
    value: string | number
    tone?: CardTone
  }>
  chips?: string[]                          // Inline tags
  action?: { label, href?, onClick? }       // CTA button
  children?: ReactNode                      // Custom nested content
  className?: string
}
```

**Tone Styling**:
- **critical**: Red gradient + glow
- **watch**: Amber gradient + glow
- **stable**: Green gradient + glow
- **neutral**: Gray gradient + glow

### InsightCards
**Purpose**: Display AI-generated insights with icons and CTAs

**Props**:
```typescript
insights: Array<{
  id: string
  icon: "alert" | "trend" | "gap" | "win"
  title: string                         // "High occupancy alert"
  body: string                          // Insight explanation
  cta?: { label: string; href: string } // "View sectors" → /sectors
}>
```

**Animation**: Staggered fade-in with delay multipliers

### JobCard
**Purpose**: Display job posting with urgency indicator

**Props**:
```typescript
{
  job: {
    title: string
    link: string
    salary: string
    department: string
    jobType: string
    filingDeadline: string
    employmentType: string
    sectorId: string | null
    description?: string
    location?: string
  }
  interested: boolean
  onToggleInterest: () => void
  dataSource?: string                   // "jobaps", "usajobs", "indeed"
}
```

**Features**:
- Urgency ring: Shows "Closing soon" if deadline < 7 days
- Sector color coding
- Department + salary display
- Description preview (140 char trim)

---

## 🔄 DATA FLOW PATTERNS

### Pattern 1: Query with Stubs Toggle
```typescript
// service/api/skills.ts
export async function fetchSkills(filters?: SkillFilters): Promise<Skill[]> {
  if (USE_STUBS) {
    // Filter stub data locally
    let results = stubSkills
    if (filters?.category) results = results.filter(...)
    return results
  }
  
  // Hit real API
  const res = await fetch(`${API}/skills?${params}`)
  if (!res.ok) throw new Error(...)
  return res.json()
}

// component
const { data: skills } = useQuery({
  queryKey: ["skills", filters],
  queryFn: () => fetchSkills(filters)
})
```

### Pattern 2: Mutation with Points
```typescript
// services/api/missions.ts
export async function updateMissionStep(missionId, stepId, completed) {
  if (USE_STUBS) {
    const mission = mutableMissions.find(m => m.id === missionId)
    const step = mission.steps.find(s => s.id === stepId)
    
    const stepPoints = Math.max(12, mission.rewardPoints / mission.steps.length)
    step.completed = completed
    
    if (completed) {
      adjustDomainPoints("missions", stepPoints)  // Award points
    }
    
    mission.progress = Math.round(...) // Recalculate
    return mission
  }
  
  const res = await fetch(`...`, { method: "PATCH", body: ... })
  return res.json()
}

// component
const mutation = useMutation({
  mutationFn: (stepId) => updateMissionStep(missionId, stepId, true),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
  }
})
```

### Pattern 3: Sector Enrichment
```typescript
// services/api/sectors.ts → enrichSectorsWithJobData()
// 1. Fetch base sectors from stubs
// 2. Call GET /api/jobs → get sector breakdown
// 3. For each sector, update:
//    - openRolesCount = job count
//    - pulseScore = logarithmic(job count)
//    - status = "critical" if score >= 75, else "watch"/"stable"
// 4. Return enhanced sectors
```

---

## 📍 KEY INTEGRATION POINTS (Work Needed)

### ✅ Working
1. **Job scraping** - Bright Data integration complete
2. **Sector enrichment** - Jobs feed into pulse scores
3. **Missions/Playbooks CRUD** - Stub operations functional
4. **Gamification** - Points & streaks system in place

### ⚠️ Partial
1. **Job board display** - Shows jobs but no filtering by skill demand
2. **CityProfile** - Shows job count but no real-time scraper sync

### ❌ Not Connected
1. **Skill extraction** - JobPosting.extractedSkills not linked to Skill page trends
2. **Playbook recommendations** - No job→playbook suggestions
3. **Chat/messaging** - No components exist
4. **Application tracking** - No user application history

---

## 🔧 CONFIGURATION

### Environment Variables
```bash
# Toggle stub data
NEXT_PUBLIC_USE_STUBS=true

# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3001

# Bright Data
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_DATASET_ID=...

# ArcGIS
NEXT_PUBLIC_ARCGIS_911_URL=...
NEXT_PUBLIC_ARCGIS_PERMITS_URL=...
```

### File Structure
```
src/
├── app/(app)/
│   ├── dashboard/page.tsx
│   ├── skills/page.tsx
│   ├── missions/page.tsx
│   └── playbooks/page.tsx
├── components/
│   ├── dashboard/
│   │   ├── citizen-dashboard.tsx
│   │   ├── signal-card.tsx
│   │   ├── insight-cards.tsx
│   │   ├── job-data-status.tsx
│   │   ├── live-scrape.tsx
│   │   ├── city-profile.tsx
│   │   └── quick-actions.tsx
│   └── jobs/
│       └── job-card.tsx
├── services/
│   ├── api/
│   │   ├── jobs.ts
│   │   ├── sectors.ts
│   │   ├── skills.ts
│   │   ├── missions.ts
│   │   └── playbooks.ts
│   ├── stubs/
│   │   ├── sectors.stub.ts
│   │   ├── skills.stub.ts
│   │   ├── missions.stub.ts
│   │   └── playbooks.stub.ts
│   └── types/
│       └── index.ts
└── hooks/
    ├── use-job-insights.ts
    ├── use-total-jobs.ts
    ├── use-user-role.ts
    └── use-workforce-data.ts
```

---

## 🚀 NEXT STEPS

### High Priority
1. **Connect job skills to Skill page**
   - Parse JobPosting.extractedSkills
   - Aggregate demand signal
   - Update Skill.demandLevel based on frequency

2. **Real-time job sync on dashboard**
   - JobDataStatus component shows last scrape time
   - Add auto-refresh on scrape completion
   - Update CityProfile metrics instantly

3. **Sector-specific job filtering**
   - SkillCard → filter jobs by related skills
   - Mission card → suggest playbooks for sector

### Medium Priority
1. **Application tracking**
   - Store user job applications
   - Display on profile
   - Track application success rate

2. **Playbook recommendations**
   - When user views job → suggest playbooks for required skills
   - Link playbook to job requirements

3. **Messaging/collaboration** (if needed)
   - Design chat component
   - Integrate with mission team discussions

### Low Priority
1. **Advanced analytics**
   - Historical trend charting
   - Predictive hiring needs
   - Skills gap analysis

2. **Export/reporting**
   - Dashboard PDF export
   - Sector report generation
   - Individual development plan PDF

---

## 📊 SUMMARY TABLE

| Layer | Component | Status | Data Type | Integration |
|-------|-----------|--------|-----------|-------------|
| Dashboard | Citizen | ✅ | Query-based | Jobs, Missions, Profile |
| Dashboard | Admin | ✅ | Query-based | Sectors, Job Insights |
| Skills | Page + Cards | ✅ Stub | Array of Skill | Needs skill extraction |
| Missions | Page + Cards + CRUD | ✅ Stub | Array of Mission | Points working |
| Playbooks | Page + Cards + CRUD | ✅ Stub | Array of Playbook | Points working |
| Jobs | Card component | ✅ | JobPosting object | Real API ready |
| Components | SignalCard | ✅ | Props-driven | Reusable |
| Components | InsightCards | ✅ | Array of Insight | AI-generated |

**Last Verified**: March 7, 2026
