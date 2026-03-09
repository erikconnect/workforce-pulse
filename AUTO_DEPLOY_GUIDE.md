# 🎯 Auto-Deploy Setup (GitHub → Vercel)

## ✅ You're Already Connected!

Since your GitHub repository is already synced with Vercel, deployment is automatic. Every push to your main branch will trigger a new deployment!

## 🚀 Deploy Now (2 Simple Steps)

### Step 1: Add Environment Variables to Vercel

**Important:** Make sure these are set in your Vercel Dashboard:

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **workforce-pulse** project
3. Click **Settings** → **Environment Variables**
4. Add the following:

#### MONGODB_URI
```
mongodb+srv://erik_db_user:G39w8HLfqcQiHSef@workforce-pulse.incefrw.mongodb.net/workforce-pulse?retryWrites=true&w=majority&appName=Workforce-pulse
```
- ☑️ Check **Production**
- ☑️ Check **Preview**
- ☑️ Check **Development**
- Click **Save**

#### NEXT_PUBLIC_USE_STUBS
```
false
```
- ☑️ Check **Production**
- ☑️ Check **Preview**
- ☑️ Check **Development**
- Click **Save**

### Step 2: Push to GitHub

That's it! Just push your code:

#### Option A: Use the Quick Script
```powershell
.\push-to-deploy.ps1
```

#### Option B: Manual Git Commands
```bash
git add .
git commit -m "Configure MongoDB Atlas for production"
git push origin main
```

**Vercel will automatically:**
- ✅ Detect your push
- ✅ Build your application
- ✅ Run tests (if configured)
- ✅ Deploy to production
- ✅ Send you a notification
- ✅ Update your deployment URL

## 📊 Monitor Deployment

### Watch Live Progress

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **workforce-pulse** project
3. Check the **Deployments** tab
4. Click on the latest deployment to see:
   - Build logs
   - Function logs
   - Deployment preview
   - Performance metrics

### Deployment Status

You'll see:
- 🟡 **Building** - Compiling your code
- 🟡 **Deploying** - Uploading to edge network
- 🟢 **Ready** - Live and accessible!
- 🔴 **Error** - Check logs for details

Typical deployment time: **2-3 minutes**

## 🔍 Verify Environment Variables

Before your first deployment, verify your env vars are set:

1. Go to **Settings** → **Environment Variables** in Vercel
2. You should see:
   - ✅ `MONGODB_URI` (for Production, Preview, Development)
   - ✅ `NEXT_PUBLIC_USE_STUBS` (for Production, Preview, Development)

3. If they're missing, click **Add Variable** and add them now

**Note:** If you add environment variables after deployment, you'll need to trigger a redeploy:
- Go to **Deployments** tab
- Find latest deployment
- Click **⋯** (three dots)
- Click **Redeploy**

## ⚠️ MongoDB Atlas Network Access

**Critical:** Make sure Vercel can reach your database:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select **workforce-pulse** cluster
3. Click **Network Access** (in sidebar)
4. Make sure `0.0.0.0/0` is in the IP Access List
5. If not, click **Add IP Address**:
   - Select **Allow Access from Anywhere**
   - Or enter: `0.0.0.0/0`
   - Add description: "Vercel deployment"
   - Click **Confirm**

## 🎉 Your Deployment Workflow

From now on, deploying is as simple as:

```bash
# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Your commit message"
git push origin main

# Vercel deploys automatically! 🚀
```

Or use the quick script:
```powershell
.\push-to-deploy.ps1
```

## 🌲 Branch Deployments

Vercel also creates preview deployments for other branches:

- **main branch** → Production deployment
- **other branches** → Preview deployments
- **Pull Requests** → Preview deployments with unique URLs

Example workflow:
```bash
# Create a feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Vercel creates a preview URL
# Test it, then merge to main for production
```

## 📱 Deployment Notifications

Vercel can notify you about deployments via:

1. **GitHub Checks** ✅ (Already enabled)
   - See deployment status in commits
   - Preview URLs in pull requests

2. **Email** (Optional)
   - Go to Account Settings → Notifications
   - Enable email notifications

3. **Slack/Discord** (Optional)
   - Go to Project Settings → Integrations
   - Connect your workspace

## 🧪 Test After Deployment

Once deployed, test these endpoints:

1. **Home Page**
   ```
   https://your-app.vercel.app
   ```

2. **Skills API**
   ```
   https://your-app.vercel.app/api/skills
   ```

3. **Job Statistics**
   ```
   https://your-app.vercel.app/api/jobs/stats
   ```

4. **Job Aggregation** (may take 60-120 seconds)
   ```
   https://your-app.vercel.app/api/jobs/aggregate
   ```

## 🔧 Troubleshooting

### "Environment variable not found"

**Solution:** Add missing variables in Vercel Dashboard:
1. Settings → Environment Variables
2. Add `MONGODB_URI` and `NEXT_PUBLIC_USE_STUBS`
3. Redeploy

### "MongoServerSelectionError"

**Solution:** Check MongoDB Atlas Network Access:
1. Make sure `0.0.0.0/0` is whitelisted
2. Verify connection string is correct
3. Check database user permissions

### Build fails

**Solution:** Check build logs:
1. Go to Deployments
2. Click failed deployment
3. Check **Build Logs** tab
4. Fix errors locally
5. Push again

### "Function execution timed out"

**Solution:** 
- This is normal for `/api/jobs/aggregate` on first run
- `vercel.json` sets 120s timeout for this endpoint
- Subsequent runs are faster

## 📊 Your Configuration Summary

### GitHub → Vercel Connection
- ✅ Repository connected
- ✅ Auto-deploy enabled
- ✅ Branch previews enabled
- ✅ Commit status checks enabled

### MongoDB Atlas
- ✅ Cluster: `workforce-pulse.incefrw.mongodb.net`
- ✅ Database: `workforce-pulse`
- ✅ User: `erik_db_user`
- ⚠️ Network Access: Make sure `0.0.0.0/0` is whitelisted

### Vercel Configuration
- ✅ Framework: Next.js (auto-detected)
- ✅ Build: `npm run build`
- ✅ Output: `.next`
- ✅ Cron: Daily at midnight UTC (`/api/jobs/aggregate`)
- ✅ Timeouts: 60s default, 120s for job aggregation

### Environment Variables (Add to Vercel)
- ⚠️ `MONGODB_URI` - Add in Vercel Dashboard
- ⚠️ `NEXT_PUBLIC_USE_STUBS` - Add in Vercel Dashboard

## 🎯 Quick Commands

```bash
# Deploy to production (via GitHub)
git push origin main

# Create preview deployment
git checkout -b feature-name
git push origin feature-name

# View deployment logs
# → Go to Vercel Dashboard

# Redeploy (without changes)
# → Vercel Dashboard → Deployments → ⋯ → Redeploy
```

Or use the script:
```powershell
.\push-to-deploy.ps1
```

## 🎊 You're All Set!

Your deployment workflow is:

1. **Write code** ✍️
2. **Push to GitHub** 🚀
3. **Vercel deploys automatically** ✨
4. **Check deployment status** 📊
5. **Test live site** 🧪

---

**Ready?** Just run `.\push-to-deploy.ps1` or `git push origin main` to deploy! 🚀

**Don't forget:** Add environment variables in Vercel Dashboard first!
