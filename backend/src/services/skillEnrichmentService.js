/**
 * Skill Enrichment Service
 * Extracts skills from job descriptions and updates the Skill collection
 */

import JobPosting from '../models/JobPosting.js';
import Skill from '../models/Skill.js';
import CacheMetadata from '../models/CacheMetadata.js';

/**
 * Comprehensive skill thesaurus mapped to categories
 */
const SKILL_TAXONOMY = {
  technical: [
    // Languages
    { skill: 'python', synonyms: ['python', 'python 3', 'py'] },
    { skill: 'javascript', synonyms: ['javascript', 'js', 'node.js', 'nodejs'] },
    { skill: 'java', synonyms: ['java', 'jvm'] },
    { skill: 'typescript', synonyms: ['typescript', 'ts'] },
    { skill: 'c++', synonyms: ['c++', 'cpp', 'c plus plus'] },
    { skill: 'c#', synonyms: ['c#', 'csharp', 'c sharp'] },
    { skill: 'go', synonyms: ['go lang', 'golang'] },
    { skill: 'rust', synonyms: ['rust'] },
    { skill: 'ruby', synonyms: ['ruby', 'ruby on rails', 'rails'] },
    { skill: 'sql', synonyms: ['sql', 'postgresql', 'mysql', 'oracle sql', 'tsql'] },
    
    // Frontend
    { skill: 'react', synonyms: ['react', 'reactjs', 'react.js'] },
    { skill: 'vue', synonyms: ['vue', 'vuejs', 'vue.js'] },
    { skill: 'angular', synonyms: ['angular', 'angularjs', 'angular.js'] },
    { skill: 'html/css', synonyms: ['html', 'css', 'html5', 'css3', 'html/css'] },
    
    // Backend/Infrastructure
    { skill: 'aws', synonyms: ['aws', 'amazon web services', 'ec2', 's3'] },
    { skill: 'azure', synonyms: ['azure', 'microsoft azure', 'az'] },
    { skill: 'docker', synonyms: ['docker', 'containerization'] },
    { skill: 'kubernetes', synonyms: ['kubernetes', 'k8s', 'k8'] },
    { skill: 'linux', synonyms: ['linux', 'ubuntu', 'centos', 'rhel'] },
    { skill: 'windows server', synonyms: ['windows server', 'windows administration'] },
    { skill: 'devops', synonyms: ['devops', 'dev ops', 'deployment'] },
    { skill: 'cicd', synonyms: ['ci/cd', 'continuous integration', 'continuous deployment', 'jenkins', 'gitlab ci'] },
    
    // Databases
    { skill: 'mongodb', synonyms: ['mongodb', 'mongo'] },
    { skill: 'postgresql', synonyms: ['postgresql', 'postgres', 'psql'] },
    { skill: 'mysql', synonyms: ['mysql', 'mariadb'] },
    { skill: 'redis', synonyms: ['redis', 'memcached', 'caching'] },
    
    // APIs & Architecture
    { skill: 'rest api', synonyms: ['rest api', 'rest', 'restful', 'http api'] },
    { skill: 'graphql', synonyms: ['graphql'] },
    { skill: 'microservices', synonyms: ['microservices', 'micro services'] },
    { skill: 'soap', synonyms: ['soap', 'web services'] },
    
    // Data & AI
    { skill: 'machine learning', synonyms: ['machine learning', 'ml', 'deep learning'] },
    { skill: 'data science', synonyms: ['data science', 'data scientist'] },
    { skill: 'artificial intelligence', synonyms: ['artificial intelligence', 'ai', 'generative ai'] },
    { skill: 'big data', synonyms: ['big data', 'hadoop', 'spark', 'hive'] },
    { skill: 'tensorflow', synonyms: ['tensorflow', 'pytorch', 'keras'] },
    { skill: 'data analysis', synonyms: ['data analysis', 'analytics', 'business intelligence', 'bi'] },
  ],
  
  healthcare: [
    { skill: 'nursing', synonyms: ['nursing', 'registered nurse', 'rn', 'lvn', 'licensed practical nurse'] },
    { skill: 'patient care', synonyms: ['patient care', 'patient management', 'caregiving'] },
    { skill: 'electronic health records', synonyms: ['ehr', 'emr', 'electronic health records', 'epic', 'cerner'] },
    { skill: 'medication', synonyms: ['medication', 'pharmaceuticals', 'pharmacy', 'pharmacology'] },
    { skill: 'venipuncture', synonyms: ['venipuncture', 'phlebotomy', 'blood draw'] },
    { skill: 'cpr', synonyms: ['cpr', 'bls', 'acls', 'basic life support', 'advanced life support'] },
    { skill: 'medical terminology', synonyms: ['medical terminology', 'medical knowledge'] },
    { skill: 'iv therapy', synonyms: ['iv therapy', 'intravenous'] },
    { skill: 'wound care', synonyms: ['wound care', 'dressing'] },
  ],
  
  soft: [
    { skill: 'communication', synonyms: ['communication', 'written communication', 'verbal communication', 'interpersonal'] },
    { skill: 'leadership', synonyms: ['leadership', 'team leadership', 'management', 'managing teams'] },
    { skill: 'problem solving', synonyms: ['problem solving', 'analytical', 'critical thinking', 'troubleshooting'] },
    { skill: 'teamwork', synonyms: ['teamwork', 'collaboration', 'team player', 'cross-functional'] },
    { skill: 'project management', synonyms: ['project management', 'pmp', 'agile', 'scrum', 'kanban'] },
    { skill: 'time management', synonyms: ['time management', 'organization', 'organizational'] },
    { skill: 'customer service', synonyms: ['customer service', 'customer support', 'customer success', 'client management'] },
    { skill: 'adaptability', synonyms: ['adaptability', 'flexible', 'flexible learner', 'quick learner'] },
    { skill: 'attention to detail', synonyms: ['attention to detail', 'detail oriented', 'meticulous'] },
  ],
  
  tool: [
    { skill: 'excel', synonyms: ['excel', 'microsoft excel', 'spreadsheet'] },
    { skill: 'salesforce', synonyms: ['salesforce', 'crm', 'customer relationship management'] },
    { skill: 'sap', synonyms: ['sap', 'erp', 'enterprise resource planning'] },
    { skill: 'tableau', synonyms: ['tableau', 'power bi', 'qlik'] },
    { skill: 'jira', synonyms: ['jira', 'asana', 'monday.com', 'project management tool'] },
    { skill: 'slack', synonyms: ['slack', 'microsoft teams', 'communication platform'] },
    { skill: 'git', synonyms: ['git', 'github', 'gitlab', 'version control'] },
    { skill: 'design tools', synonyms: ['figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator'] },
  ],
  
  certification: [
    { skill: 'aws certified solutions architect', synonyms: ['aws certified', 'solutions architect'] },
    { skill: 'kubernetes administrator', synonyms: ['kubernetes administrator', 'ckad', 'cka'] },
    { skill: 'project management professional', synonyms: ['pmp', 'project management professional'] },
    { skill: 'six sigma', synonyms: ['six sigma', 'lean six sigma'] },
    { skill: 'cissp', synonyms: ['cissp', 'security certification'] },
    { skill: 'certified nursing assistant', synonyms: ['cna', 'certified nursing assistant'] },
  ],
};

