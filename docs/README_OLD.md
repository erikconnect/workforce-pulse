# 📚 WORKFORCE PULSE — DOCUMENTATION HUB

**Project**: Workforce Pulse - Civic Intelligence Dashboard  
**Last Updated**: March 7, 2026  
**Version**: 3.0 - Organized Structure

> **Quick Start**: New to the project? Read [Setup Guide](getting-started/setup.md) → [Architecture Overview](architecture/overview.md) → Start coding!

---

## 🎯 DOCUMENTATION BY ROLE

### 👨‍💻 **Frontend Developers**
**Start here**: [Code Recipes](development/code-recipes.md)  
**Then read**:
- [Architecture Overview](architecture/overview.md) - Component inventory & props
- [Architecture Diagrams](architecture/diagrams.md) - Data flow & patterns
- [API Reference](development/api-reference.md) - API contracts & endpoints

**Time to productivity**: ~45 minutes

### 🔧 **Backend Developers**  
**Start here**: [Backend README](../backend/README.md)  
**Then read**:
- [API Reference](development/api-reference.md) - API specification
- [Data Sources](architecture/data-sources.md) - External integrations
- [Bright Data Integration](integrations/brightdata-crawl-api.md)

**Time to productivity**: ~30 minutes

### 🎨 **Full-Stack / Team Leads**
**Start here**: [Project Vision](archive/full-idea-project.txt) - Vision & goals  
**Then read**:
- [Integration Status](development/integration-status.md) - What's done vs todo
- [Architecture Overview](architecture/overview.md) - Architecture
- [Design System](architecture/design-system.md) - Design system

**Time to productivity**: ~60 minutes

### 📊 **Project Managers / Stakeholders**
**Start here**: [Project Vision](archive/full-idea-project.txt)  
**Then read**:
- [Integration Status](development/integration-status.md) - Progress tracking
- [Data Sources](architecture/data-sources.md) - Data sources

**Time to productivity**: ~20 minutes

---

## 📂 DOCUMENTATION CATALOG

### 🚀 Getting Started

| File | Description | When to Use |
|------|-------------|-------------|
| [Setup Guide](getting-started/setup.md) | Environment setup, installation | First day |
| [Quick Reference](getting-started/quick-reference.md) | Developer cheat sheet | While coding |
| [Agents Guide](getting-started/agents.md) | AI agent usage | Accelerate development |

### 🏗️ Architecture & Design

| File | Description | When to Use |
|------|-------------|-------------|
| [Overview](architecture/overview.md) | High-level architecture, page layouts | Understanding system |
| [Diagrams](architecture/diagrams.md) | Detailed diagrams, dependencies | Deep implementation |
| [Design System](architecture/design-system.md) | Design system, UI guidelines | Building UI |
| [Data Sources](architecture/data-sources.md) | External API integrations | Working with data |

### 💻 Development

| File | Description | When to Use |
|------|-------------|-------------|
| [Code Recipes](development/code-recipes.md) | Copy-paste code patterns | Implementing features |
| [API Reference](development/api-reference.md) | API endpoints & contracts | API integration |
| [Integration Status](development/integration-status.md) | Feature checklist, roadmap | Planning sprints |

### � Integrations

| File | Description | When to Use |
|------|-------------|-------------|
| [Bright Data Crawl API](integrations/brightdata-crawl-api.md) | Bright Data setup | Job scraping features |
| [Claims Validation](integrations/claims-validation.md) | Validation rules | Understanding business logic |
| [Application Claims Evaluator](integrations/application-claims-evaluator.md) | Claims processing | Working with applications |

### � Deployment

| File | Description | When to Use |
|------|-------------|-------------|
| [Vercel Setup](deployment/vercel-setup.md) | Deployment configuration | Before deploying |

---

## 🗺️ ONBOARDING PATHS

### 🎯 Path 1: Quick Start (30 min)
**Goal**: Get the app running locally
1. Read [Setup Guide](getting-started/setup.md) (10 min)
2. Follow installation steps
3. Run `npm run dev`
4. Explore the dashboard at localhost:3000

### 🧭 Path 2: Frontend Developer (2 hours)
**Goal**: Build your first feature
1. Complete Quick Start
2. Read [Architecture Overview](architecture/overview.md) (30 min)
3. Read [Code Recipes](development/code-recipes.md) (20 min)
4. Skim [Integration Status](development/integration-status.md) (10 min)
5. Pick a feature from "Not Started" section and implement it

