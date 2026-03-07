// src/data/mock-jobs.ts
// Mock job postings for local development and frontend integration testing.
// Covers all four key sectors: Public Safety (Fire), Public Safety (Police),
// Engineering, and Technical roles — all scoped to Montgomery, AL.
//
// Shape matches the JobPosting entity from docs and /api/jobs/aggregate response.

export interface JobPosting {
  id: string;
  title: string;
  source: "jobaps" | "usajobs" | "indeed";
  sector: "public-safety" | "engineering" | "technology" | "healthcare";
  location: string;
  org: string;
  postedAt: string; // ISO 8601
  description: string;
  skills: string[];
  critical: boolean; // true = flagged as understaffed critical role
  url: string;
  impactScore?: number; // 0–100, populated by analytics layer
}

export const mockJobs: JobPosting[] = [

  // ─── FIREFIGHTERS (public-safety) ────────────────────────────────────────

  {
    id: "ff-001",
    title: "Firefighter I",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Fire Department",
    postedAt: "2026-02-10T08:00:00Z",
    description:
      "Entry-level firefighter position responsible for fire suppression, emergency medical response, and hazardous materials containment. Must pass physical agility test and written exam.",
    skills: ["Fire Suppression", "CPR", "Emergency Medical Response", "Hazmat Handling", "Ladder Operations", "Self-Contained Breathing Apparatus (SCBA)"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/ff-001",
  },
  {
    id: "ff-002",
    title: "Firefighter II — Apparatus Operator",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Fire Department",
    postedAt: "2026-02-14T08:00:00Z",
    description:
      "Operates fire apparatus including pumpers and aerial trucks. Responsible for pump operations, water supply management, and driver safety. Requires valid Alabama CDL.",
    skills: ["Apparatus Operation", "Pump Operations", "CDL Class B", "Fire Suppression", "Water Supply Management", "CPR"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/ff-002",
  },
  {
    id: "ff-003",
    title: "Fire Lieutenant",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Fire Department",
    postedAt: "2026-02-18T08:00:00Z",
    description:
      "Supervisory role commanding a fire company during emergency and non-emergency operations. Responsible for training, personnel evaluation, and incident command.",
    skills: ["Incident Command", "Personnel Management", "Fire Suppression", "Emergency Medical Response", "Training & Development", "NIMS ICS-100/200"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/ff-003",
  },
  {
    id: "ff-004",
    title: "Fire Inspector",
    source: "usajobs",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "Montgomery County Fire Marshal Office",
    postedAt: "2026-02-20T08:00:00Z",
    description:
      "Conducts fire safety inspections of commercial, residential, and industrial properties. Investigates fire causes and enforces fire codes.",
    skills: ["Fire Code Enforcement", "Building Inspection", "Fire Investigation", "Report Writing", "NFPA Standards", "Customer Communication"],
    critical: false,
    url: "https://www.usajobs.gov/job/ff-004",
  },
  {
    id: "ff-005",
    title: "Wildland Firefighter",
    source: "usajobs",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "Alabama Forestry Commission",
    postedAt: "2026-02-22T08:00:00Z",
    description:
      "Suppresses wildland fires in forest and brush areas. Uses hand tools and power equipment. Must meet physical fitness standards and complete S-130/S-190 training.",
    skills: ["Wildland Fire Suppression", "Chainsaw Operation", "S-130/S-190 Certification", "Physical Fitness", "GPS Navigation", "Radio Communications"],
    critical: false,
    url: "https://www.usajobs.gov/job/ff-005",
  },

  // ─── POLICE OFFICERS (public-safety) ─────────────────────────────────────

  {
    id: "po-001",
    title: "Police Officer I",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Police Department",
    postedAt: "2026-02-08T08:00:00Z",
    description:
      "Patrol officer responsible for community policing, crime prevention, and emergency response. Must complete Alabama Peace Officers' Standards and Training (APOST) academy.",
    skills: ["Community Policing", "Crisis Intervention", "De-escalation", "Report Writing", "Traffic Enforcement", "First Aid/CPR", "Firearms Proficiency"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/po-001",
  },
  {
    id: "po-002",
    title: "Police Sergeant",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Police Department",
    postedAt: "2026-02-12T08:00:00Z",
    description:
      "First-line supervisory role overseeing patrol officers. Manages shift operations, reviews reports, mentors junior officers, and responds to critical incidents.",
    skills: ["Supervision", "Incident Command", "Performance Evaluation", "Crisis Intervention", "De-escalation", "Firearms Proficiency", "Community Policing"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/po-002",
  },
  {
    id: "po-003",
    title: "Police Detective — Crimes Against Persons",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Police Department",
    postedAt: "2026-02-16T08:00:00Z",
    description:
      "Investigates homicides, assaults, and domestic violence cases. Collects and analyzes evidence, interviews witnesses, and prepares cases for prosecution.",
    skills: ["Criminal Investigation", "Evidence Collection", "Interview Techniques", "Case Management", "Testimony / Court Preparation", "Digital Forensics Basics"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/po-003",
  },
  {
    id: "po-004",
    title: "School Resource Officer",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "City of Montgomery Police Department",
    postedAt: "2026-02-24T08:00:00Z",
    description:
      "Provides law enforcement services and mentoring in public schools. Builds positive relationships with students and staff, addresses safety concerns, and delivers educational programs.",
    skills: ["Community Policing", "Youth Engagement", "Conflict Resolution", "De-escalation", "Crisis Intervention", "Public Speaking"],
    critical: false,
    url: "https://jobapscloud.com/mgm/jobs/po-004",
  },
  {
    id: "po-005",
    title: "911 Dispatcher / Communications Officer",
    source: "jobaps",
    sector: "public-safety",
    location: "Montgomery, AL",
    org: "Montgomery Emergency Communications Center",
    postedAt: "2026-03-01T08:00:00Z",
    description:
      "Receives and dispatches emergency and non-emergency calls. Coordinates with police, fire, and EMS units. Must type 40+ WPM and manage high-stress multi-line communications.",
    skills: ["Emergency Dispatch", "CAD Systems", "Multi-line Phone Management", "Calm Under Pressure", "Active Listening", "Radio Communications", "Data Entry"],
    critical: true,
    url: "https://jobapscloud.com/mgm/jobs/po-005",
  },

  // ─── ENGINEERS (engineering) ──────────────────────────────────────────────

  {
    id: "en-001",
    title: "Civil Engineer — Infrastructure",
    source: "usajobs",
    sector: "engineering",
    location: "Montgomery, AL",
    org: "City of Montgomery Public Works Department",
    postedAt: "2026-02-05T08:00:00Z",
    description:
      "Designs and oversees construction of roads, bridges, drainage systems, and utility infrastructure. Manages contractors and ensures compliance with local codes and environmental regulations.",
    skills: ["AutoCAD", "Civil 3D", "Stormwater Management", "Project Management", "Contract Administration", "Alabama DOT Standards", "PE License (preferred)"],
    critical: false,
    url: "https://www.usajobs.gov/job/en-001",
  },
  {
    id: "en-002",
    title: "Electrical Engineer — Utilities",
    source: "indeed",
    sector: "engineering",
    location: "Montgomery, AL",
    org: "Alabama Power",
    postedAt: "2026-02-09T08:00:00Z",
    description:
      "Designs and maintains electrical distribution systems for commercial and industrial clients. Troubleshoots outages and leads grid modernization projects.",
    skills: ["Power Systems Design", "AutoCAD Electrical", "Load Flow Analysis", "NEC Code", "SCADA Systems", "Project Management", "PE License"],
    critical: false,
    url: "https://indeed.com/jobs/en-002",
  },
  {
    id: "en-003",
    title: "Mechanical Engineer — HVAC Systems",
    source: "indeed",
    sector: "engineering",
    location: "Montgomery, AL",
    org: "Hyundai Motor Manufacturing Alabama",
    postedAt: "2026-02-15T08:00:00Z",
    description:
      "Supports HVAC and mechanical systems design for manufacturing facility expansion. Works closely with facilities team and external contractors.",
    skills: ["HVAC Design", "Revit MEP", "ASHRAE Standards", "Facilities Management", "Thermodynamics", "AutoCAD", "Energy Efficiency Analysis"],
    critical: false,
    url: "https://indeed.com/jobs/en-003",
  },
  {
    id: "en-004",
    title: "Environmental Engineer",
    source: "usajobs",
    sector: "engineering",
    location: "Montgomery, AL",
    org: "Alabama Department of Environmental Management",
    postedAt: "2026-02-19T08:00:00Z",
    description:
      "Assesses and remediates contaminated sites. Reviews environmental permits and ensures compliance with federal and state regulations including Clean Air and Clean Water Acts.",
    skills: ["Site Assessment", "Remediation Planning", "EPA Compliance", "Report Writing", "GIS Mapping", "Water Quality Analysis", "Regulatory Knowledge"],
    critical: false,
    url: "https://www.usajobs.gov/job/en-004",
  },
  {
    id: "en-005",
    title: "Structural Engineer — Data Center Projects",
    source: "indeed",
    sector: "engineering",
    location: "Montgomery, AL",
    org: "Meta (contract via Turner Construction)",
    postedAt: "2026-02-28T08:00:00Z",
    description:
      "Provides structural engineering support for new data center construction in the Montgomery metro area. Reviews drawings, performs calculations, and conducts site inspections.",
    skills: ["Structural Analysis", "ETABS / SAP2000", "Steel and Concrete Design", "IBC Code", "Construction Administration", "BIM/Revit", "PE License"],
    critical: false,
    url: "https://indeed.com/jobs/en-005",
  },

  // ─── TECHNICIANS (technology) ─────────────────────────────────────────────

  {
    id: "tech-001",
    title: "IT Support Technician",
    source: "jobaps",
    sector: "technology",
    location: "Montgomery, AL",
    org: "City of Montgomery IT Department",
    postedAt: "2026-02-07T08:00:00Z",
    description:
      "Provides Tier 1 and Tier 2 helpdesk support for city employees. Troubleshoots hardware, software, and network issues. Manages device provisioning and user accounts.",
    skills: ["Windows 10/11", "Active Directory", "Helpdesk Support", "Ticketing Systems", "Network Troubleshooting", "Microsoft 365", "CompTIA A+ (preferred)"],
    critical: false,
    url: "https://jobapscloud.com/mgm/jobs/tech-001",
  },
  {
    id: "tech-002",
    title: "Cybersecurity Analyst",
    source: "usajobs",
    sector: "technology",
    location: "Montgomery, AL",
    org: "Maxwell Air Force Base",
    postedAt: "2026-02-11T08:00:00Z",
    description:
      "Monitors, analyzes, and responds to cybersecurity threats across Air Force networks. Conducts vulnerability assessments and implements security controls per NIST/DoD standards.",
    skills: ["SIEM Tools", "Intrusion Detection", "Vulnerability Assessment", "NIST Framework", "Security Clearance (required)", "Incident Response", "CompTIA Security+"],
    critical: false,
    url: "https://www.usajobs.gov/job/tech-002",
  },
  {
    id: "tech-003",
    title: "Network Technician",
    source: "indeed",
    sector: "technology",
    location: "Montgomery, AL",
    org: "City of Montgomery (Internet Exchange Operations)",
    postedAt: "2026-02-17T08:00:00Z",
    description:
      "Installs, maintains, and troubleshoots the city's fiber optic and Ethernet network infrastructure, including the Montgomery Internet Exchange. On-call rotation required.",
    skills: ["Cisco Networking", "Fiber Optic Installation", "BGP / OSPF Routing", "Network Monitoring", "CCNA (preferred)", "Structured Cabling", "On-call Support"],
    critical: false,
    url: "https://indeed.com/jobs/tech-003",
  },
  {
    id: "tech-004",
    title: "GIS Technician",
    source: "jobaps",
    sector: "technology",
    location: "Montgomery, AL",
    org: "City of Montgomery Planning Department",
    postedAt: "2026-02-21T08:00:00Z",
    description:
      "Maintains and updates the city's geospatial datasets. Produces maps for planning, public safety, and infrastructure departments. Supports ArcGIS FeatureServer data layers.",
    skills: ["ArcGIS Pro", "ArcGIS Online", "FeatureServer / REST API", "Spatial Data Management", "QGIS", "Python (arcpy)", "Database Querying (SQL)"],
    critical: false,
    url: "https://jobapscloud.com/mgm/jobs/tech-004",
  },
  {
    id: "tech-005",
    title: "Data Center Technician",
    source: "indeed",
    sector: "technology",
    location: "Montgomery, AL",
    org: "AWS (Amazon Web Services) — Montgomery Data Center",
    postedAt: "2026-03-02T08:00:00Z",
    description:
      "Performs hardware installation, maintenance, and decommissioning in a hyperscale data center. Manages rack and stack operations, cable management, and physical security procedures.",
    skills: ["Data Center Operations", "Server Hardware", "Cable Management", "Rack & Stack", "Physical Security Protocols", "Ticketing Systems", "On-call Rotation"],
    critical: false,
    url: "https://indeed.com/jobs/tech-005",
  },
];

// ─── HELPER EXPORTS ───────────────────────────────────────────────────────────

/** All jobs grouped by sector — useful for dashboard tiles */
export const jobsBySector = mockJobs.reduce<Record<string, JobPosting[]>>(
  (acc, job) => {
    if (!acc[job.sector]) acc[job.sector] = [];
    acc[job.sector].push(job);
    return acc;
  },
  {}
);

/** Only critical/understaffed roles — drives the Public Safety alert tile */
export const criticalJobs = mockJobs.filter((j) => j.critical);

/** Unique skill frequency map — drives the "Fastest Rising Skills" tile */
export const skillFrequency = mockJobs
  .flatMap((j) => j.skills)
  .reduce<Record<string, number>>((acc, skill) => {
    acc[skill] = (acc[skill] ?? 0) + 1;
    return acc;
  }, {});
