# Workforce Pulse — Implementation Plan

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript, `src/` dir)
- **Styling**: Tailwind CSS + shadcn/ui (slate base, CSS variables)
- **Data fetching**: TanStack Query v5 (chosen over SWR for `useMutation` + invalidation)
- **Charts**: Recharts (wrapped in `"use client"` to avoid SSR issues)
- **Data layer**: Typed service layer with `NEXT_PUBLIC_USE_STUBS=true` env flag — swap to real REST API by setting `NEXT_PUBLIC_API_URL` + flipping flag, zero code changes needed
- **Icons**: lucide-react

---

## Pages to Build (all 7)
1. `01` — Daily Pulse (home/dashboard)
2. `02` — Sectors Index
3. `03` — Sector Detail
4. `04` — Skills Explorer
5. `05` — Missions list + `05a` Mission Detail
6. `06` — Playbooks feed + Create Playbook dialog
7. `00` — App Shell (TopNav + SideNav wrapping all pages)

---

## Phase 1 — Bootstrap & Config

### Step 1 — Scaffold
```bash
npx create-next-app@14 . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --no-git
```

### Step 2 — Install dependencies
```bash
npm install @tanstack/react-query@^5 @tanstack/react-query-devtools@^5 recharts class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot
```

### Step 3 — Init shadcn/ui
```bash
npx shadcn@latest init   # style=default, color=slate, CSS vars=yes
```

### Step 4 — Add shadcn components
```bash
npx shadcn@latest add card badge button input select progress tabs dialog sheet skeleton separator scroll-area dropdown-menu avatar tooltip command popover label textarea alert checkbox
```

### Step 5 — Extend `tailwind.config.ts`
Add semantic color aliases and safelist for dynamically constructed class names:
```ts
theme.extend.colors.pulse = {
  critical: 'hsl(var(--destructive))',
  watch: '#f59e0b',
  stable: '#22c55e',
}
safelist: [
  'text-pulse-critical','text-pulse-watch','text-pulse-stable',
  'bg-red-100','border-red-300','border-t-red-500','border-l-red-500',
  'bg-amber-100','border-amber-300','border-t-amber-500','border-l-amber-500',
  'bg-green-100','border-green-300','border-t-green-500','border-l-green-500',
]
```

### Step 6 — `.env.local`
```
NEXT_PUBLIC_USE_STUBS=true
NEXT_PUBLIC_API_URL=
```

---

## Phase 2 — Service Layer

### Directory: `src/services/`
```
types/index.ts          # all TypeScript interfaces (written first, everything depends on this)
stubs/                  # plain typed arrays, no async
  pulse.stub.ts
  sectors.stub.ts
  sector-detail.stub.ts
  skills.stub.ts
  roles.stub.ts
  missions.stub.ts
  playbooks.stub.ts
api/                    # async functions with USE_STUBS branch
  pulse.ts | sectors.ts | skills.ts | roles.ts | missions.ts | playbooks.ts
index.ts                # barrel re-export
```

### Key types (all in `types/index.ts`)
`PulseStatus = 'critical' | 'watch' | 'stable'`
Interfaces: `AlertBanner`, `PulseSummary`, `Sector`, `SectorDetail`, `Skill`, `Role`, `Mission`, `MissionStep`, `Playbook`, `CreatePlaybookPayload`

### Service pattern (all 6 API files follow this)
```ts
const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === 'true'
const API = process.env.NEXT_PUBLIC_API_URL ?? ''

export async function fetchSectors(): Promise<Sector[]> {
  if (USE_STUBS) return stubSectors
  const res = await fetch(`${API}/sectors`)
  if (!res.ok) throw new Error('...')
  return res.json()
}
```

---

## Phase 3 — Global Lib & Hooks

### `src/lib/utils.ts` — extend with:
- `formatDelta(delta: number): string`
- `statusToColor(status): string` — returns Tailwind text class
- `statusToBgColor(status): string` — returns Tailwind bg+border classes

### `src/lib/constants.ts`
- `NAV_ITEMS` — array of `{ label, href, icon }` for SideNav
- `SECTOR_CATEGORIES`, `SKILL_CATEGORIES`, `PULSE_RING_SIZE`

### `src/lib/query-client.tsx` — `"use client"`
TanStack `QueryClientProvider` wrapper used in `src/app/layout.tsx`.
Default options: `staleTime: 60s`, `gcTime: 5min`, `retry: 1`.

