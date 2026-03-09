# 🚀 Deployment Documentation

This folder contains guides for deploying and maintaining Workforce Pulse in production.

## 📚 Deployment Guides

### [Database Setup](database-setup.md)
MongoDB configuration:
- Database provisioning
- Connection strings
- Index creation
- Backup strategies
- Security best practices

### [Deployment Checklist](deployment-checklist.md)
Pre-deployment verification:
- Environment variables check
- Build validation
- Database migrations
- Performance testing
- Security audit
- Monitoring setup

### [Vercel Setup](vercel-setup.md)
Deploying to Vercel:
- Project configuration
- Environment variables
- Custom domains
- Build settings
- Deployment previews
- Production deployment

## 🎯 Deployment Quick Start

### First Time Deployment

1. **Database Setup**
   - Follow [Database Setup](database-setup.md)
   - Configure MongoDB Atlas or your database provider
   - Create indexes and initial data

2. **Environment Variables**
   - Copy all variables from `.env.local`
   - Set them in Vercel dashboard
   - Verify API keys are valid

3. **Pre-Deployment Check**
   - Run through [Deployment Checklist](deployment-checklist.md)
   - Test build locally: `npm run build`
   - Run tests: `npm test`

4. **Deploy**
   - Follow [Vercel Setup](vercel-setup.md)
   - Deploy to preview first
   - Verify everything works
   - Promote to production

### Updating an Existing Deployment

1. Test changes locally
2. Create pull request
3. Verify preview deployment
4. Merge to main branch
5. Monitor production deployment
6. Verify in production

## ⚙️ Environment Configuration

### Required Environment Variables

**Frontend (.env.local → Vercel)**
- `NEXT_PUBLIC_USE_STUBS` - Set to `false` for production
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `BRIGHT_DATA_BROWSER_WSS` - Bright Data endpoint
- `NEXT_PUBLIC_ARCGIS_*` - ArcGIS data sources
- `JOBAPS_RSS_URL` - Montgomery jobs feed

**Backend**
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Authentication secret
- `NODE_ENV` - Set to `production`
- API keys for external services

See [../getting-started/setup.md](../getting-started/setup.md) for complete variable list.

## 🔒 Security Checklist

- [ ] All API keys in environment variables (never in code)
- [ ] Database has authentication enabled
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated and scanned

## 📊 Monitoring

After deployment, monitor:
- Application performance (Vercel Analytics)
- Database performance (MongoDB Atlas)
- Error rates (check logs)
- API usage and quotas
- Job scraping success rates

## 🔗 Related Documentation

- **Getting Started** → [../getting-started/setup.md](../getting-started/setup.md)
- **Architecture** → [../architecture/overview.md](../architecture/overview.md)
- **Development** → [../development/](../development/)

---

[← Back to Documentation Home](../README.md)
