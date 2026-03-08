# Integration Status & Quick Reference

**Analysis Date**: March 7, 2026

---

## 🎯 INTEGRATION CHECKLIST

### ✅ FULLY INTEGRATED

#### 1. Job Scraping Pipeline
- [x] Bright Data Scraping Browser integration
- [x] POST `/api/jobs/scrape` endpoint (60-90 sec runtime)
- [x] Parse + classify job postings by sector
- [x] Store in MongoDB
- [x] Cache insights in memory
- [x] Frontend UI: `LiveScrape` component with progress indicator
- [x] Manual trigger + auto-refresh on completion

**Location**: `backend/src/controllers/jobController.js` + `src/components/dashboard/live-scrape.tsx`

#### 2. Sector Enrichment with Job Data
- [x] Base sectors from stubs
- [x] Fetch job breakdown from `/api/jobs`
- [x] Calculate pulseScore (logarithmic scale based on job count)
- [x] Auto-determine status: critical (16+) → watch (6-15) → stable (1-5)
- [x] Update openRolesCount
- [x] Used in: Dashboard KPI cards, Sector pages

**Location**: `src/services/api/sectors.ts` → `enrichSectorsWithJobData()`

#### 3. Mission Management (Stubs)
- [x] Create missions with custom title/description/steps
- [x] Toggle mission step completion
- [x] Auto-calculate progress (completed steps / total steps)
- [x] Award points on step completion + completion bonus
- [x] Manage mission status: active → completed
- [x] Track participant count + community impact
- [x] UI: Full CRUD dialog + step checklist

**Location**: `src/services/api/missions.ts` + `src/app/(app)/missions/page.tsx`

#### 4. Playbook Management (Stubs)
- [x] Create playbooks with custom steps/tags
- [x] Auto-determine difficulty from step count
- [x] Like/Save functionality with persistence
- [x] Award points on creation
- [x] Display effectiveness stars (formula: likes*2 + saves*3)
- [x] UI: Grid view + detail cards

**Location**: `src/services/api/playbooks.ts` + `src/app/(app)/playbooks/page.tsx`

#### 5. Gamification System
- [x] Points tracking by domain: missions, skills, sectors, playbooks
- [x] Level progression with next level milestone
- [x] Daily check-in streak counter
- [x] Badge system (earned on achievements)
- [x] Points decay on mission uncomplete
- [x] Streak maintained across sessions
- [x] UI: Profile card + mission/badge displays

**Location**: `src/services/api/community-profile.ts`

#### 6. Dashboard (Both Roles)
- [x] Admin view: System health KPIs, sector status, critical needs
- [x] Citizen view: Personal points, missions, jobs, badges
- [x] CityProfile hero: 911 calls, permits, open jobs ring metrics
- [x] Quick actions navigation
- [x] Live job scrape trigger
- [x] Job data status display

**Location**: `src/app/(app)/dashboard/page.tsx` + `src/components/dashboard/`

#### 7. Real-Time Job Feed
- [x] CitizenDashboard: Featured jobs list (first 6)
- [x] Next deadline job highlighted
- [x] Department frequency analysis
- [x] Live refresh after scrape
- [x] Manual job fetch on dashboard load

**Location**: `src/components/dashboard/citizen-dashboard.tsx`

#### 8. Reusable Components
- [x] DashboardSignalCard: Tone-based styling, flexible layout
- [x] InsightCards: Icon mapping, staggered animation, CTA
- [x] JobCard: Sector coloring, urgency ring, salary display
- [x] SkillCard: Sparkline, demand badge, related roles
- [x] MissionCard: Progress bar, steps, rewards
- [x] PlaybookCard: Difficulty, effectiveness stars, author

**Location**: `src/components/dashboard/` + `src/components/jobs/`

---

### ⚠️ PARTIALLY INTEGRATED

#### 1. Skill Demand from Jobs
**Status**: Extraction done, but not connected to UI

- [x] JobPosting.extractedSkills populated by backend
- [ ] Aggregated by skill name
- [ ] Trend analysis (7-day history)
- [ ] Connected to Skill.demandLevel
- [ ] Updated Skill.sparklineData

**Work Needed**: API endpoint to aggregate skills from jobs, feed into Skill queries

**Files**:
- `src/app/(app)/skills/page.tsx` - Fetch logic
- `src/services/api/skills.ts` - Service layer
- `backend/src/controllers/skillController.js` - Backend

#### 2. Job Display on Skills Page
**Status**: Page exists, but no job-to-skill mapping

- [x] Skill page displays skills grid
- [ ] Click skill → show related jobs
- [ ] Filter jobs by related sectors
- [ ] Show training resources for skill

