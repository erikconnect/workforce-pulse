# 🤖 WORKFORCE PULSE — AI AGENT SYSTEM

**Last Updated**: March 7, 2026  
**Purpose**: Specialized AI agents to accelerate team velocity

> These agents are pre-configured with domain expertise in different areas of the Workforce Pulse codebase. Use them for faster, more accurate development.

---

## 📋 QUICK REFERENCE

| Agent Name | Best For | Typical Tasks |
|------------|----------|---------------|
| [Frontend Agent](#-frontend-agent) | React/Next.js UI work | Components, pages, styling, state management |
| [Backend Agent](#-backend-agent) | API & database work | Express routes, MongoDB models, controllers |
| [Integration Agent](#-integration-agent) | External APIs | Bright Data, USAJOBS, ArcGIS, job scraping |
| [Testing Agent](#-testing-agent) | Quality assurance | Unit tests, E2E tests, debugging |
| [Documentation Agent](#-documentation-agent) | Docs maintenance | Update docs, code comments, API specs |
| [DevOps Agent](#-devops-agent) | Deployment & CI/CD | Vercel, environment config, builds |

---

## 🎨 Frontend Agent

**Expertise**: Next.js 16 App Router, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query

### When to Use
- Building new pages or components
- Implementing UI features
- Working with forms and validation
- State management with React Query
- Styling with Tailwind CSS
- Accessibility improvements

### Key Knowledge Areas
- `/src/app/` directory structure (App Router)
- Component patterns in `/src/components/`
- Custom hooks in `/src/hooks/`
- Service layer in `/src/services/`
- Design system from `Omni-Guide.md`
- Code recipes from `CODE_RECIPES.md`

### Example Prompts
```
@Frontend Agent: Create a new Sector detail page with job listings and skill chips

@Frontend Agent: Add a form to create new missions with validation

@Frontend Agent: Fix the responsive layout on the dashboard for mobile

@Frontend Agent: Implement the playbook filter by difficulty level
```

### Agent Configuration
The Frontend Agent has access to:
- All files in `/src/app/`, `/src/components/`, `/src/hooks/`
- Documentation: `CODE_RECIPES.md`, `WORKSPACE_STRUCTURE_SUMMARY.md`, `Omni-Guide.md`
- Service contracts from `/src/services/types/`

---

## ⚙️ Backend Agent

**Expertise**: Node.js, Express, MongoDB, Mongoose, REST APIs

### When to Use
- Creating new API endpoints
- Database schema design
- Business logic implementation
- Error handling
- Data validation
- MongoDB queries

### Key Knowledge Areas
- Express routing in `/backend/src/routes/`
- Controllers in `/backend/src/controllers/`
- Models in `/backend/src/models/`
- Database config in `/backend/src/config/`
- API contracts in `api.md`

### Example Prompts
```
@Backend Agent: Create a new endpoint for filtering jobs by salary range

@Backend Agent: Add validation middleware for mission creation

@Backend Agent: Optimize the job aggregation query for performance

@Backend Agent: Add error handling for Bright Data API failures
```

### Agent Configuration
The Backend Agent has access to:
- All files in `/backend/`
- Documentation: `api.md`, `DATA_SOURCES.md`
- Database schemas from models

---

## 🔌 Integration Agent

**Expertise**: Bright Data, USAJOBS API, ArcGIS, JobAps RSS, external data sources

### When to Use
- Integrating new data sources
- Debugging scraping issues
- API authentication setup
- Data transformation
- Rate limiting & caching
- Job aggregation pipeline

### Key Knowledge Areas
- Bright Data Scraping Browser & Crawl API
- USAJOBS API authentication
- ArcGIS FeatureServer queries
- RSS feed parsing
- Job classification algorithms
- `/src/integrations/` and `/src/lib/scraper.ts`

### Example Prompts
```
@Integration Agent: Add LinkedIn Jobs as a new data source

@Integration Agent: Fix the USAJOBS API authentication error

@Integration Agent: Improve job classification accuracy for Public Safety roles

@Integration Agent: Add caching for Bright Data responses to reduce costs
```

### Agent Configuration
The Integration Agent has access to:
- `/src/integrations/`, `/src/lib/`
- Documentation: `BrightData_CrawlAPI_Integration_Prompt.md`, `DATA_SOURCES.md`, `api.md`
- Environment variables related to APIs

---

## 🧪 Testing Agent

**Expertise**: Vitest, React Testing Library, E2E testing, debugging

### When to Use
- Writing unit tests
- Creating integration tests
- Debugging test failures
- Setting up test fixtures
- Mocking API responses
- Code coverage analysis

### Key Knowledge Areas
- Test setup in `vitest.config.ts`
- Existing tests in `/src/**/*.test.ts`
- Mock data in `/src/data/`
- Testing patterns for React Query
- Component testing with RTL

### Example Prompts
```
@Testing Agent: Write unit tests for the mission service

@Testing Agent: Add E2E tests for the job scraping workflow

@Testing Agent: Debug why the dashboard tests are failing

@Testing Agent: Create test fixtures for playbook data
```

### Agent Configuration
The Testing Agent has access to:
- All test files `**/*.test.ts`, `**/*.spec.ts`
- Mock data in `/src/data/`
- `vitest.config.ts`
- Documentation: `CODE_RECIPES.md` (testing section)

---

## 📚 Documentation Agent

**Expertise**: Technical writing, API documentation, code comments, changelog maintenance

### When to Use
- Updating documentation after code changes
- Creating new documentation
- Improving code comments
- Writing API specifications
- Maintaining changelog
- Creating diagrams

### Key Knowledge Areas
- All files in `/docs/`
- README files
- Code comments
- JSDoc/TSDoc patterns
- Markdown formatting

### Example Prompts
```
@Documentation Agent: Update INTEGRATION_STATUS.md with the new missions feature

@Documentation Agent: Add JSDoc comments to the job aggregation service

@Documentation Agent: Create a troubleshooting guide for Bright Data errors

@Documentation Agent: Update the API docs with the new filter parameters
```

### Agent Configuration
The Documentation Agent has access to:
- All files in `/docs/`
- README files across the codebase
- Source code for extracting comments
- Git history for changelog generation

---

## 🚀 DevOps Agent

**Expertise**: Vercel deployment, environment configuration, CI/CD, build optimization

### When to Use
- Deploying to Vercel
- Configuring environment variables
- Optimizing build performance
- Setting up CI/CD pipelines
- Debugging deployment issues
- Managing secrets

### Key Knowledge Areas
- Vercel configuration in `vercel.json`
- Environment variables in `.env.example`
- Build config in `next.config.mjs`
- Package management in `package.json`
- Documentation: `VERCEL_SETUP.md`, `SETUP.md`

### Example Prompts
```
@DevOps Agent: Configure Vercel cron job for daily job aggregation

@DevOps Agent: Add staging environment with separate API keys

@DevOps Agent: Optimize the Next.js build to reduce bundle size

@DevOps Agent: Set up preview deployments for pull requests
```

### Agent Configuration
The DevOps Agent has access to:
- `vercel.json`, `next.config.mjs`, `package.json`
- `.env.example`
- Documentation: `VERCEL_SETUP.md`, `SETUP.md`
- Build logs and deployment history

---

## 🔧 HOW TO USE AGENTS

### Method 1: Direct Invocation (In VS Code Copilot Chat)
Use the `@` symbol followed by the agent name:

```
@Frontend Agent: Help me create a new skill detail page
```

### Method 2: In Comments (For Context)
Tag agents in code comments for context-aware suggestions:

```typescript
// @Frontend Agent: This component needs better loading states
export function JobList() {
  // ...
}
```

### Method 3: In Documentation Tasks
Reference agents in TODO comments or issues:

```markdown
- [ ] Add pagination to missions list (@Frontend Agent)
- [ ] Optimize job aggregation query (@Backend Agent)
```

---

## 🎯 AGENT SPECIALIZATION MATRIX

| Task Type | Primary Agent | Secondary Agent | Documentation |
|-----------|---------------|-----------------|---------------|
| New UI component | Frontend Agent | Documentation Agent | CODE_RECIPES.md |
| API endpoint | Backend Agent | Integration Agent | api.md |
| Data scraping | Integration Agent | Backend Agent | BrightData_*.md |
| Bug fix (frontend) | Frontend Agent | Testing Agent | - |
| Bug fix (backend) | Backend Agent | Testing Agent | - |
| Deployment issue | DevOps Agent | Backend Agent | VERCEL_SETUP.md |
| Documentation update | Documentation Agent | - | All docs |
| Performance optimization | DevOps Agent | Frontend/Backend | - |
| Security issue | Backend Agent | DevOps Agent | - |

---

## 📊 AGENT EFFECTIVENESS METRICS

### How We Measure Success
- **Time to First Code**: How quickly agent produces working code
- **Accuracy**: Percentage of suggestions that work without modification
- **Context Awareness**: Uses correct patterns from existing codebase
- **Documentation Quality**: Clear explanations and comments

### Continuous Improvement
Agents learn from:
- Code reviews and feedback
- Bug reports and fixes
- New patterns added to CODE_RECIPES.md
- Updated architecture in WORKSPACE_STRUCTURE_SUMMARY.md

---

## 🤝 AGENT COLLABORATION WORKFLOWS

### Workflow 1: Full-Stack Feature Development
1. **Frontend Agent**: Creates UI components
2. **Backend Agent**: Builds API endpoints
3. **Integration Agent**: Connects external data sources
4. **Testing Agent**: Writes tests
5. **Documentation Agent**: Updates docs

### Workflow 2: Bug Fix Pipeline
1. **Testing Agent**: Reproduces bug with test
2. **Frontend/Backend Agent**: Fixes the issue
3. **Testing Agent**: Verifies fix
4. **Documentation Agent**: Updates changelog

### Workflow 3: Performance Optimization
1. **DevOps Agent**: Identifies bottleneck
2. **Frontend/Backend Agent**: Implements optimization
3. **Testing Agent**: Validates performance improvement
4. **Documentation Agent**: Documents changes

---

## 🔐 AGENT BEST PRACTICES

### DO's ✅
- **Be specific** in your prompts
- **Provide context** (related files, error messages)
- **Review agent output** before committing
- **Give feedback** when suggestions are wrong
- **Use multiple agents** for complex tasks

### DON'Ts ❌
- **Don't blindly trust** agent output
- **Don't skip testing** agent-generated code
- **Don't use agents** for critical security decisions without review
- **Don't ignore** agent warnings or suggestions
- **Don't forget** to update docs after agent changes

---

## 📞 GETTING HELP

### Agent Not Working?
1. Check if you're using the correct agent for the task
2. Verify agent has access to required files
3. Provide more specific context in your prompt
4. Try breaking down the task into smaller pieces

### Agent Giving Wrong Answers?
1. Review the documentation the agent references
2. Check if patterns in CODE_RECIPES.md are up to date
3. Provide feedback to improve future responses
4. Manually fix and update CODE_RECIPES.md with correct pattern

### Want a New Agent?
1. Identify the domain expertise needed
2. Document common tasks in that domain
3. Create a new agent section in this file
4. Test with sample prompts

---

## 🎓 LEARNING RESOURCES

### For Agent Users
- **VS Code Copilot Documentation**: Learn advanced prompting
- **CODE_RECIPES.md**: See patterns agents use
- **WORKSPACE_STRUCTURE_SUMMARY.md**: Understand architecture agents reference

### For Agent Maintainers
- **Agent Customization Guide**: How to configure agent behavior
- **Context Management**: What files agents can access
- **Prompt Engineering**: Writing effective agent prompts

---

## 🔄 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-03-07 | Added all six specialized agents |
| 1.0 | 2026-03-01 | Initial agent system design |

---

**Questions?** Ask the **Documentation Agent** to explain any part of this system!

