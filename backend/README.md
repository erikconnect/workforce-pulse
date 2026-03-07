# Workforce Pulse Backend API

Node.js + Express + MongoDB backend for Workforce Pulse application.

## Features

- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- CORS enabled for frontend integration
- Request validation with Joi
- Error handling middleware
- Rate limiting
- Compression and security headers

## Prerequisites

- Node.js 18+ 
- MongoDB 6+ (local or Atlas)
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:3000)
- `JWT_SECRET` - Secret for JWT tokens

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Base URL
`http://localhost:5000/api/v1`

### Jobs
- `GET /jobs` - Get all jobs (with filters)
- `GET /jobs/insights` - Get job insights and analytics
- `POST /jobs` - Create/update single job
- `POST /jobs/bulk` - Bulk upsert jobs
- `DELETE /jobs` - Clear all jobs

### Sectors
- `GET /sectors` - Get all sectors
- `GET /sectors/:id` - Get sector by ID
- `POST /sectors` - Create/update sector
- `DELETE /sectors/:id` - Delete sector

### Skills
- `GET /skills` - Get all skills (with search)
- `GET /skills/:id` - Get skill by ID
- `POST /skills` - Create/update skill
- `DELETE /skills/:id` - Delete skill

### Missions
- `GET /missions` - Get all missions
- `GET /missions/:id` - Get mission by ID
- `POST /missions` - Create mission
- `PATCH /missions/:id` - Update mission
- `PATCH /missions/:id/steps/:stepId` - Update mission step
- `DELETE /missions/:id` - Delete mission

### Playbooks
- `GET /playbooks` - Get all playbooks
- `GET /playbooks/:id` - Get playbook by ID
- `POST /playbooks` - Create playbook
- `POST /playbooks/:id/like` - Like/unlike playbook
- `POST /playbooks/:id/save` - Save/unsave playbook
- `DELETE /playbooks/:id` - Delete playbook

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

## Database Models

### JobPosting
- Job listings from various sources
- Indexed by sector, source, posted date
- Extracted skills array

### Sector
- Industry sectors (public-safety, healthcare, etc.)
- Pulse score (0-100)
- KPIs and sparkline data

### Skill
- Skills extracted from job postings
- Growth rate and demand level
- Training resources

### Mission
- Action tracking with steps
- Progress calculation
- Impact metrics

### Playbook
- Shareable action plans
- Likes and saves tracking
- Tags for categorization

## Integration with Frontend

Update your Next.js `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_STUBS=false
```

## Testing

```bash
npm test
```

## Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/server.js --name workforce-pulse-api
```

### Using Docker
```bash
docker build -t workforce-pulse-backend .
docker run -p 5000:5000 --env-file .env workforce-pulse-backend
```

## License

MIT