**Work Needed**: Add job query filtered by extractedSkills

#### 3. CityProfile Job Metric Sync
**Status**: Shows static count, not real-time synced

- [x] Displays job ring with count
- [ ] Auto-update after scrape completes
- [ ] Real-time sync indicator
- [ ] Last updated timestamp

**Work Needed**: Add cache invalidation on scrape completion

---

### ❌ NOT INTEGRATED

#### 1. Chat / Messaging System
**Status**: No components or API endpoints

**Needed**:
- Message component with timestamp, avatar, text
- Chat window / conversation list
- WebSocket or polling for live updates
- Backend message store (MongoDB)
- Integration with mission collaborators

**Estimated Effort**: 8-12 hours

---

#### 2. Job Application Tracking
**Status**: No storage or UI

**Needed**:
- User application store (MongoDB schema)
- Track applied jobs + status (applied, followed up, rejected, offered)
- Display on profile / settings
- Analytics (application rate, success %)
- Link to job postings

**Estimated Effort**: 6-8 hours

#### 3. Playbook Recommendations from Jobs
**Status**: No logic

**Needed**:
- When viewing job → extract required skills
- Match skills to playbooks
- Display "Learn these skills first" suggestions
- Rank playbooks by relevance

**Estimated Effort**: 4-6 hours

#### 4. Skills Gap Analysis
**Status**: No model

**Needed**:
- Compare user's completed skills to job requirements
- Identify gaps
- Rankings gaps by urgency (critical roles)
- Suggest missions/playbooks to fill gaps

**Estimated Effort**: 6-8 hours

#### 5. Predictive Hiring Trends
**Status**: No ML model

**Needed**:
- Historical hiring data aggregation
- Trend forecasting (which sectors heating up)
- Alert generation ("Healthcare hiring increasing")
- Recommended skill focus

**Estimated Effort**: 10-14 hours

---

## 📋 DATA SCHEMAS

### Sector (Base)
```typescript
{
  id: "public-safety",
  name: "Public Safety",
  pulseScore: 72,          // 0-100
  status: "critical",       // calculated from score
  openRolesCount: 247,      // from job count
  employeeCount: 1200,
  description: "Police, Fire, Emergency...",
  kpis: [
    { label: "Avg Time to Fill", value: "45 days", delta: -5, status: "stable" },
    { label: "Retention Rate", value: "87%", delta: 3, status: "stable" }
  ],
  sparklineData: [220, 225, 232, 245, 251, 247, 251]  // 7 days
}
```

### Skill  
```typescript
{
  id: "skill-cdl",
  name: "Commercial Driver License",
  category: "Safety Compliance",
  demandLevel: "critical",  // determined by job frequency
  growthRate: 15.2,         // % change week-over-week
  sparklineData: [80, 85, 92, 98, 105, 108, 112],  // mentions/day
  relatedRoles: ["role-truck-driver", "role-delivery"],
  trainingResources: [
    {
      title: "CDL Training Course (Class A)",
      url: "https://...",
      provider: "AARP"
    }
  ]
}
```

### Mission
```typescript
{
  id: "mission-1709848236000",
  title: "Reduce hiring timeline for nurses",
  description: "Streamline RN onboarding process",
  status: "active",           // active | completed | paused
  priority: "critical",       // affects reward
  progress: 85,               // auto-calc from steps
  sectorId: "healthcare",
  steps: [
    {
      id: "step-1",
      order: 1,
      title: "Interview 5 department heads",
      description: "Identify bottlenecks in current process",
      completed: true,
      dueDate: "2026-03-10"
    },
    {
      id: "step-2",
      order: 2,
      title: "Design new workflow",
      completed: true,
      dueDate: "2026-03-15"
    },
    {
      id: "step-3",
      order: 3,
      title: "Train HR team on new process",
      completed: false,
      dueDate: "2026-03-20"
    }
  ],
  rewardPoints: 220,          // 180 (priority) + 10*steps
  participantCount: 12,
  communityImpact: "Estimated 25-day reduction per hire",
  tags: ["Critical", "Healthcare", "Process"],
  dueDate: "2026-03-20",
  assignee: "John Doe"
}
```