/**
 * Normalize text to lowercase and remove special characters
 */
function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
}

function toSkillId(skill) {
  // Use base64url to avoid collisions like c / c++ / c# all normalizing to "c".
  return `skill-${Buffer.from(String(skill).toLowerCase(), 'utf8').toString('base64url')}`;
}

/**
 * Extract skills from job description using taxonomy
 */
export function extractSkillsFromJobDescription(jobTitle, description) {
  try {
    const text = normalizeText(`${jobTitle} ${description}`);
    const extracted = new Set();

    // Search through taxonomy
    for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
      skills.forEach(({ skill, synonyms }) => {
        // Check if any synonym is found in the text
        if (synonyms.some(syn => text.includes(normalizeText(syn)))) {
          extracted.add(skill);
        }
      });
    }

    return Array.from(extracted);
  } catch (error) {
    console.error('Error extracting skills:', error.message);
    return [];
  }
}

/**
 * Calculate skill demand levels based on job counts
 */
function calculateDemandLevel(count) {
  if (count >= 100) return 'critical';
  if (count >= 50) return 'watch';
  return 'stable';
}

/**
 * Get skill category
 */
function getSkillCategory(skill) {
  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    if (skills.some(s => s.skill === skill)) {
      return category;
    }
  }
  return 'other';
}