### `src/hooks/` — one file per domain
- `use-pulse.ts` — `useAlerts()`, `usePulseSummary()`, `useCheckIn()` mutation
- `use-sectors.ts` — `useSectors()`, `useSector(id)`
- `use-skills.ts` — `useSkills(filters?)`, `useSkill(id)` with `enabled: !!id`
- `use-roles.ts` — `useRoles()`, `useRolesBySector(sectorId)`
- `use-missions.ts` — `useMissions()`, `useMission(id)`, `useUpdateMissionStep()` mutation
- `use-playbooks.ts` — `usePlaybooks()`, `useCreatePlaybook()` mutation (optimistic), `useLikePlaybook()`, `useSavePlaybook()`

---

## Phase 4 — Reusable Components

### `src/components/shared/`
| Component | Notes |
|---|---|
| `pulse-ring.tsx` | Custom SVG; `strokeDasharray/strokeDashoffset` for arc; sizes: sm/md/lg |
| `sparkline.tsx` | Custom SVG `<polyline>`; optional filled area; zero dependencies |
| `kpi-chip.tsx` | shadcn `Badge` + lucide delta arrow; compact inline |
| `kpi-tile.tsx` | shadcn `Card` + `border-t-4` status color bar; prominent metric |
| `skill-chip.tsx` | shadcn `Badge`; status-colored; selected ring state |
| `alert-banner.tsx` | shadcn `Alert` base; dismissible X button; stacks multiple alerts |
| `mission-row.tsx` | Horizontal row; `border-l-4` priority color; shadcn `Progress` |
| `mission-card.tsx` | Expanded card for detail page; impact sparklines |
| `playbook-card.tsx` | shadcn `Card`; author `Avatar`; tag chips; like/save action bar |
| `filter-bar.tsx` | Scrollable chip filters + optional search `Input` |
| `empty-state.tsx` | Centered; muted icon; optional action `Button` |
| `loading-skeleton.tsx` | Named exports: `SectorCardSkeleton`, `MissionRowSkeleton`, `PlaybookCardSkeleton`, `KpiTileSkeleton`, `SkillListSkeleton` |

### `src/components/layout/`
- `top-nav.tsx` — Logo + Command search dialog + city Select + profile DropdownMenu + mobile Sheet trigger
- `side-nav.tsx` — `usePathname()` for active state; `NAV_ITEMS` mapped to Links with lucide icons

---

## Phase 5 — App Shell & Routing

### Route structure
```
src/app/
  layout.tsx                    # root: Inter font, QueryProvider
  page.tsx                      # redirect('/dashboard')
  (dashboard)/
    layout.tsx                  # App Shell: TopNav + SideNav + <main>
    dashboard/page.tsx          # Daily Pulse
    sectors/page.tsx            # Sectors Index
    sectors/[id]/page.tsx       # Sector Detail
    skills/page.tsx             # Skills Explorer
    missions/page.tsx           # Missions list
    missions/[id]/page.tsx      # Mission Detail
    playbooks/page.tsx          # Playbooks feed
```

### `(dashboard)/layout.tsx` shell structure
```tsx
<div className="min-h-screen flex flex-col">
  <TopNav />
  <div className="flex flex-1 overflow-hidden">
    <aside className="hidden md:flex w-56 flex-col border-r shrink-0">
      <SideNav />
    </aside>
    <main className="flex-1 overflow-y-auto p-6">{children}</main>
  </div>
</div>
```

---

## Phase 6 — Pages

### Daily Pulse (`/dashboard`)
- Alert Banner (conditional, full width)
- 3 x `KpiTile`: Critical Roles / Fastest-Rising Skills / Training Needs
- Sector Pulse strip: horizontally scrollable compact sector cards with `PulseRing` + sparkline
- Check-in card (`_components/check-in-card.tsx`, `"use client"`): streak counter + `useCheckIn()` mutation button
- Data: `useAlerts()`, `usePulseSummary()`, `useSectors()`

### Sectors Index (`/sectors`)
- `FilterBar` (category + search)
- Responsive grid (1→2→3→4 cols); each cell = `SectorCard` with `PulseRing`, 4 `KpiChip`, `Sparkline`
- Data: `useSectors()`

