# Vercel Deployment Checklist

## ✅ Changes Completed

The application has been updated to work with MongoDB in Vercel production:

1. ✅ Added `mongoose` to package.json dependencies
2. ✅ Created MongoDB connection utility for serverless functions
3. ✅ Created TypeScript Mongoose models (JobPosting, Skill)
4. ✅ Updated API routes to use direct MongoDB connections:
   - Job store operations
   - Skills endpoint
   - Job statistics endpoint
5. ✅ Updated vercel.json with environment variables and timeouts

## 🚀 Deployment Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard and add:

**Required:**
- **Variable Name:** `MONGODB_URI`
- **Value:** Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/workforce-pulse?retryWrites=true&w=majority`
- **Environments:** Production, Preview, Development

**Optional:**
- **Variable Name:** `NEXT_PUBLIC_USE_STUBS`
- **Value:** `false`
- **Environments:** Production, Preview, Development

### 2. MongoDB Setup

If using MongoDB Atlas (recommended for Vercel):

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with password
3. In **Network Access**, add `0.0.0.0/0` to whitelist all IPs (Vercel uses dynamic IPs)
4. Get connection string from **Connect** → **Connect your application**
5. Replace `<password>` with your actual password
6. Use this as your `MONGODB_URI`

### 3. Initial Database Seeding

Before first deployment, you may want to seed your database with initial data:

**Option A: Run backend locally with production database**
```bash
# In backend/.env, set your production MONGODB_URI
cd backend
npm install
npm run dev
# Backend will auto-seed on first run
```

**Option B: Deploy first, then manually seed**
- Deploy to Vercel without data
- Use MongoDB Compass or Atlas UI to import seed data
- Seed data is in `backend/src/seeds/`

### 4. Deploy to Vercel

**Option A: Git Push (Automatic)**
```bash
git add .
git commit -m "Add MongoDB support for Vercel deployment"
git push
# Vercel will automatically deploy
```

**Option B: Vercel CLI (Manual)**
```bash
npm install -g vercel  # If not already installed
vercel --prod
```

### 5. Verify Deployment

After deployment, test these endpoints:

1. **Health Check**
   ```
   https://your-app.vercel.app/api/skills
   ```
   Should return skills data from database

2. **Job Stats**
   ```
   https://your-app.vercel.app/api/jobs/stats
   ```
   Should return job statistics

3. **Job Aggregation** (This might take 60-120 seconds)
   ```
   https://your-app.vercel.app/api/jobs/aggregate
   ```
   Should fetch and store jobs from job boards

## 🔧 Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"

**Solution:**
- Double-check that `MONGODB_URI` is set in Vercel dashboard
- Make sure it's enabled for the correct environment (Production/Preview)
- Redeploy after adding environment variables

### Error: "MongoServerSelectionError: connection timed out"

**Solutions:**
1. Check MongoDB Atlas Network Access
   - Go to **Network Access** in Atlas
   - Ensure `0.0.0.0/0` is in the IP whitelist
2. Verify connection string format
3. Check that database user has correct permissions

### Error: "Function timeout (504)"

**Solution:**
- Job aggregation can take time (up to 120s is configured)
- This is normal for the first run
- Subsequent runs will be faster
- Consider using the Vercel Cron job (already configured to run daily at midnight)

### No data appearing in production

**Solutions:**
1. Check if database has been seeded
2. Run `/api/jobs/aggregate` manually to populate jobs
3. Check Vercel function logs for errors

## 📊 Monitoring

### View Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Filter by function to see MongoDB connection logs

### Database Monitoring
1. Go to MongoDB Atlas Dashboard
2. Check **Metrics** for connection count and operations
3. Review **Performance Advisor** for query optimization

## 🔄 Automated Jobs

The following is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/jobs/aggregate",
      "schedule": "0 0 * * *"  // Runs daily at midnight UTC
    }
  ]
}
```

This will automatically refresh job data every day. You can modify the schedule as needed.

## 📝 Local Development

For local development, you can continue using the backend:

```bash
# Run both Next.js and Express backend
npm run dev:full
```

Or configure `.env.local` to use production database:

```env
MONGODB_URI=mongodb+srv://your-production-uri
NEXT_PUBLIC_USE_STUBS=false
```

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [MongoDB Atlas Getting Started](https://www.mongodb.com/docs/atlas/getting-started/)
- [Next.js MongoDB Integration](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb)

## ✨ What's Next?

After successful deployment:

1. Set up proper database backups in MongoDB Atlas
2. Configure alerts for database errors
3. Monitor function execution times
4. Optimize queries if needed
5. Consider implementing database indexes for better performance

---

For more details, see [database-setup.md](./database-setup.md)
