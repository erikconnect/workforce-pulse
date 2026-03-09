/**
 * GET /api/jobs/stats
 * Get detailed scraping statistics from MongoDB
 * Returns counts of new vs existing/recurring jobs
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JobPostingModel from "@/models/JobPosting";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";

export async function GET() {
  try {
    if (USE_STUBS) {
      return NextResponse.json({
        totalJobs: 0,
        newJobs: 0,
        existingJobs: 0,
        recurringJobs: 0,
        sources: {},
      });
    }

    await connectDB();

    const totalJobs = await JobPostingModel.countDocuments();
    const newJobs = await JobPostingModel.countDocuments({ scrapedCount: 1 });
    const recurringJobs = await JobPostingModel.countDocuments({ scrapedCount: { $gt: 1 } });
    
    // Get job counts by source
    const sourceStats = await JobPostingModel.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      }
    ]);

    const sources = sourceStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalJobs,
      newJobs,
      existingJobs: totalJobs - newJobs,
      recurringJobs,
      sources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Stats API] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