### 🔧 Path 3: Backend Developer (1.5 hours)
**Goal**: Understand the API layer
1. Complete Quick Start
2. Read [Backend README](../backend/README.md) (20 min)
3. Read [API Reference](development/api-reference.md) (30 min)
4. Read [Data Sources](architecture/data-sources.md) (20 min)
5. Test API endpoints with Postman/Thunder Client

### 🏗️ Path 4: Full System Understanding (4 hours)
**Goal**: Master the entire codebase
1. Complete Quick Start
2. Read [Project Vision](archive/full-idea-project.txt) (20 min)
3. Read [Architecture Overview](architecture/overview.md) (40 min)
4. Read [Architecture Diagrams](architecture/diagrams.md) (60 min)
5. Read [Integration Status](development/integration-status.md) (30 min)
6. Explore codebase hands-on (90 min)

---

## 🔍 QUICK REFERENCE

### Common Tasks

| Task | Documentation |
|------|---------------|
| Add a new page | [Code Recipes](development/code-recipes.md) Recipe #1 |
| Create API endpoint | [API Reference](development/api-reference.md) + [Code Recipes](development/code-recipes.md) |
| Style a component | [Design System](architecture/design-system.md) |
| Deploy to Vercel | [Vercel Setup](deployment/vercel-setup.md) |
| Scrape jobs | [Bright Data Integration](integrations/brightdata-crawl-api.md) |
| Add mission/playbook | [Code Recipes](development/code-recipes.md) Recipe #3, #4 |

### Key Concepts
- **Pulse System**: Health indicator (critical/watch/stable) based on job market data
- **Sectors**: Workforce categories (Public Safety, Healthcare, etc.)
- **Missions**: Community action items with progress tracking
- **Playbooks**: Shareable step-by-step guides
- **Stub Mode**: Dev mode using mock data (toggle with `NEXT_PUBLIC_USE_STUBS`)

---

## 🤝 TEAM AGENTS

Specialized AI agents are available to accelerate development. See [Agents Guide](getting-started/agents.md) for details:

- **Frontend Agent** - React/Next.js expert
- **Backend Agent** - Express/MongoDB specialist
- **Integration Agent** - API & data source expert
- **Testing Agent** - Quality assurance specialist
- **Documentation Agent** - Keep docs updated

---

## 🔄 KEEPING DOCS UPDATED

When you modify code, update the relevant documentation:

- **New feature** → Add to [Integration Status](development/integration-status.md)
- **New component** → Update [Architecture Overview](architecture/overview.md)
- **New API endpoint** → Update [API Reference](development/api-reference.md)
- **New pattern** → Add to [Code Recipes](development/code-recipes.md)

**Documentation Agent** can help keep these files in sync!

**Total: Fully productive in 1 hour**

---

### For Strategic Planning (30 minutes)
1. Read: INTEGRATION_STATUS.md
   - See the checklist (✅✅⚠️❌)
   - Review priority roadmap
   - Understand 5-phase plan

2. Reference: WORKSPACE_STRUCTURE_ANALYSIS.md
   - Check data schemas
   - Review API endpoints

**Output**: Clear feature roadmap

---

## 📍 QUICK MAP

### I want to...

**...understand the dashboard**
→ WORKSPACE_STRUCTURE_SUMMARY.md → Dashboard section

**...add a new page**
→ CODE_RECIPES.md → Recipe 1

**...understand data flow**
→ ARCHITECTURE_DIAGRAMS.md → Data Query Flow section

**...create a component**
→ CODE_RECIPES.md → Recipe 2 (SignalCard)

**...set up React Query**
→ CODE_RECIPES.md → Recipe 3

**...know what's done**
→ INTEGRATION_STATUS.md → Integration Checklist

**...see all APIs**
→ INTEGRATION_STATUS.md → API Endpoint Summary

**...find a specific component**
→ WORKSPACE_STRUCTURE_SUMMARY.md → Component Inventory

**...understand gamification**
→ WORKSPACE_STRUCTURE_SUMMARY.md → Hooks section

**...see priority features**
→ INTEGRATION_STATUS.md → Priority Roadmap

---

## 💡 KEY LEARNINGS

### Architecture
- **Pattern**: Service layer abstraction (allows stub/real API toggle)
- **State**: React Query manages all server state
- **Components**: Presentational, props-driven, Tailwind-styled
- **Types**: TypeScript-first, all interfaces in `src/services/types/`

### Data Flow
```
Component → React Query → Service → USE_STUBS? 
  ├─ YES: Return stub data
  └─ NO: Fetch from API
```

