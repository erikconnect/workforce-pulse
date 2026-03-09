/**
 * Hook: useScrapingStats
 * Fetches real-time scraping statistics showing:
 * - New jobs found
 * - Recurring jobs (already in database)
 * - Source breakdown
 * - Most scraped jobs
 */

import { useEffect, useState } from "react";

interface SourceStats {
  source: string;
  total: number;
  new: number;
  recurring: number;
  avgScrapedCount: number;
}

interface JobSummary {
  title: string;
  org: string;
  scrapedCount: number;
  source: string;
}

interface ScrapingStats {
  summary: {
    totalJobs: number;
    activeJobs: number;
    inactiveJobs: number;
    newJobs: number;
    recurringJobs: number;
    recursionRate: string;
  };
  sourceBreakdown: SourceStats[];
  topRecurring: JobSummary[];
  mostScraped: JobSummary[];
  lastScrapedAt: string | null;
}

interface UseScrapingStatsReturn {
  stats: ScrapingStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useScrapingStats(): UseScrapingStatsReturn {
  const [stats, setStats] = useState<ScrapingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/jobs/stats", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.error?.message || "Failed to fetch stats");
      }

      setStats(data.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[useScrapingStats] ❌", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