### Playbook
```typescript
{
  id: "playbook-1709848236000",
  title: "Nursing Onboarding ",
  summary: "Step-by-step guide to onboard new RN staff",
  authorName: "Jane Doe",
  authorAvatar: "/avatars/jane.jpg",
  sectorId: "healthcare",
  tags: ["Onboarding", "Nursing", "Training"],
  difficulty: "operator",  // auto from step count
  steps: [
    { order: 1, instruction: "Complete orientation day with HR" },
    { order: 2, instruction: "Meet with nursing supervisor" },
    { order: 3, instruction: "Shadowing shift with experienced RN" },
    { order: 4, instruction: "First independent shift with support" },
    { order: 5, instruction: "Full independent practice" }
  ],
  likes: 156,
  saves: 42,
  createdAt: "2026-03-01T14:22:00Z",
  rewardPoints: 28,           // 18 + 2*steps
  estimatedHours: 10,         // max(4, steps*2)
  impactSummary: "Reduces onboarding time by 40%",
  linkedSkills: ["Nursing", "Training", "Communication"],
  hasLiked: false,            // user state
  hasSaved: true
}
```

### Job Posting (From Bright Data)
```typescript
{
  id: "job-indeed-123456",
  title: "RN - Emergency Department",
  org: "Montgomery Hospital",
  location: "Montgomery, AL",
  salary: "$62,000 - $75,000",
  description: "Seeking experienced RN for ED...",
  source: "indeed",
  url: "https://indeed.com/...",
  sectorId: "healthcare",            // auto-classified by ML
  extractedSkills: ["nursing", "cpn", "emergency_response", "teamwork"],
  postedDate: "2026-03-05T08:00:00Z",
  jobType: "Full-time",
  employmentType: "Direct Hire"
}
```

### Mission Member Profile (Gamification)
```typescript
{
  id: "profile-user-123",
  name: "Sarah Chen",
  role: "citizen",
  city: "Montgomery, AL",
  level: 5,
  points: 2850,               // aggregate of all domains
  nextLevelPoints: 3190,      // threshold for level 6
  streak: 7,                  // daily check-in days
  missionPoints: 1200,        // from mission completions
  skillPoints: 850,           // from skill tracking
  sectorPoints: 600,          // from sector engagement
  playbookPoints: 200,        // from playbook creation
  completedMissionCount: 8,
  activeMissionCount: 3,
  contributedSteps: 24,
  helpedWorkers: 5,
  playbooksCreated: 2,
  playbooksLiked: 156,
  playbooksSaved: 42,
  skillActionsCompleted: 18,
  sectorActionsCompleted: 12,
  badges: [
    {
      id: "badge-early-adopter",
      label: "Early Adopter",
      description: "Joined Workforce Pulse in first week"
    },
    {
      id: "badge-mission-master",
      label: "Mission Master",
      description: "Completed 8+ community missions"
    }
  ]
}
```

---

## 🔗 API ENDPOINT SUMMARY

### Job APIs
```
GET  /api/jobs
     Returns: { count, insights, sources }
     
POST /api/jobs/scrape
     Payload: { queries?: Array<{keyword, location}> }
     Returns: { jobs, totalStored, insights, durationMs }
     <Runs 60-90 seconds>
     
POST /api/jobs/aggregate
     Payload: { includeIndeed: bool }
     Returns: { totalStored, totalNew, sources, insights }
```

### Sector APIs
```
GET  /api/sectors
     Returns: Sector[]
     <Enriched with job data>

GET  /api/sectors/:id
     Returns: SectorDetail (extended with hiring trends)
```

### Skill APIs
```
GET  /api/skills?category=X&status=Y&search=Z
     Returns: Skill[]

GET  /api/skills/:id
     Returns: Skill
```

### Mission APIs
```
GET  /api/missions
     Returns: Mission[]

GET  /api/missions/:id
     Returns: Mission

POST /api/missions
     Payload: CreateMissionPayload
     Returns: Mission (persisted)

PATCH /api/missions/:id/steps/:stepId
     Payload: { completed: bool }
     Returns: Mission (updated)
```

### Playbook APIs
```
GET  /api/playbooks
     Returns: Playbook[]

GET  /api/playbooks/:id
     Returns: Playbook

POST /api/playbooks
     Payload: CreatePlaybookPayload
     Returns: Playbook (persisted)

POST /api/playbooks/:id/like
     Returns: { likes: number }

POST /api/playbooks/:id/save
     Returns: { saves: number }
```

### Profile APIs
```
GET  /api/missions/profile
     Returns: MissionMemberProfile

POST /api/missions/daily-check-in
     Returns: { streak, checkInCompleted }
```

---

## 🚀 PRIORITY ROADMAP

### Phase 1: Skills Intelligence (2-3 days)
1. **Extract skills from jobs**
   - Parse JobPosting.extractedSkills
   - Aggregate by skill, calculate frequency
   - Update Skill.demandLevel based on frequency
   - Create `/api/skills/aggregate` endpoint

2. **Update skill page**
   - Show trending skills
   - Display job count for each skill
   - Link to related jobs

