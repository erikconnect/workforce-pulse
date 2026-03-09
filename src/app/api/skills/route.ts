/**
 * GET /api/skills
 *   Returns skills from the MongoDB database with real job demand data.
 *   Skills are enriched with extracted data from job postings.
 *
 *   Query params:
 *     category?: string
 *     status?:   "critical" | "watch" | "stable"
 *     search?:   string
 */

import { NextRequest, NextResponse } from "next/server";
import { jobStore } from "@/app/api/jobs/store";
import type { PulseStatus } from "@/services/types";
import { connectDB } from "@/lib/mongodb";
import SkillModel from "@/models/Skill";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";

/**
 * Map backend category to frontend display category
 */
function mapCategoryToFrontend(backendCategory: string, skillName: string): string {
  // Special mapping based on skill name for better categorization
  const lowerSkill = skillName.toLowerCase();
  
  if (lowerSkill.includes('aws') || lowerSkill.includes('azure') || 
      lowerSkill.includes('docker') || lowerSkill.includes('kubernetes') ||
      lowerSkill.includes('cloud') || lowerSkill.includes('devops')) {
    return 'Cloud Infrastructure';
  }
  
  if (lowerSkill.includes('data') || lowerSkill.includes('python') || 
      lowerSkill.includes('machine learning') || lowerSkill.includes('ai') ||
      lowerSkill.includes('analytics') || lowerSkill.includes('sql') ||
      lowerSkill.includes('modeling')) {
    return 'Data Science';
  }
  
  if (lowerSkill.includes('react') || lowerSkill.includes('javascript') ||
      lowerSkill.includes('typescript') || lowerSkill.includes('node') ||
      lowerSkill.includes('java') || lowerSkill.includes('programming') ||
      lowerSkill.includes('software') || lowerSkill.includes('development')) {
    return 'Software Development';
  }
  
  if (lowerSkill.includes('safety') || lowerSkill.includes('osha') ||
      lowerSkill.includes('compliance') || lowerSkill.includes('cpr') ||
      lowerSkill.includes('certification')) {
    return 'Safety Compliance';
  }

  if (lowerSkill.includes('nursing') || lowerSkill.includes('patient') ||
      lowerSkill.includes('medical') || lowerSkill.includes('healthcare') ||
      lowerSkill.includes('clinical')) {
    return 'Healthcare';
  }

  if (lowerSkill.includes('leadership') || lowerSkill.includes('management') ||
      lowerSkill.includes('project') || lowerSkill.includes('team') ||
      lowerSkill.includes('planning')) {
    return 'Leadership';
  }

  // Default category mapping
  const categoryMap: Record<string, string> = {
    'technical': 'Cloud Infrastructure',
    'soft': 'Leadership',
    'certification': 'Safety Compliance',
    'tool': 'Operations',
    'healthcare': 'Healthcare',
    'cloud': 'Cloud Infrastructure',
    'data-science': 'Data Science',
    'software-development': 'Software Development',
    'leadership': 'Leadership',
    'operations': 'Operations',
    'safety': 'Safety Compliance',
    'other': 'Operations'
  };

  return categoryMap[backendCategory] || 'Operations';
}

function inferDemandLevel(count: number): PulseStatus {
  if (count >= 10) return "critical";
  if (count >= 4) return "watch";
  return "stable";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") as PulseStatus | null;
  const search = searchParams.get("search");

  try {
    if (USE_STUBS) {
      // Return empty array for stub mode
      return NextResponse.json([]);
    }

    // Fetch skills from MongoDB directly
    await connectDB();
    
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    let skills = await SkillModel.find(query).limit(100).lean();

    // Map backend categories to frontend categories
    skills = skills.map((skill: any) => ({
      ...skill,
      category: mapCategoryToFrontend(skill.category || 'other', skill.name),
    }));

    // Enrich with live job counts from extracted skills
    try {
      const jobs = await jobStore.getAll();
      const skillFreq = new Map<string, number>();

      for (const job of jobs) {
        for (const skill of job.extractedSkills ?? []) {
          const key = skill.toLowerCase().trim();
          skillFreq.set(key, (skillFreq.get(key) ?? 0) + 1);
        }
      }

      // Update job counts and recalculate demand levels based on real data
      skills = skills.map((skill: any) => {
        const count = skillFreq.get(skill.name.toLowerCase()) ?? skill.jobCount ?? 0;
        return {
          ...skill,
          jobCount: count,
          demandLevel: count > 0 ? inferDemandLevel(count) : skill.demandLevel,
        };
      });
    } catch (err) {
      console.error("Error enriching skills with job counts:", err);
      // Continue with backend skills data even if job enrichment fails
    }

    // Apply frontend filters after mapping
    if (category && category !== "All") {
      skills = skills.filter((s: any) => s.category === category);
    }
    if (status && status !== "all") {
      skills = skills.filter((s: any) => s.demandLevel === status);
    }

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);

    // Fallback: Return skills aggregated directly from job postings
    try {
      const jobs = await jobStore.getAll();
      const skillFreq = new Map<string, number>();

      for (const job of jobs) {
        for (const skill of job.extractedSkills ?? []) {
          const key = skill.toLowerCase().trim();
          skillFreq.set(key, (skillFreq.get(key) ?? 0) + 1);
        }
      }

      const skills = Array.from(skillFreq.entries())
        .map(([name, count]) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          category: mapCategoryToFrontend('other', name),
          demandLevel: inferDemandLevel(count),
          jobCount: count,
          growthRate: 0,
          sparklineData: [],
          relatedRoles: [],
          trainingResources: [],
        }))
        .sort((a, b) => b.jobCount - a.jobCount);

      // Apply filters
      let filtered = skills;
      if (category && category !== "All") {
        filtered = filtered.filter((s) => s.category === category);
      }
      if (status && status !== "all") {
        filtered = filtered.filter((s) => s.demandLevel === status);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((s) => s.name.toLowerCase().includes(q));
      }

      return NextResponse.json(filtered);
    } catch (fallbackError) {
      console.error("Fallback skills aggregation failed:", fallbackError);
      return NextResponse.json({ error: "Failed to fetch skills data" }, { status: 500 });
    }
  }
}
