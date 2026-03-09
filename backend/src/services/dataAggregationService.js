/**
 * Data Aggregation Service
 * Fetches job postings from all configured sources and stores in MongoDB
 * Sources: JobAps RSS, USAJOBS API, Bright Data, ArcGIS
 */

import axios from 'axios';
import Parser from 'rss-parser';
import JobPosting from '../models/JobPosting.js';
import CacheMetadata from '../models/CacheMetadata.js';

const parser = new Parser();
const SOURCES = {
  JOBAPS: 'jobaps',
  USAJOBS: 'usajobs',
  BRIGHT_DATA: 'indeed',
  LINKEDIN: 'linkedin',
};

/**
 * Fetch jobs from JobAps RSS feed
 */
async function fetchJobApsJobs() {
  try {
    const url = process.env.JOBAPS_RSS_URL;
    if (!url) {
      console.warn('⚠️  JOBAPS_RSS_URL not configured');
      return [];
    }

    const feed = await parser.parseURL(url);
    const jobs = [];

    feed.items.forEach((item) => {
      if (!item.title || !item.link) return;

      const description = item.content || item.description || '';
      const [org, ...titleParts] = item.title.split('-').map(s => s.trim());
      
      jobs.push({
        id: `jobaps-${Buffer.from(item.link).toString('base64').slice(0, 20)}`,
        title: titleParts.join('-').trim() || item.title,
        org: org || 'Montgomery Government',
        location: 'Montgomery, AL',
        postedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        description: description.substring(0, 2000),
        source: SOURCES.JOBAPS,
        url: item.link,
        extractedSkills: extractSkillsFromText(description),
        jobType: 'full-time',
        isActive: true,
      });
    });

    console.log(`✅ Fetched ${jobs.length} jobs from JobAps RSS`);
    return jobs;
  } catch (error) {
    console.error('❌ Error fetching JobAps RSS:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from USAJOBS API
 */
async function fetchUSAJobsJobs() {
  try {
    const apiKey = process.env.USAJOBS_API_KEY;
    const userAgent = process.env.USAJOBS_USER_AGENT;
    
    if (!apiKey || !userAgent) {
      console.warn('⚠️  USAJOBS_API_KEY or USAJOBS_USER_AGENT not configured');
      return [];
    }

    const response = await axios.get('https://data.usajobs.gov/api/search', {
      headers: {
        'Authorization-Key': apiKey,
        'User-Agent': userAgent,
      },
      params: {
        LocationName: 'Montgomery, AL',
        ResultsPerPage: 500,
        JobCategoryCode: 'ADMIN,CUST-SER,GENERAL,INVEST,SUPP,WRITING,HR,FINANCE',
      },
      timeout: 15000,
    });

    const jobs = [];
    const positions = response.data?.SearchResult?.SearchResultItems || [];

    positions.forEach((item) => {
      const position = item.MatchedObjectDescriptor;
      if (!position) return;

      const description = position.JobSummary || position.JobDescription || '';
      const salary = position.PositionRemuneration?.[0];
      
      jobs.push({
        id: `usajobs-${position.PositionID}`,
        title: position.JobTitle,
        org: position.OrganizationName,
        location: position.JobGrade?.[0]?.Code || 'Montgomery, AL',
        postedDate: new Date(position.PublicationStartDate),
        description: description.substring(0, 2000),
        source: SOURCES.USAJOBS,
        url: position.ApplyURI?.[0] || '',
        salary: salary ? `${salary.RangeFrom}-${salary.RangeTo} ${salary.CurrencyCode}` : undefined,
        extractedSkills: extractSkillsFromText(description),
        jobType: 'full-time',
        isActive: true,
      });
    });

    console.log(`✅ Fetched ${jobs.length} jobs from USAJOBS`);
    return jobs;
  } catch (error) {
    console.error('❌ Error fetching USAJOBS:', error.message);
    return [];
  }
}

/**
 * Fetch and process Indeed jobs via Bright Data (manual trigger)
 * Called by scraping endpoint, not directly here
 */
async function processBrightDataJobs(jobs) {
  try {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return [];
    }

    const processed = jobs.map((job) => {
      const description = job.description || job.jobDescription || '';
      return {
        id: `indeed-${Buffer.from(job.url || '').toString('base64').slice(0, 20)}`,
        title: job.jobTitle || job.title,
        org: job.companyName,
        location: job.location || 'Montgomery, AL',
        postedDate: job.postedDate ? new Date(job.postedDate) : new Date(),
        description: description.substring(0, 2000),
        source: SOURCES.BRIGHT_DATA,
        url: job.url,
        salary: job.salary,
        extractedSkills: extractSkillsFromText(description),
        jobType: job.jobType || 'full-time',
        isActive: true,
      };
    });

    return processed;
  } catch (error) {
    console.error('❌ Error processing Bright Data jobs:', error.message);
    return [];
  }
}

/**
 * Sector mapping based on job title/description
 */
function mapToSector(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  const sectorMap = {
    'public-safety': ['police', 'fire', 'emergency', 'public-safety', 'law enforcement', 'emt', 'firefighter'],
    'healthcare': ['nurse', 'doctor', 'medical', 'health', 'hospital', 'physician', 'surgeon', 'therapist'],
    'technology': ['software', 'developer', 'engineer', 'it ', 'tech', 'programmer', 'data', 'analyst', 'system'],
    'construction': ['construction', 'carpenter', 'electrician', 'plumber', 'hvac', 'builder', 'contractor'],
    'education': ['teacher', 'professor', 'instructor', 'academic', 'school', 'university', 'college', 'education'],
    'logistics': ['warehouse', 'truck', 'driver', 'logistics', 'shipping', 'delivery', 'supply', 'fulfillment'],
    'retail': ['retail', 'cashier', 'store', 'customer service', 'sales associate', 'restaurant', 'food'],
    'finance': ['accountant', 'finance', 'bank', 'insurance', 'broker', 'analyst', 'cpa'],
  };

  for (const [sectorId, keywords] of Object.entries(sectorMap)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return sectorId;
    }
  }
  
  return null;
}

/**
 * Extract skills from job description text
 */
function extractSkillsFromText(text) {
  if (!text) return [];
  
  const textLower = text.toLowerCase();
  const skillKeywords = [
    // Technical
    'python', 'javascript', 'java', 'c++', 'sql', 'react', 'node.js', 'typescript',
    'aws', 'azure', 'docker', 'kubernetes', 'jenkins', 'linux', 'windows',
    'rest api', 'graphql', 'mongodb', 'postgresql', 'mysql',
    
    // Healthcare
    'nursing', 'patient care', 'electronic health records', 'ehr', 'medication',
    'venipuncture', 'triage', 'vital signs', 'cpr', 'bls',
    
    // Soft Skills
    'problem solving', 'communication', 'leadership', 'teamwork', 'project management',
    'time management', 'critical thinking', 'adaptability', 'attention to detail',
    
    // Domain
    'sales', 'customer service', 'data analysis', 'machine learning', 'ai',
    'cloud computing', 'cybersecurity', 'devops', 'network', 'database',
  ];

  const found = [];
  const seen = new Set();

  skillKeywords.forEach(skill => {
    if (textLower.includes(skill.toLowerCase()) && !seen.has(skill)) {
      found.push(skill);
      seen.add(skill);
    }
  });

  return found;
}

/**
 * Bulk upsert jobs to database
 */
async function upsertJobsToDatabase(jobs) {
  try {
    if (jobs.length === 0) {
      console.log('ℹ️  No jobs to upsert');
      return { inserted: 0, updated: 0 };
    }

    // Map sector IDs before bulk operation
    const jobsWithSectors = jobs.map(job => ({
      ...job,
      sectorId: job.sectorId || mapToSector(job.title, job.description),
    }));

    // Find existing jobs
    const jobIds = jobsWithSectors.map(j => j.id);
    const existing = await JobPosting.find({ id: { $in: jobIds } });
    const existingIds = new Set(existing.map(j => j.id));

    const bulkOps = jobsWithSectors.map(job => ({
      updateOne: {
        filter: { id: job.id },
        update: {
          $set: job,
          // Increment on every scrape; inserts start at 1 naturally.
          $inc: { scrapedCount: 1 },
          $setOnInsert: {
            firstScrapedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await JobPosting.bulkWrite(bulkOps);
    
    const stats = {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    };

    console.log(`✅ Database upsert complete: ${stats.inserted} inserted, ${stats.updated} updated`);
    return stats;
  } catch (error) {
    console.error('❌ Error upserting jobs:', error.message);
    throw error;
  }
}

/**
 * Update cache metadata
 */
async function updateCacheMetadata(source, stats) {
  try {
    await CacheMetadata.findOneAndUpdate(
      // Keep one jobs metadata document to remain compatible with legacy unique dataType index.
      { dataType: 'jobs' },
      {
        key: 'jobs',
        dataType: 'jobs',
        source,
        lastFetched: new Date(),
        lastUpdated: new Date(),
        recordCount: stats.inserted + stats.updated,
        jobsCount: stats.inserted + stats.updated,
        status: 'success',
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('❌ Error updating cache metadata:', error.message);
  }
}

/**
 * Main aggregation function - fetch from all sources
 */
export async function aggregateAllJobs() {
  console.log('\n🔄 Starting data aggregation...');
  const startTime = Date.now();

  try {
    const allJobs = [];

    // Fetch from all sources
    const jobapsJobs = await fetchJobApsJobs();
    allJobs.push(...jobapsJobs);

    const usajobsJobs = await fetchUSAJobsJobs();
    allJobs.push(...usajobsJobs);

    console.log(`\n📊 Total jobs collected: ${allJobs.length}`);

    // Upsert all to database
    const stats = await upsertJobsToDatabase(allJobs);

    // Update cache metadata for each source
    if (jobapsJobs.length > 0) {
      await updateCacheMetadata(SOURCES.JOBAPS, { inserted: stats.inserted / 2, updated: stats.updated / 2 });
    }
    if (usajobsJobs.length > 0) {
      await updateCacheMetadata(SOURCES.USAJOBS, { inserted: stats.inserted / 2, updated: stats.updated / 2 });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Data aggregation complete in ${duration}s\n`);

    return {
      success: true,
      duration,
      jobsCollected: allJobs.length,
      ...stats,
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ Data aggregation failed after ${duration}s:`, error.message);
    throw error;
  }
}

/**
 * Fetch aggregation status
 */
export async function getAggregationStatus() {
  try {
    const totalJobs = await JobPosting.countDocuments();
    const jobsBySource = await JobPosting.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    const cacheMetadata = await CacheMetadata.find();
    
    return {
      totalJobs,
      jobsBySource,
      cacheMetadata,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching aggregation status:', error.message);
    throw error;
  }
}

export { SOURCES };