### Gamification
- Points awarded on action completion
- Streaks tracked for daily engagement
- Badges earned on milestones
- All state in MissionMemberProfile

### Real Data Integration
- Jobs scraped via Bright Data
- Sector enrichment: jobs feed into pulse scores
- Skill extraction: parsed from job descriptions
- **Not yet connected**: Skill trends, skill → playbook recommendations

---

## 🔧 ENVIRONMENT SETUP

```bash
# Frontend
echo 'NEXT_PUBLIC_USE_STUBS=false' >> .env.local
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' >> .env.local

# Backend
echo 'MONGODB_URI=mongodb://...' >> backend/.env
echo 'BRIGHT_DATA_API_KEY=...' >> backend/.env
```

---

## 📊 PROJECT STATS

| Metric | Count |
|--------|-------|
| Pages | 4 (Dashboard, Skills, Missions, Playbooks) |
| Components | 40+ |
| Services | 8 |
| Data Types | 20+ interfaces |
| API Endpoints | 15+ |
| React Query Keys | 12+ |
| Stubs | 5 data files |
| Integration Points | 8 working, 4 partial, 5 planned |

---

## ✅ VERIFICATION CHECKLIST

Before you start coding, verify:

- [ ] Read WORKSPACE_STRUCTURE_SUMMARY.md
- [ ] Understand the 4 pages and data flow
- [ ] Know the difference between stubs and real API mode
- [ ] Can find existing components in the file structure
- [ ] Understand React Query usage pattern
- [ ] Know where types are defined (services/types/)
- [ ] Know where services are (services/api/)
- [ ] Know where stubs are (services/stubs/)

---

## 🆘 COMMON QUESTIONS

**Q: How do I add a new feature?**  
A: Follow Recipe 1 in CODE_RECIPES.md (10 minutes)

**Q: How does the stub toggle work?**  
A: Check WORKSPACE_STRUCTURE_ANALYSIS.md → "Stub Data Location"

**Q: What's already working?**  
A: See INTEGRATION_STATUS.md → "Fully Integrated" section

**Q: How do I display a KPI card?**  
A: See CODE_RECIPES.md → Recipe 2 (SignalCard)

**Q: How do I fetch data?**  
A: See CODE_RECIPES.md → Recipe 3 (React Query)

**Q: Where's the job scraping?**  
A: backend/src/controllers/jobController.js + live-scrape.tsx component

**Q: How do points work?**  
A: Services/api/community-profile.ts + missions.ts/playbooks.ts

**Q: Can I see all types?**  
A: Yes, all in src/services/types/index.ts

**Q: How do I test locally?**  
A: Set NEXT_PUBLIC_USE_STUBS=true to use stub data

---

## 📞 SUPPORT

If you can't find something:

1. **Check the code**: Files mentioned in docs exist
2. **Search**: Use Ctrl+F in your editor
3. **Run**: `semantic_search` for concept searches
4. **Reference**: CODE_RECIPES.md has copy-paste examples

---

## 📝 DOCUMENT MAINTENANCE

**Last updated**: March 7, 2026  
**Maintained by**: Analysis system  
**Update frequency**: As features are added  

**To update docs**:
1. Make code changes
2. Update relevant doc (INTEGRATION_STATUS.md, ARCHITECTURE_DIAGRAMS.md, etc.)
3. Update this INDEX
4. Commit all together

---

## 🎯 NEXT PRIORITY (Based on Analysis)

1. **Skills → Jobs Integration** (2-3 days)
   - Extract skills from job postings
   - Aggregate skill demand
   - Update Skill page with trends

2. **Job Recommendations** (2-3 days)
   - Match jobs to playbooks
   - Suggest learning paths
   - Skills gap analysis

3. **Application Tracking** (2-3 days)
   - Store user applications
   - Track application status
   - Display history

---

## 🎓 LEARNING RESOURCES

### Within This Project
- All 4 pages: Example of different layouts + data patterns
- DashboardSignalCard: Example of flexible component design
- InsightCards: Example of array rendering + animations
- React Query usage: Throughout all components

### External
- [React Query Docs](https://tanstack.com/query)
- [Next.js 16 Docs](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

## 🎉 YOU'RE READY!

You now have:
- ✅ Complete workspace structure
- ✅ Data flow understanding
- ✅ Component patterns
- ✅ Code recipes
- ✅ Priority roadmap
- ✅ API reference

**Next step**: Pick a task from INTEGRATION_STATUS.md and use CODE_RECIPES.md to implement it.

Good luck! 🚀

