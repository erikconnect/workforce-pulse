/**
 * Job store with MongoDB backend integration.
 * Calls the Express + MongoDB backend API to persist job postings.
 * Strict backend mode: no in-memory fallback when USE_STUBS=false.
 */

import type { JobPosting, JobInsights } from "@/services/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";

class JobStore {
  private postings = new Map<string, JobPosting>();
  private cachedInsights: JobInsights | null = null;
  private useBackend = !USE_STUBS;

  async upsert(posting: JobPosting): Promise<void> {
    if (this.useBackend) {
      const res = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(posting),
      });
      if (!res.ok) throw new Error(`Backend upsert failed: ${res.status}`);
    } else {
      this.postings.set(posting.id, posting);
    }
    this.cachedInsights = null;
  }

  async bulkUpsert(postings: JobPosting[]): Promise<void> {
    if (this.useBackend) {
      const res = await fetch(`${API_URL}/jobs/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: postings }),
      });
      if (!res.ok) throw new Error(`Backend bulk upsert failed: ${res.status}`);
    } else {
      postings.forEach(p => this.postings.set(p.id, p));
    }
    this.cachedInsights = null;
  }

  async getAll(): Promise<JobPosting[]> {
    if (this.useBackend) {
      const res = await fetch(`${API_URL}/jobs?limit=1000`);
      if (!res.ok) throw new Error(`Backend fetch failed: ${res.status}`);
      const data = await res.json();
      return data.data?.jobs || [];
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
      const res = await fetch(`${API_URL}/jobs/insights`);
      if (!res.ok) throw new Error(`Backend insights failed: ${res.status}`);
      const data = await res.json();
      return data.data?.totalPostings || 0;
    }
    return this.postings.size;
  }

  async clear(): Promise<void> {
    if (this.useBackend) {
      try {
        const res = await fetch(`${API_URL}/jobs`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Backend clear failed: ${res.status}`);
      } catch (err) {
        console.error("⚠️ Backend clear failed:", err);
      }
    }
    this.postings.clear();
    this.cachedInsights = null;
  }
}

// Singleton — shared across all API route invocations in the same Node process
export const jobStore = new JobStore();