### Sector Detail (`/sectors/[id]`)
- Header: `PulseRing` (lg) + name + status + description
- 4 `KpiChip` row
- shadcn `Tabs`: Overview (Recharts `AreaChart` hiring trend) | Critical Roles | Skills | Missions | Playbooks
- Recharts in `_components/hiring-trend-chart.tsx` (`"use client"`)
- Data: `useSector(id)`

### Skills Explorer (`/skills`)
- Two-panel: left = filtered skill list in `ScrollArea`; right = `SkillDetailPanel` (or `EmptyState`)
- Selection state: `useState<string | null>` in page
- Data: `useSkills(filters)`, `useSkill(selectedId)` with `enabled: !!selectedId`

### Missions (`/missions` + `/missions/[id]`)
- List: `FilterBar` (status) + `Select` (priority) + `MissionRow` list
- Detail: header + shadcn `Tabs` (Overview | Steps | Impact)
- Steps tab: `step-checkbox.tsx` (`"use client"`) calls `useUpdateMissionStep()` mutation
- Data: `useMissions()`, `useMission(id)`

### Playbooks (`/playbooks`)
- Header with [Create Playbook] button
- `FilterBar` (sector)
- Responsive grid of `PlaybookCard`
- `CreatePlaybookDialog` (`"use client"`): 2-step form (metadata → steps array), calls `useCreatePlaybook()`, closes + invalidates on success
- Data: `usePlaybooks()`, `useCreatePlaybook()`, `useLikePlaybook()`, `useSavePlaybook()`

---

## Phase 7 — Loading / Error States

Each route segment gets:
- `loading.tsx` — renders the matching named skeleton from `loading-skeleton.tsx`
- `error.tsx` — `"use client"`; renders `EmptyState` with `reset()` retry button

---

## Complete File Tree (critical files bolded)

```
src/
  app/
    globals.css
    layout.tsx
    page.tsx                               # root redirect
    (dashboard)/
      layout.tsx                           # *** App Shell ***
      dashboard/
        page.tsx  loading.tsx  error.tsx
        _components/check-in-card.tsx
      sectors/
        page.tsx  loading.tsx  error.tsx
        _components/sector-card.tsx
        [id]/
          page.tsx  loading.tsx  error.tsx
          _components/hiring-trend-chart.tsx
      skills/
        page.tsx  loading.tsx  error.tsx
        _components/skill-row.tsx  skill-detail-panel.tsx
      missions/
        page.tsx  loading.tsx  error.tsx
        [id]/
          page.tsx  loading.tsx  error.tsx
          _components/step-checkbox.tsx
      playbooks/
        page.tsx  loading.tsx  error.tsx
        _components/create-playbook-dialog.tsx
  components/
    layout/top-nav.tsx  side-nav.tsx
    shared/
      pulse-ring.tsx  sparkline.tsx  kpi-chip.tsx  kpi-tile.tsx
      skill-chip.tsx  alert-banner.tsx  mission-row.tsx  mission-card.tsx
      playbook-card.tsx  filter-bar.tsx  empty-state.tsx  loading-skeleton.tsx
    ui/  (shadcn generated)
  hooks/
    use-pulse.ts  use-sectors.ts  use-skills.ts
    use-roles.ts  use-missions.ts  use-playbooks.ts
  lib/
    utils.ts  constants.ts  query-client.tsx
  services/
    types/index.ts                         # *** Written first — everything depends on this ***
    stubs/  (7 stub files)
    api/    (6 API service files)
    index.ts
tailwind.config.ts  tsconfig.json  components.json  .env.local
```

---

## Verification

1. `npm run dev` — app loads at `localhost:3000`, redirects to `/dashboard`
2. All 7 pages accessible via SideNav with no console errors
3. `PulseRing` renders correct arc angle for score values (0, 50, 78, 100)
4. `Sparkline` renders correctly for ascending, descending, and flat data
5. Sector Detail tab switching works; Recharts chart renders without SSR error
6. Mission step checkbox triggers mutation + optimistic UI update
7. Create Playbook form completes both steps and closes dialog; new card appears in feed
8. Mobile: SideNav hidden, Sheet opens on hamburger tap; filter bar scrolls horizontally
9. `NEXT_PUBLIC_USE_STUBS=false` + valid `NEXT_PUBLIC_API_URL` → hooks call real endpoints
