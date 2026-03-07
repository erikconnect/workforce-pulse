/**
 * Hook: useScrapeJobs
 * Automatically triggers job scraping on mount
 * Shows loading state while scraping
 */

import { useEffect, useState } from "react";

interface ScrapeStatus {
  isLoading: boolean;
  lastScrapeAt: string | null;
  totalJobs: number;
  error: string | null;
}

export function useScrapeJobs() {
  const [status, setStatus] = useState<ScrapeStatus>({
    isLoading: false,
    lastScrapeAt: null,
    totalJobs: 0,
    error: null,
  });

  useEffect(() => {
    // Trigger background scrape on mount
    const triggerScrape = async () => {
      try {
        setStatus((prev) => ({ ...prev, isLoading: true, error: null }));
        
        const response = await fetch("/api/jobs", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        setStatus({
          isLoading: false,
          lastScrapeAt: data.cache?.lastScrapeAt 
            ? new Date(data.cache.lastScrapeAt).toLocaleString()
            : null,
          totalJobs: data.count ?? 0,
          error: null,
        });

        console.log("[useScrapeJobs] ✅ Cache status:", data.cache);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[useScrapeJobs] ❌", errorMsg);
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    triggerScrape();
  }, []);

  return status;
}