3. **Sector skill mapping**
   - Show top skills for each sector
   - Update sector KPIs with skill demand

**Files to modify**:
- `backend/src/controllers/skillController.js`
- `src/services/api/skills.ts`
- `src/app/(app)/skills/page.tsx`

---

### Phase 2: Job Recommendations (2-3 days)
1. **Skill-to-playbook matching**
   - When viewing job → extract skills
   - Match to playbooks with linkedSkills
   - Rank by relevance

2. **Playbook recommendations from jobs**
   - Add "Learn these skills first" section
   - Link to playbooks

3. **Skills gap analysis**
   - Compare user profile to job requirements
   - Suggest missions/playbooks to fill gaps

**Files to modify**:
- `src/components/jobs/job-card.tsx`
- `src/app/(app)/skills/page.tsx`
- New: `src/lib/skill-matching.ts`

---

### Phase 3: Application Tracking (2-3 days)
1. **Schema: UserApplication**
   ```typescript
   {
     userId: string
     jobId: string
     appliedAt: Date
     status: "applied" | "interviewed" | "offered" | "rejected"
     notes: string
   }
   ```

2. **Backend endpoints**
   - `POST /api/applications` - Apply
   - `GET /api/applications` - User's applications
   - `PATCH /api/applications/:id` - Update status

3. **UI: Application history**
   - My Applications tab on jobs page
   - Status indicators + timeline

**Files to create**:
- `backend/src/models/UserApplication.js`
- `backend/src/routes/applicationRoutes.js`
- `src/services/api/applications.ts`
- `src/app/(app)/jobs/applications.tsx`

---

### Phase 4: Messaging (3-4 days)
1. **Schema: Message**
   ```typescript
   {
     conversationId: string
     senderId: string
     senderName: string
     text: string
     createdAt: Date
   }
   ```

2. **WebSocket setup** (or polling fallback)
   - Connect on component mount
   - Listen for new messages
   - Broadcast on message send

3. **UI: Chat window**
   - Conversation list
   - Message thread
   - Input + send button

**Files to create**:
- `backend/src/models/Message.js`
- `backend/src/websocket.js`
- `src/components/chat/chat-window.tsx`
- `src/services/api/messages.ts`

---

### Phase 5: Analytics Dashboard (4-5 days)
1. **Aggregate stats**
   - Hiring trends by sector
   - Skill demand velocity
   - Application pipeline metrics
   - User engagement

2. **Predictive insights**
   - Which sectors heating up
   - Recommended skill focus
   - Alert on demand spikes

3. **Admin dashboard**
   - System health over time
   - Sector trend charts
   - Skills gap matrix

---

## 📊 QUICK FACTS

| Metric | Value |
|--------|-------|
| Total Pages | 4 (Dashboard, Skills, Missions, Playbooks) |
| Reusable Components | 8+ (SignalCard, InsightCards, JobCard, etc.) |
| Services | 8 (jobs, sectors, skills, missions, playbooks, pulse, workforce, benefits) |
| Stub Data Sets | 5 (sectors, skills, missions, playbooks, roles) |
| TypeScript Interfaces | 20+ (Sector, Skill, Mission, Playbook, Job, etc.) |
| API Routes | 15+ (GET/POST/PATCH endpoints) |
| React Query Keys | 12+ (sectors, skills, missions, jobs, profile, etc.) |
| Gamification Systems | Points + Streaks + Badges |
| Job Sources Supported | 5 (JobAps RSS, USAJOBS, Indeed, LinkedIn, Glassdoor) |
| External APIs | Bright Data + ArcGIS |

---

## 🔐 Environment Setup

```bash
# .env.local (Frontend)
NEXT_PUBLIC_USE_STUBS=false              # Toggle stubs on/off
NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_ARCGIS_911_URL=https://arcgis...
NEXT_PUBLIC_ARCGIS_PERMITS_URL=https://arcgis...

# Backend .env
MONGODB_URI=mongodb://...
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_ZONE=...

PORT=3001
NODE_ENV=development
```

---

## ✅ VERIFICATION CHECKLIST

When integrating new features:

- [ ] All TypeScript types defined in `src/services/types/index.ts`
- [ ] Service layer created in `src/services/api/`
- [ ] Stubs provided in `src/services/stubs/`
- [ ] Backend endpoints exist in `backend/src/routes/`
- [ ] React Query hook usage with proper cache keys
- [ ] Error boundaries + loading states
- [ ] Accessibility: alt text, aria labels, semantic HTML
- [ ] Mobile responsive (Tailwind grid)
- [ ] Dark mode support
- [ ] Animation: fade-in, stagger where appropriate
- [ ] Documentation updated

