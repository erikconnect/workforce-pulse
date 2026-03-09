# Vercel Production Database Setup

## Overview

The application has been updated to connect directly to MongoDB from Next.js API routes for Vercel deployment. This eliminates the need for a separate Express backend in production.

## Changes Made

### 1. Database Connection Layer

- **Created**: [src/lib/mongodb.ts](../src/lib/mongodb.ts)
  - Serverless-compatible MongoDB connection utility
  - Implements connection caching to prevent exhausting database connections
  - Handles connection across multiple serverless function invocations

### 2. Mongoose Models

- **Created**: [src/models/JobPosting.ts](../src/models/JobPosting.ts)
- **Created**: [src/models/Skill.ts](../src/models/Skill.ts)
  - TypeScript versions of backend models
  - Compatible with Next.js serverless functions
  - Prevents model recompilation in development

### 3. Updated API Routes

The following routes now connect directly to MongoDB instead of calling the backend API:

- [src/app/api/jobs/store.ts](../src/app/api/jobs/store.ts) - Job storage operations
- [src/app/api/skills/route.ts](../src/app/api/skills/route.ts) - Skills endpoint
- [src/app/api/jobs/stats/route.ts](../src/app/api/jobs/stats/route.ts) - Job statistics

### 4. Vercel Configuration

Updated [vercel.json](../vercel.json) with:
- Environment variable configuration
- Function timeout settings
- Increased timeout for job aggregation endpoint (120s)

## Environment Variables

### Required Variables

Add these environment variables to your Vercel project:

1. **MONGODB_URI**
   - Your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Can be from MongoDB Atlas, Railway, or any MongoDB provider

2. **NEXT_PUBLIC_USE_STUBS** (optional)
   - Set to `"false"` to use real database
   - Set to `"true"` to use stub/mock data
   - Default: `"false"`

### Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://your-connection-string
   Environment: Production, Preview, Development
   ```

4. Click **Save**

### MongoDB Atlas Setup

If you don't have a MongoDB database yet:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist Vercel's IP addresses (or use `0.0.0.0/0` for all IPs)
5. Get your connection string from **Connect** → **Connect your application**
6. Replace `<password>` with your actual password
7. Add the connection string to Vercel environment variables

## Local Development

For local development, the backend Express server (with MongoDB) can still be used:

```bash
# Run both Next.js and Express backend
npm run dev:full

# Or run them separately
npm run dev          # Next.js only
npm run dev:backend  # Express backend only
```

### Local Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/workforce-pulse
NEXT_PUBLIC_USE_STUBS=false
```

## Deployment Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** in Vercel Dashboard (see above)

3. **Deploy**:
   ```bash
   vercel --prod
   ```

   Or push to your connected Git repository for automatic deployment.

4. **Verify**: Check the deployment logs to ensure MongoDB connection is successful

## Testing the Connection

After deployment, you can test the database connection by accessing:

- `https://your-app.vercel.app/api/skills` - Should return skills from database
- `https://your-app.vercel.app/api/jobs/stats` - Should return job statistics
- `https://your-app.vercel.app/api/jobs/aggregate` - Triggers job aggregation

## Troubleshooting

### "Please define the MONGODB_URI environment variable"

- Make sure `MONGODB_URI` is set in Vercel project settings
- Redeploy after adding environment variables

### Connection Timeout Errors

- Check MongoDB Atlas network access settings
- Ensure `0.0.0.0/0` is whitelisted (or Vercel's IP ranges)
- Verify your connection string is correct

### Function Timeout (504 errors)

- Job aggregation can take time - the timeout is set to 120s
- Consider running aggregation as a cron job (already configured in vercel.json)

## Architecture Notes

### Development Mode
```
Browser → Next.js Dev Server → Express Backend → MongoDB
```

### Production (Vercel)
```
Browser → Next.js Serverless Functions → MongoDB
          (Direct connection, no backend needed)
```

The Express backend is still useful for:
- Local development seeding
- Testing backend-specific features
- Scheduled tasks (if not using Vercel Cron)

But in production on Vercel, all database operations happen directly from Next.js API routes.