/**
 * Map backend category to frontend-friendly category
 */
function mapCategoryToFrontend(backendCategory, skillName) {
  const categoryMap = {
    'technical': 'Cloud Infrastructure', // Default for technical
    'soft': 'Leadership',
    'certification': 'Safety Compliance',
    'tool': 'Operations',
    'healthcare': 'Healthcare',
    'other': 'Operations'
  };

  // Special mapping based on skill name for better categorization
  const lowerSkill = skillName.toLowerCase();
  
  if (lowerSkill.includes('aws') || lowerSkill.includes('azure') || 
      lowerSkill.includes('docker') || lowerSkill.includes('kubernetes') ||
      lowerSkill.includes('cloud') || lowerSkill.includes('devops')) {
    return 'Cloud Infrastructure';
  }
  
  if (lowerSkill.includes('data') || lowerSkill.includes('python') || 
      lowerSkill.includes('machine learning') || lowerSkill.includes('ai') ||
      lowerSkill.includes('analytics') || lowerSkill.includes('sql')) {
    return 'Data Science';
  }
  
  if (lowerSkill.includes('react') || lowerSkill.includes('javascript') ||
      lowerSkill.includes('typescript') || lowerSkill.includes('node') ||
      lowerSkill.includes('java') || lowerSkill.includes('programming')) {
    return 'Software Development';
  }
  
  if (lowerSkill.includes('safety') || lowerSkill.includes('osha') ||
      lowerSkill.includes('compliance') || lowerSkill.includes('cpr')) {
    return 'Safety Compliance';
  }

  if (lowerSkill.includes('nursing') || lowerSkill.includes('patient') ||
      lowerSkill.includes('medical') || lowerSkill.includes('healthcare')) {
    return 'Healthcare';
  }

  if (lowerSkill.includes('leadership') || lowerSkill.includes('management') ||
      lowerSkill.includes('project') || lowerSkill.includes('team')) {
    return 'Leadership';
  }

  return categoryMap[backendCategory] || 'Operations';
}

/**
 * Enrich all jobs with extracted skills
 */
export async function enrichJobsWithSkills() {
  try {
    console.log('\n🔄 Starting skill extraction from job descriptions...');
    const startTime = Date.now();

    // Get all jobs without extracted skills or with old extraction
    const jobs = await JobPosting.find({ isActive: true });
    console.log(`Found ${jobs.length} active jobs to process`);

    let skillsExtractionCount = 0;

    for (const job of jobs) {
      const extractedSkills = extractSkillsFromJobDescription(job.title, job.description);
      
      if (extractedSkills.length > 0) {
        await JobPosting.updateOne(
          { _id: job._id },
          { $set: { extractedSkills } }
        );
        skillsExtractionCount++;
      }
    }

    console.log(`✅ Skill extraction complete: ${skillsExtractionCount} jobs updated`);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Duration: ${duration}s\n`);

    return {
      success: true,
      jobsProcessed: jobs.length,
      skillsExtracted: skillsExtractionCount,
      duration,
    };
  } catch (error) {
    console.error('❌ Error enriching jobs with skills:', error.message);
    throw error;
  }
}

/**
 * Calculate skill demand metrics and update Skill collection
 */
export async function calculateSkillDemand() {
  try {
    console.log('\n🔄 Calculating skill demand metrics...');
    const startTime = Date.now();

    // Aggregate skill counts from jobs
    const skillStats = await JobPosting.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$extractedSkills' },
      { $group: {
        _id: '$extractedSkills',
        count: { $sum: 1 },
        sectors: { $push: '$sectorId' },
        avgSalary: { $avg: '$salary' },
      }},
      { $sort: { count: -1 } },
    ]);

    console.log(`Found ${skillStats.length} unique skills`);

    let updated = 0;
    let inserted = 0;

    for (const stat of skillStats) {
      const skill = stat._id;
      const count = stat.count;
      const demandLevel = calculateDemandLevel(count);
      const backendCategory = getSkillCategory(skill);
      const category = mapCategoryToFrontend(backendCategory, skill);
      
      // Generate sparkline (mock 7-day data showing trend)
      const sparklineData = Array.from({ length: 7 }, (_, i) => 
        Math.max(0, Math.round(count * (0.8 + Math.random() * 0.4)))
      );

      const result = await Skill.findOneAndUpdate(
        { name: skill },
        {
          $set: {
            id: toSkillId(skill),
            name: skill,
            category,
            demandLevel,
            demandSignal: count,
            jobCount: count,
            sparklineData,
            lastUpdated: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      if (result) {
        if (result.isNew) inserted++;
        else updated++;
      }
    }

    await CacheMetadata.findOneAndUpdate(
      { key: 'skill-demand' },
      {
        key: 'skill-demand',
        dataType: 'skills',
        source: 'skill-demand',
        lastFetched: new Date(),
        skillsCount: skillStats.length,
        status: 'success',
      },
      { upsert: true }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Skill demand calculation complete: ${inserted} inserted, ${updated} updated in ${duration}s\n`);

    return {
      success: true,
      skillsProcessed: skillStats.length,
      inserted,
      updated,
      duration,
    };
  } catch (error) {
    console.error('❌ Error calculating skill demand:', error.message);
    throw error;
  }
}

