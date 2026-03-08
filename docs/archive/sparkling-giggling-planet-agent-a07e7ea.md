# Workforce Pulse - Service Layer Plan

## Overview
Create 14 files across two new subdirectories inside src/services/:
  src/services/stubs/ with 7 stub data files
  src/services/api/ with 6 API wrapper files
  src/services/index.ts barrel re-export

Types: src/services/types/index.ts already exists.

## Stub Data Design

### pulse.stub.ts
stubAlerts (3): critical/watch/stable severity, varied messages, cta on first two
stubPulseSummary: date 2026-03-05, criticalRolesCount 47, trainingNeedsCount 312
  fastestRisingSkills: [Cloud Infrastructure, Cybersecurity, Data Analysis, Emergency Response]
  overallStatus watch, checkInStreak 7, checkInCompleted false

### sectors.stub.ts (8 sectors)
public-safety: score 34, critical, 48200 emp, 312 open
healthcare:     score 52, watch,    124500 emp, 589 open
technology:     score 78, stable,   89300 emp,  203 open
construction:   score 45, watch,    67100 emp,  441 open
education:      score 61, stable,   95400 emp,  178 open
logistics:      score 38, critical, 73800 emp,  527 open
finance:        score 71, stable,   55600 emp,  134 open
retail:         score 49, watch,    102300 emp, 365 open

### sector-detail.stub.ts
Keys: public-safety, healthcare, technology
Each: hiringTrend 12 months, 3 criticalRoles, 5 skills, 2 missions, 2 playbooks

### skills.stub.ts (20 skills)
Categories: Cloud Infrastructure(3), Data Science(3), Leadership(2),
Safety Compliance(3), Software Development(3), Operations(3), Healthcare(3)
demandLevel: ~6 critical, ~8 watch, ~6 stable
Each: 7-pt sparkline, 1-3 relatedRoles, 1-2 trainingResources

### roles.stub.ts (15 roles, ~2 per sector)
urgency: critical(5), watch(6), stable(4)
avgTimeToFill: 18-90 days

### missions.stub.ts (8 missions)
status: active(5), completed(2), paused(1)
priority: critical(2), watch(4), stable(2)
3-4 steps each with mix of completed/incomplete, 2-3 impactMetrics

### playbooks.stub.ts (10 playbooks)
Covers all 8 sectors, 3-4 steps each, likes 8-142, saves 3-67

## API Layer Design

### api/pulse.ts
fetchAlerts: stub -> stubAlerts, real -> GET API/alerts
fetchPulseSummary: stub -> stubPulseSummary, real -> GET API/pulse/summary
submitDailyCheckIn: stub -> incremented streak, real -> POST API/pulse/check-in

### api/sectors.ts
fetchSectors: stub -> stubSectors
fetchSectorById: stub -> stubSectorDetails[id] or fallback SectorDetail with empty arrays

### api/skills.ts
SkillFilters: category?, status? (PulseStatus), search?
fetchSkills: client-side filter on stubSkills
fetchSkillById: find by id

### api/roles.ts
fetchRoles: all stubRoles
fetchRolesBySector: filter by sectorId

### api/missions.ts
fetchMissions, fetchMissionById, updateMissionStep (mutates stub, recalcs progress)

### api/playbooks.ts
fetchPlaybooks, createPlaybook (id=playbook-Date.now()), likePlaybook (toggle), savePlaybook (toggle)

## Execution Order
1. stubs/pulse.stub.ts
2. stubs/skills.stub.ts
3. stubs/roles.stub.ts
4. stubs/missions.stub.ts
5. stubs/playbooks.stub.ts
6. stubs/sectors.stub.ts
7. stubs/sector-detail.stub.ts
8. api/pulse.ts
9. api/sectors.ts
10. api/skills.ts
11. api/roles.ts
12. api/missions.ts
13. api/playbooks.ts
14. index.ts