# 🔌 Integration Documentation

This folder contains documentation for external services and API integrations.

## 📚 Integration Guides

### [Bright Data Crawl API](brightdata-crawl-api.md)
Job scraping with Bright Data:
- Crawl API setup
- Scraping Browser configuration
- Job source integration (LinkedIn, Indeed, Glassdoor)
- Rate limits and best practices
- Error handling

### [Scraping Setup](scraping-setup.md)
Complete job scraping configuration:
- Multi-source setup (Indeed, LinkedIn, etc.)
- Environment variables
- Testing scraping endpoints
- Debugging scraping issues
- Data transformation

### [Claims Validation](claims-validation.md)
Application claims processing:
- Claims validation rules
- Verification workflows
- Error handling
- Integration with application system

### [Application Claims Evaluator](application-claims-evaluator.md)
Claims evaluation system:
- Evaluation criteria
- Scoring algorithms
- Decision workflows
- Reporting and analytics

## 🎯 Integration Quick Reference

### Job Scraping
Primary job scraping is done through Bright Data:
- **Setup Guide**: [Bright Data Crawl API](brightdata-crawl-api.md)
- **Configuration**: [Scraping Setup](scraping-setup.md)
- **Database Design**: [../development/mongodb-job-tracking.md](../development/mongodb-job-tracking.md)

### Additional Data Sources
- **JobAps RSS** - City of Montgomery official job listings
- **USAJOBS API** - Federal government positions
- **ArcGIS FeatureServers** - Workforce and civic data

### Application Processing
- [Claims Validation](claims-validation.md) - Validation rules
- [Application Claims Evaluator](application-claims-evaluator.md) - Evaluation system

## 🔧 Common Tasks

### Setting Up Job Scraping
1. Configure Bright Data credentials in `.env.local`
2. Review [Scraping Setup](scraping-setup.md)
3. Test with the crawl runner UI
4. Monitor scraping stats in dashboard

### Troubleshooting Integrations
- Check `.env.local` for correct API keys
- Review [Integration Status](../development/integration-status.md)
- Enable stub mode for testing: `NEXT_PUBLIC_USE_STUBS=true`
- Check API rate limits and quotas

## 🔗 Related Documentation

- **Architecture** → [../architecture/data-sources.md](../architecture/data-sources.md)
- **Development** → [../development/](../development/)
- **Deployment** → [../deployment/](../deployment/)

---

[← Back to Documentation Home](../README.md)