/**
 * Update skills with relatedRoles based on job postings
 */
export async function updateSkillRelatedRoles() {
  try {
    console.log('\n🔄 Updating skill related roles...');
    const startTime = Date.now();

    // Get top roles with their required skills
    const topRolesRaw = await JobPosting.aggregate([
      { $group: { 
        _id: '$title', 
        count: { $sum: 1 }, 
        sectorId: { $first: '$sectorId' },
        allSkills: { $push: '$extractedSkills' }
      }},
      { $sort: { count: -1 } },
      { $limit: 20 }, // Top 20 roles
    ]);

    // Build role-to-skills mapping
    const roleSkillsMap = new Map();
    for (const role of topRolesRaw) {
      const skillFreq = {};
      for (const skillsArray of role.allSkills) {
        if (Array.isArray(skillsArray)) {
          for (const skill of skillsArray) {
            skillFreq[skill] = (skillFreq[skill] || 0) + 1;
          }
        }
      }

      // Get skills appearing in at least 20% of jobs for this role
      const threshold = Math.max(1, Math.ceil(role.count * 0.2));
      const requiredSkills = Object.entries(skillFreq)
        .filter(([_, count]) => count >= threshold)
        .map(([skill]) => skill);

      if (requiredSkills.length > 0 && role.sectorId) {
        // Normalize role title to match frontend generation
        const normalizedTitle = role._id.toLowerCase()
          .replace(/[/:()]/g, '-')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        const roleId = `${role.sectorId}-${normalizedTitle}`;
        roleSkillsMap.set(roleId, requiredSkills);
      }
    }

    // Build skill-to-roles reverse mapping
    const skillRolesMap = new Map();
    for (const [roleId, skills] of roleSkillsMap.entries()) {
      for (const skill of skills) {
        const normalizedSkill = skill.toLowerCase();
        if (!skillRolesMap.has(normalizedSkill)) {
          skillRolesMap.set(normalizedSkill, []);
        }
        skillRolesMap.get(normalizedSkill).push(roleId);
      }
    }

    // Update skills with related roles
    let updatedCount = 0;
    for (const [skillName, roleIds] of skillRolesMap.entries()) {
      await Skill.updateOne(
        { name: { $regex: new RegExp(`^${skillName}$`, 'i') } },
        { $set: { relatedRoles: roleIds } }
      );
      updatedCount++;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Updated ${updatedCount} skills with related roles in ${duration}s\n`);

    return {
      success: true,
      skillsUpdated: updatedCount,
      rolesProcessed: roleSkillsMap.size,
      duration,
    };
  } catch (error) {
    console.error('❌ Error updating skill related roles:', error.message);
    throw error;
  }
}

/**
 * Get top skills by demand
 */
export async function getTopSkills(limit = 20) {
  try {
    return await Skill.find()
      .sort({ demandSignal: -1 })
      .limit(limit)
      .select('name category demandLevel jobCount sparklineData');
  } catch (error) {
    console.error('Error fetching top skills:', error.message);
    throw error;
  }
}
