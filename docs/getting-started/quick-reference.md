# 🚀 WORKFORCE PULSE — QUICK REFERENCE CHEAT SHEET

**For**: All team members  
**Purpose**: Fast lookups while coding

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

**Local URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000 (if running separately)

---

## 📁 Key File Locations

### Frontend
```
src/app/(app)/          # Main app pages
src/components/         # Reusable components
src/services/api/       # API service layer
src/services/stubs/     # Mock data
src/hooks/              # Custom React hooks
src/lib/                # Utilities & integrations
```

### Backend
```
backend/src/routes/       # API routes
backend/src/controllers/  # Request handlers
backend/src/models/       # MongoDB schemas
```

### Documentation
```
docs/DOCUMENTATION_INDEX.md  # Start here
docs/CODE_RECIPES.md         # Copy-paste patterns
docs/api.md                  # API reference
docs/AGENTS.md               # AI agent guides
```

---

## 🎨 Component Patterns

### Create New Page

```typescript
// 1. Create page file
// src/app/(app)/my-page/page.tsx
"use client"

import { useQuery } from '@tanstack/react-query'
import { fetchMyData } from '@/services'

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-data'],
    queryFn: fetchMyData
  })
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{/* Your UI */}</div>
}
```

### Create API Service

```typescript
// src/services/api/my-service.ts
const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === 'true'

export async function fetchMyData() {
  if (USE_STUBS) return mockData
  
  const res = await fetch('/api/my-endpoint')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
```

### Create Component

```typescript
// src/components/my-component.tsx
interface Props {
  title: string
  status: 'critical' | 'watch' | 'stable'
}

export function MyComponent({ title, status }: Props) {
  return (
    <Card className={`border-pulse-${status}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

---

## 🔌 Backend Patterns

### Create API Endpoint

```javascript
// backend/src/routes/myRoutes.js
const express = require('express')
const { getData, createData } = require('../controllers/myController')

const router = express.Router()

router.get('/', getData)
router.post('/', createData)

module.exports = router
```

### Create Controller

```javascript
// backend/src/controllers/myController.js
const MyModel = require('../models/MyModel')

exports.getData = async (req, res, next) => {
  try {
    const data = await MyModel.find()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
```

---

## 🎯 React Query Patterns

### Fetch Data

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs,
  staleTime: 5 * 60 * 1000,  // 5 minutes
})
```

### Mutate Data

```typescript
const { mutate } = useMutation({
  mutationFn: createJob,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
  }
})

// Use it
mutate({ title: 'New Job', sector: 'Tech' })
```

---

## 🎨 Tailwind Patterns

### Pulse Color System

```tsx
<div className="border-pulse-critical">Critical</div>
<div className="border-pulse-watch">Watch</div>
<div className="border-pulse-stable">Stable</div>

<div className="bg-pulse-critical/10">Light critical bg</div>
<div className="text-pulse-watch">Watch text</div>
```

### Responsive Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### Common Utilities

```tsx
<div className="flex items-center justify-between gap-4">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button>Action</Button>
</div>
```

---

## 🧪 Testing Patterns

### Component Test

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './my-component'

test('renders title', () => {
  render(<MyComponent title="Test" />)
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

### Service Test

```typescript
import { vi } from 'vitest'
import { fetchData } from './my-service'

global.fetch = vi.fn()

test('fetches data', async () => {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [] })
  })
  
  const result = await fetchData()
  expect(result).toEqual({ data: [] })
})
```

---

## 🔐 Environment Variables

### Required for Development

```bash
# .env.local
NEXT_PUBLIC_USE_STUBS=true  # Use mock data
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# External APIs (optional for dev)
USAJOBS_API_KEY=your_key
USAJOBS_USER_AGENT=your@email.com
BRIGHT_DATA_BROWSER_WSS=wss://...
```

### Required for Production

All above plus:
```bash
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_USE_STUBS=false
```

---

## 🚨 Common Errors & Fixes

### "Failed to fetch from API"
✅ Check `NEXT_PUBLIC_API_URL` is set  
✅ Verify backend is running  
✅ Check CORS settings

### "Module not found"
✅ Run `npm install`  
✅ Check import path uses `@/` alias  
✅ Restart dev server

### "TypeScript error"
✅ Check type definitions in `src/services/types/`  
✅ Run `npm run type-check`  
✅ Add missing types

### Vercel build fails
✅ Test `npm run build` locally  
✅ Check environment variables in Vercel dashboard  
✅ Review build logs

---

## 📊 Data Types Reference

### JobPosting

```typescript
interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary?: { min: number; max: number; currency: string }
  sector: string
  postedDate: Date
  deadline?: Date
  source: string
  extractedSkills: string[]
  url: string
}
```

### Sector

```typescript
interface Sector {
  id: string
  name: string
  pulseScore: number  // 0-100
  status: 'critical' | 'watch' | 'stable'
  openRolesCount: number
  sparklineData: number[]
}
```

### Mission

```typescript
interface Mission {
  id: string
  title: string
  status: 'active' | 'completed' | 'paused'
  priority: 'critical' | 'watch' | 'stable'
  progress: number  // 0-100
  steps: MissionStep[]
  rewardPoints: number
}
```

---

## 🤖 AI Agents

Use agents for faster development:

```
@Frontend Agent: Create a new skill detail page
@Backend Agent: Add validation for mission creation
@Integration Agent: Add LinkedIn as a job source
@Testing Agent: Write tests for the job service
@Documentation Agent: Update API docs for new endpoint
@DevOps Agent: Configure staging environment
```

**See**: [docs/AGENTS.md](../docs/AGENTS.md) for detailed agent guides

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature

# After review, merge to main
```

**Commit Convention**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

---

## 🔗 Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check linting
npm run test         # Run tests
npm run type-check   # TypeScript validation

# Backend
cd backend
npm run dev          # Start backend dev server
npm start            # Start production backend

# Docker
docker-compose up    # Start all services
docker-compose down  # Stop all services
```

---

## 📚 Documentation Quick Links

| Need | See |
|------|-----|
| Getting started | [SETUP.md](../docs/SETUP.md) |
| Code examples | [CODE_RECIPES.md](../docs/CODE_RECIPES.md) |
| API reference | [api.md](../docs/api.md) |
| Architecture | [WORKSPACE_STRUCTURE_SUMMARY.md](../docs/WORKSPACE_STRUCTURE_SUMMARY.md) |
| Feature status | [INTEGRATION_STATUS.md](../docs/INTEGRATION_STATUS.md) |
| Deployment | [VERCEL_SETUP.md](../docs/VERCEL_SETUP.md) |
| AI agents | [AGENTS.md](../docs/AGENTS.md) |

---

## 💡 Pro Tips

1. **Use stub mode** during development (`NEXT_PUBLIC_USE_STUBS=true`)
2. **Type everything** - avoid `any` types
3. **Test locally** before pushing
4. **Ask agents** for help with complex tasks
5. **Update docs** when you change code
6. **Review existing code** before implementing new patterns

---

**Questions?** Check [DOCUMENTATION_INDEX.md](../docs/DOCUMENTATION_INDEX.md) or ask the **Documentation Agent**!