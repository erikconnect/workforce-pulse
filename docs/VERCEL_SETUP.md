# Vercel Automatic Deployment Setup Guide

## 🎯 Quick Setup (Recommended)

### Option 1: Automatic Setup with PowerShell Script

Run the provided setup script:

```powershell
.\setup-vercel.ps1
```

This script will:
- ✅ Link your project to Vercel
- ✅ Configure MongoDB environment variables
- ✅ Set up all environments (production, preview, development)

### Option 2: Manual Setup via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New Project" or select existing project

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select your GitHub account
   - Choose your `workforce-pulse` repository
   - Click "Import"

3. **Configure Environment Variables**
   
   In the "Environment Variables" section, add:

   **MONGODB_URI**
   ```
   mongodb+srv://erik_db_user:G39w8HLfqcQiHSef@workforce-pulse.incefrw.mongodb.net/workforce-pulse?retryWrites=true&w=majority&appName=Workforce-pulse
   ```
   - ☑ Production
   - ☑ Preview
   - ☑ Development

   **NEXT_PUBLIC_USE_STUBS**
   ```
   false
   ```
   - ☑ Production
   - ☑ Preview
   - ☑ Development

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Visit your deployment URL

## 🔄 Automatic Deployment

Once connected to GitHub:

1. **Push to Deploy**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
   
2. **Vercel automatically:**
   - Detects the push
   - Builds your project
   - Deploys to production (for main/master branch)
   - Creates preview deployments (for other branches)

3. **Get notifications:**
   - GitHub commit status checks
   - Vercel deployment comments on PRs
   - Email notifications (optional)

## 📊 Your Configuration

### MongoDB Atlas
- **Cluster:** workforce-pulse.incefrw.mongodb.net
- **Database:** workforce-pulse
- **User:** erik_db_user
- **Status:** ✅ Configured in `.env.local` and ready for Vercel

### Environment Variables Set
✅ `MONGODB_URI` - MongoDB Atlas connection string
✅ `NEXT_PUBLIC_USE_STUBS` - Set to `false` (use real database)

### Deployment Settings
✅ Framework: Next.js (auto-detected)
✅ Build Command: `npm run build`
✅ Output Directory: `.next`
✅ Install Command: `npm install`

## 🚀 Deploy Now

### Deploy via CLI
```bash
# First time setup
vercel

# Or deploy to production immediately
vercel --prod
```

### Deploy via Git (Recommended for Automatic)
```bash
# Make sure you're on the main branch
git checkout main

# Add your changes
git add .
git commit -m "Configure MongoDB Atlas and deployment"

# Push to trigger deployment
git push origin main
```

## 🔍 Verify Deployment

After deployment, test these endpoints:

1. **Home Page**
   ```
   https://your-app.vercel.app
   ```

2. **Skills API**
   ```
   https://your-app.vercel.app/api/skills
   ```
   Should return skills from MongoDB

3. **Job Stats API**
   ```
   https://your-app.vercel.app/api/jobs/stats
   ```
   Should return job statistics

4. **Job Aggregation** (may take up to 120 seconds)
   ```
   https://your-app.vercel.app/api/jobs/aggregate
   ```
   Fetches and stores jobs from job boards

## 📅 Scheduled Jobs (Cron)

Your `vercel.json` is already configured with:

```json
{
  "crons": [
    {
      "path": "/api/jobs/aggregate",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs daily at midnight UTC to refresh job data automatically.

## 🎛️ Vercel Dashboard

Access your project settings at:
```
https://vercel.com/your-username/workforce-pulse
```

### Key Sections:
- **Deployments** - View all deployments and their status
- **Settings → Environment Variables** - Manage env vars
- **Settings → Git** - Configure repository connection
- **Settings → Domains** - Add custom domains
- **Analytics** - Monitor traffic and performance
- **Logs** - View runtime logs and errors

## 🔧 Troubleshooting

### "MongoServerSelectionError"
**Problem:** Can't connect to MongoDB Atlas

**Solutions:**
1. Check MongoDB Atlas → Network Access
2. Ensure `0.0.0.0/0` is whitelisted
3. Verify connection string in Vercel environment variables
4. Check database user permissions

### "Environment variable not found"
**Problem:** Missing environment variables

**Solutions:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `MONGODB_URI` for all environments
3. Redeploy after adding variables

### "Function execution timeout"
**Problem:** `/api/jobs/aggregate` times out

**Solutions:**
1. This is normal on first run (can take up to 120s)
2. `vercel.json` already sets 120s timeout for this endpoint
3. Subsequent runs will be faster
4. Use the cron job for scheduled updates

### Build Errors
**Problem:** Build fails on Vercel

**Solutions:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Run `npm run build` locally to test
4. Check TypeScript errors: `npm run lint`

## 🌐 Production Environment Variables

The following are set in Vercel for production:

| Variable | Value | Purpose |
|----------|-------|---------|
| `MONGODB_URI` | MongoDB Atlas connection | Database connection |
| `NEXT_PUBLIC_USE_STUBS` | `false` | Use real database |
| *(Optional)* `NEXTAUTH_SECRET` | Generated secret | Auth security |
| *(Optional)* `NEXTAUTH_URL` | Your domain | Auth callback URL |

## 📱 Mobile & Edge

Vercel automatically:
- ✅ Deploys to global CDN (Edge Network)
- ✅ Optimizes for mobile devices
- ✅ Enables HTTPS by default
- ✅ Provides DDoS protection
- ✅ Compresses assets (images, JS, CSS)

## 🎉 Success Checklist

- [ ] Vercel CLI installed and logged in
- [ ] Project linked to Vercel
- [ ] GitHub repository connected
- [ ] Environment variables set (MONGODB_URI, NEXT_PUBLIC_USE_STUBS)
- [ ] MongoDB Atlas network access configured (0.0.0.0/0)
- [ ] First deployment successful
- [ ] APIs responding correctly
- [ ] Automatic deployment working on git push

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [MongoDB Atlas + Vercel](https://vercel.com/guides/deploying-nextjs-mongodb-atlas)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Ready to deploy?** Run `vercel --prod` or push to your main branch! 🚀
