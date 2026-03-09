/**
 * Scraping Statistics Dashboard
 * Shows new jobs, recurring jobs, and source breakdown
 */

"use client";

import { useScrapingStats } from "@/hooks/use-scraping-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrapingStatsCard() {
  const { stats, isLoading, error, refetch } = useScrapingStats();

  if (error && !stats) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Scraping Stats Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-red-700 text-sm">
          {error}
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  stats?.summary.totalJobs || 0
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              New Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  stats?.summary.newJobs || 0
                )}
              </div>
              <TrendingUp className="w-4 h-4 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Recurring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  stats?.summary.recurringJobs || 0
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {stats?.summary.recursionRate || "0%"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Last Scraped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : stats?.lastScrapedAt ? (
                new Date(stats.lastScrapedAt).toLocaleTimeString()
              ) : (
                "Never"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      {stats?.sourceBreakdown && stats.sourceBreakdown.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">
              Source Breakdown
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.sourceBreakdown.map((source) => (
                <div key={source.source} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium capitalize">
                      {source.source}
                    </span>
                    <Badge variant="outline">
                      {source.total} total
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      {source.new} new
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {source.recurring} recurring
                    </Badge>
                    <span className="text-gray-500">
                      avg: {source.avgScrapedCount}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Scraped Jobs */}
      {stats?.mostScraped && stats.mostScraped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Frequently Found Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.mostScraped.map((job, idx) => (
                <div key={idx} className="flex justify-between items-start border-b pb-2 last:border-0">
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-gray-500 text-xs">{job.org}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {job.scrapedCount}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
