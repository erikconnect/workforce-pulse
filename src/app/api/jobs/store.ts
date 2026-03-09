/**
 * Job store with direct MongoDB integration for Vercel deployment.
 * Uses direct Mongoose models instead of calling Express backend.
 * Tracks new vs updated jobs and returns detailed statistics.
 */

import type { JobPosting, JobInsights } from "@/services/types";
import { connectDB } from "@/lib/mongodb";
import JobPostingModel from "@/models/JobPosting";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";

export interface BulkUpsertStats {
  newJobs: number;
  updatedJobs: number;
  reoccurringJobs: number;
  totalProcessed: number;
  uniqueCount: number;
  timestamp: string;
}

class JobStore {
  private postings = new Map<string, JobPosting>();
  private cachedInsights: JobInsights | null = null;
  private useBackend = !USE_STUBS;
  private lastBulkStats: BulkUpsertStats | null = null;

  async upsert(posting: JobPosting): Promise<void> {
    if (this.useBackend) {
      await connectDB();
      
      const existing = await JobPostingModel.findOne({ id: posting.id });
      
      if (existing) {
        await JobPostingModel.updateOne(
          { id: posting.id },
          {
            $set: {
              ...posting,
              lastScrapedAt: new Date(),
            },
            $inc: { scrapedCount: 1 },
          }
        );
      } else {
        await JobPostingModel.create({
          ...posting,
          scrapedCount: 1,
          firstScrapedAt: new Date(),
          lastScrapedAt: new Date(),
          isActive: true,
        });
      }
    } else {
      this.postings.set(posting.id, posting);
    }
    this.cachedInsights = null;
  }

  async bulkUpsert(postings: JobPosting[]): Promise<BulkUpsertStats | null> {
    if (postings.length === 0) {
      this.lastBulkStats = {
        newJobs: 0,
        updatedJobs: 0,
        reoccurringJobs: 0,
        totalProcessed: 0,
        uniqueCount: 0,
        timestamp: new Date().toISOString(),
      };
      return this.lastBulkStats;
    }

    if (this.useBackend) {
      await connectDB();
      
      let newCount = 0;
      let updatedCount = 0;
      let reoccurringCount = 0;

      for (const posting of postings) {
        const existing = await JobPostingModel.findOne({ id: posting.id });
        
        if (existing) {
          const scrapedCount = (existing.scrapedCount || 0) + 1;
          if (scrapedCount > 1) {
            reoccurringCount++;
          }
          
          await JobPostingModel.updateOne(
            { id: posting.id },
            {
              $set: {
                ...posting,
                lastScrapedAt: new Date(),
              },
              $inc: { scrapedCount: 1 },
            }
          );
          updatedCount++;
        } else {
          await JobPostingModel.create({
            ...posting,
            scrapedCount: 1,
            firstScrapedAt: new Date(),
            lastScrapedAt: new Date(),
            isActive: true,
          });
          newCount++;
        }
      }

      this.lastBulkStats = {
        newJobs: newCount,
        updatedJobs: updatedCount,
        reoccurringJobs: reoccurringCount,
        totalProcessed: postings.length,
        uniqueCount: postings.length,
        timestamp: new Date().toISOString(),
      };
      return this.lastBulkStats;
    } else {
      postings.forEach(p => this.postings.set(p.id, p));
    }
    this.cachedInsights = null;
    return null;
  }

  getLastBulkStats(): BulkUpsertStats | null {
    return this.lastBulkStats;
  }

  async getAll(): Promise<JobPosting[]> {
    if (this.useBackend) {
      await connectDB();
      const jobs = await JobPostingModel.find().limit(1000).lean();
      return jobs.map(job => ({
        id: job.id,
        title: job.title,
        org: job.org,
        location: job.location,
        postedDate: job.postedDate,
        description: job.description,
        source: job.source as any,
        url: job.url,
        sectorId: job.sectorId,
        extractedSkills: job.extractedSkills || [],
        salary: job.salary,
        jobType: job.jobType as any,
      }));
    }
    return Array.from(this.postings.values());
  }

  setInsights(insights: JobInsights): void {
    this.cachedInsights = insights;
  }

  getInsights(): JobInsights | null {
    return this.cachedInsights;
  }

  async count(): Promise<number> {
    if (this.useBackend) {
      await connectDB();
      return await JobPostingModel.countDocuments();
    }
    return this.postings.size;
  }

  async clear(): Promise<void> {
    if (this.useBackend) {
      try {
        await connectDB();
        await JobPostingModel.deleteMany({});
      } catch (err) {
        console.error("⚠️ Database clear failed:", err);
      }
    }
    this.postings.clear();
    this.cachedInsights = null;
  }
}

// Singleton — shared across all API route invocations in the same Node process
export const jobStore = new JobStore();
