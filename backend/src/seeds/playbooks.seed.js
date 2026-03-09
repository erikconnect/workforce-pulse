export const playbooksSeed = [
  // ========== PUBLIC SAFETY PLAYBOOKS ==========
  {
    id: 'playbook-ps-001',
    title: 'Emergency Services 30-Day Onboarding',
    summary: 'Accelerated onboarding program for paramedics, EMTs, and emergency dispatchers designed to cut time-to-productivity in half while maintaining safety compliance.',
    authorName: 'Chief J. Martinez',
    authorAvatar: '/avatars/chief-martinez.png',
    sectorId: 'public-safety',
    tags: ['Onboarding', 'Public Safety', 'EMT', 'Training', 'Fast-track'],
    likes: 156,
    saves: 73,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Map current onboarding timeline and identify bottlenecks using process flow analysis.',
      },
      {
        order: 2,
        instruction: 'Convert paper-based training materials to digital modules in learning management system (LMS).',
      },
      {
        order: 3,
        instruction: 'Create mentor pairing system - assign experienced paramedic to each new hire for first 60 days.',
      },
      {
        order: 4,
        instruction: 'Schedule weekly check-ins between new hire, field supervisor, and HR for first 30 days.',
      },
      {
        order: 5,
        instruction: 'Implement competency assessments at Day 15 and Day 30 using standardized rubric.',
      },
      {
        order: 6,
        instruction: 'Track time-to-first-solo-shift metric and adjust training as needed to meet 30-day target.',
      },
    ],
  },

  {
    id: 'playbook-ps-002',
    title: 'De-escalation Training for Law Enforcement',
    summary: 'Comprehensive 40-hour Crisis Intervention Team (CIT) training program to improve outcomes in mental health crisis calls.',
    authorName: 'Lt. K. Williams',
    authorAvatar: '/avatars/lt-williams.png',
    sectorId: 'public-safety',
    tags: ['De-escalation', 'Mental Health', 'CIT', 'Training', 'Community Safety'],
    likes: 142,
    saves: 68,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Establish MOU with Montgomery Area Mental Health Authority for curriculum development and guest speakers.',
      },
      {
        order: 2,
        instruction: 'Send 10 senior officers to Memphis Model CIT training for train-the-trainer certification.',
      },
      {
        order: 3,
        instruction: 'Develop 40-hour curriculum covering mental illness recognition, de-escalation tactics, and community resources.',
      },
      {
        order: 4,
        instruction: 'Run training in cohorts of 20 officers over 5 consecutive days with role-play scenarios.',
      },
      {
        order: 5,
        instruction: 'Create mobile crisis response team pairing CIT-trained officers with mental health clinicians.',
      },
      {
        order: 6,
        instruction: 'Track use-of-force metrics and mental health referrals pre/post training to measure impact.',
      },
    ],
  },

  {
    id: 'playbook-ps-003',
    title: 'Firefighter Physical Fitness Program',
    summary: 'Year-round fitness and wellness program to reduce injuries, improve performance, and extend firefighter careers.',
    authorName: 'Battalion Chief R. Thompson',
    authorAvatar: '/avatars/bc-thompson.png',
    sectorId: 'public-safety',
    tags: ['Fitness', 'Wellness', 'Fire Department', 'Injury Prevention'],
    likes: 98,
    saves: 51,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Baseline fitness testing for all firefighters using CPAT or Candidate Physical Ability Test standards.',
      },
      {
        order: 2,
        instruction: 'Allocate 1 hour per shift for physical training and equip stations with basic gym equipment.',
      },
      {
        order: 3,
        instruction: 'Create peer fitness teams with accountability partners and quarterly challenges.',
      },
      {
        order: 4,
        instruction: 'Partner with local sports medicine clinic for injury prevention workshops and physical therapy access.',
      },
      {
        order: 5,
        instruction: 'Implement annual fitness testing with incentives (extra PTO day) for meeting standards.',
      },
    ],
  },

  // ========== HEALTHCARE PLAYBOOKS ==========
  {
    id: 'playbook-hc-001',
    title: 'ICU Nurse Retention Strategy',
    summary: 'Evidence-based tactics to reduce ICU nurse turnover below 10% through flexible scheduling, mental health support, and career ladders.',
    authorName: 'Dr. L. Thompson',
    authorAvatar: '/avatars/dr-thompson.png',
    sectorId: 'healthcare',
    tags: ['Retention', 'Healthcare', 'Nursing', 'Burnout Prevention', 'Wellbeing'],
    likes: 187,
    saves: 94,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Survey ICU nurses anonymously on burnout drivers, scheduling preferences, and job satisfaction.',
      },
      {
        order: 2,
        instruction: 'Implement self-scheduling platform allowing nurses to swap shifts and request preferred schedules 6 weeks in advance.',
      },
      {
        order: 3,
        instruction: 'Launch peer support program with trained peer counselors and access to Employee Assistance Program (EAP).',
      },
      {
        order: 4,
        instruction: 'Define clinical ladder with 4 levels (RN I-IV) with clear promotion criteria and salary bands (+$5K per level).',
      },
      {
        order: 5,
        instruction: 'Offer annual continuing education stipend of $2,000 for certifications like CCRN.',
      },
      {
        order: 6,
        instruction: 'Track retention rate quarterly and conduct stay interviews to identify what\'s working.',
      },
    ],
  },

  {
    id: 'playbook-hc-002',
    title: 'Rural Health Clinic Staffing Model',
    summary: 'Strategies to staff and sustain rural health clinics in underserved areas using telehealth, loan repayment, and advanced practice providers.',
    authorName: 'M. Garcia, Rural Health Director',
    authorAvatar: '/avatars/m-garcia.png',
    sectorId: 'healthcare',
    tags: ['Rural Health', 'Telehealth', 'Staffing', 'Recruitment', 'Community Health'],
    likes: 112,
    saves: 58,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Apply for National Health Service Corps (NHSC) site designation to access loan repayment for providers.',
      },
      {
        order: 2,
        instruction: 'Recruit Nurse Practitioners and Physician Assistants to serve as primary care providers.',
      },
      {
        order: 3,
        instruction: 'Implement telehealth platform connecting rural clinic to specialists at main hospital.',
      },
      {
        order: 4,
        instruction: 'Offer housing stipend or on-site housing for providers willing to serve in rural areas.',
      },
      {
        order: 5,
        instruction: 'Partner with local churches and community centers for health outreach and screening events.',
      },
    ],
  },

  {
    id: 'playbook-hc-003',
    title: 'Medical Billing Accuracy Improvement',
    summary: 'Step-by-step process to reduce claims denials, improve coding accuracy, and accelerate revenue cycle in healthcare organizations.',
    authorName: 'K. Anderson, Revenue Cycle Manager',
    authorAvatar: '/avatars/k-anderson.png',
    sectorId: 'healthcare',
    tags: ['Medical Billing', 'Revenue Cycle', 'Coding', 'Claims Management'],
    likes: 91,
    saves: 47,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Audit denied claims for past 6 months to identify top 5 denial reasons (e.g., missing info, incorrect codes).',
      },
      {
        order: 2,
        instruction: 'Provide targeted training for billing staff on top denial categories using real examples.',
      },
      {
        order: 3,
        instruction: 'Implement pre-claim scrubbing software to catch errors before submission.',
      },
      {
        order: 4,
        instruction: 'Establish weekly coding review meetings between coders and clinical staff to clarify documentation.',
      },
      {
        order: 5,
        instruction: 'Track clean claims rate (goal: 95%) and days in A/R (goal: under 40 days).',
      },
    ],
  },

  // ========== TECHNOLOGY PLAYBOOKS ==========
  {
    id: 'playbook-tech-001',
    title: 'Cloud Team Scaling Playbook',
    summary: 'How to scale a cloud engineering team from 5 to 20 in 6 months — sourcing strategy, interview process, and onboarding for AWS architects.',
    authorName: 'S. Patel, CIO',
    authorAvatar: '/avatars/s-patel.png',
    sectorId: 'technology',
    tags: ['Cloud', 'AWS', 'Recruiting', 'Scaling', 'Team Building'],
    likes: 203,
    saves: 118,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Define target architecture team structure: 2 Solutions Architects, 8 Cloud Engineers, 6 DevOps Engineers, 4 SREs.',
      },
      {
        order: 2,
        instruction: 'Post on tech job boards (Built In, Levels.fyi, LinkedIn) and AWS community Slack channels.',
      },
      {
        order: 3,
        instruction: 'Run structured technical interviews with defined rubric (no whiteboarding) - focus on real-world scenarios.',
      },
      {
        order: 4,
        instruction: 'Offer competitive comp including equity, remote flexibility, and AWS certification bonuses.',
      },
      {
        order: 5,
        instruction: 'Create 90-day onboarding plan with hands-on projects (e.g., migrate legacy app to containers).',
      },
      {
        order: 6,
        instruction: 'Schedule weekly 1:1s and create internal documentation wiki to capture tribal knowledge.',
      },
    ],
  },

  {
    id: 'playbook-tech-002',
    title: 'Cybersecurity Incident Response Plan',
    summary: 'Complete incident response playbook for handling ransomware, data breaches, and other cyber threats to municipal infrastructure.',
    authorName: 'T. Brown, CISO',
    authorAvatar: '/avatars/t-brown.png',
    sectorId: 'technology',
    tags: ['Cybersecurity', 'Incident Response', 'Ransomware', 'Infrastructure Protection'],
    likes: 178,
    saves: 102,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Establish incident response team with defined roles: Incident Commander, Technical Lead, Communications Lead.',
      },
      {
        order: 2,
        instruction: 'Create detection playbooks for common attack patterns (phishing, ransomware, DDoS) using SIEM alerts.',
      },
      {
        order: 3,
        instruction: 'Document containment procedures: isolate affected systems, preserve evidence, notify stakeholders.',
      },
      {
        order: 4,
        instruction: 'Run quarterly tabletop exercises simulating ransomware attack on critical infrastructure (e.g., 911 system).',
      },
      {
        order: 5,
        instruction: 'Maintain offline backups tested monthly and incident response retainer with forensics firm.',
      },
      {
        order: 6,
        instruction: 'Conduct post-incident review within 48 hours to document lessons learned and update playbooks.',
      },
    ],
  },

  {
    id: 'playbook-tech-003',
    title: 'Software Developer Onboarding',
    summary: 'First 90 days onboarding for new software developers covering tech stack, code standards, and team culture.',
    authorName: 'A. Chen, Engineering Manager',
    authorAvatar: '/avatars/a-chen.png',
    sectorId: 'technology',
    tags: ['Software Development', 'Onboarding', 'Team Culture', 'Best Practices'],
    likes: 134,
    saves: 71,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Day 1-5: Set up dev environment, grant repo access, assign onboarding buddy for daily check-ins.',
      },
      {
        order: 2,
        instruction: 'Week 1-2: Complete small bug fixes to learn codebase, review coding standards and pull request process.',
      },
      {
        order: 3,
        instruction: 'Week 3-4: Ship first feature to production with guidance from senior dev.',
      },
      {
        order: 4,
        instruction: 'Week 5-8: Take ownership of one feature area, participate in architecture discussions.',
      },
      {
        order: 5,
        instruction: 'Week 9-12: Lead design and implementation of medium-sized feature, mentor newer team member.',
      },
    ],
  },

  // ========== CONSTRUCTION PLAYBOOKS ==========
  {
    id: 'playbook-const-001',
    title: 'Apprenticeship Program Launch Guide',
    summary: 'Complete guide to launching DOL-registered apprenticeship program for HVAC, electrical, or plumbing trades.',
    authorName: 'R. Davis, Workforce Development',
    authorAvatar: '/avatars/r-davis.png',
    sectorId: 'construction',
    tags: ['Apprenticeship', 'Skilled Trades', 'DOL Registration', 'Workforce Development'],
    likes: 145,
    saves: 82,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Research DOL apprenticeship standards for your trade at apprenticeship.gov.',
      },
      {
        order: 2,
        instruction: 'Secure employer commitments - need 3+ companies willing to host apprentices.',
      },
      {
        order: 3,
        instruction: 'Register program with state apprenticeship agency or DOL Office of Apprenticeship.',
      },
      {
        order: 4,
        instruction: 'Partner with local community college for related technical instruction (RTI).',
      },
      {
        order: 5,
        instruction: 'Recruit apprentices through high schools, job centers, and community organizations.',
      },
      {
        order: 6,
        instruction: 'Track apprentice retention, on-time-job training hours, and completion rates.',
      },
    ],
  },

  {
    id: 'playbook-const-002',
    title: 'Construction Safety Culture Transformation',
    summary: 'Build a strong safety culture on construction sites to reduce injuries, improve morale, and win more contracts.',
    authorName: 'C. Johnson, Safety Director',
    authorAvatar: '/avatars/c-johnson.png',
    sectorId: 'construction',
    tags: ['Safety', 'Culture Change', 'OSHA', 'Injury Prevention', 'Leadership'],
    likes: 167,
    saves: 89,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Get leadership buy-in - CEO/President must visibly champion safety as company value #1.',
      },
      {
        order: 2,
        instruction: 'Start every meeting (including executive meetings) with safety moment or near-miss discussion.',
      },
      {
        order: 3,
        instruction: 'Empower workers to stop work if unsafe conditions exist - no retaliation policy.',
      },
      {
        order: 4,
        instruction: 'Track leading indicators (safety observations, near misses) not just lagging (injuries).',
      },
      {
        order: 5,
        instruction: 'Celebrate safety milestones publicly - e.g., 100 days injury-free with team lunch.',
      },
      {
        order: 6,
        instruction: 'Investigate all incidents (not just injuries) and share lessons learned across all projects.',
      },
    ],
  },

  {
    id: 'playbook-const-003',
    title: 'Lean Construction Workflow Optimization',
    summary: 'Apply lean principles to reduce waste, improve productivity, and deliver construction projects faster and under budget.',
    authorName: 'D. Martinez, Project Manager',
    authorAvatar: '/avatars/d-martinez.png',
    sectorId: 'construction',
    tags: ['Lean Construction', 'Productivity', 'Project Management', 'Process Improvement'],
    likes: 102,
    saves: 56,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Map current workflow using Last Planner System - identify constraints and waste.',
      },
      {
        order: 2,
        instruction: 'Conduct weekly look-ahead planning meetings with all trades to coordinate work.',
      },
      {
        order: 3,
        instruction: 'Implement pull planning sessions at project kickoff to create collaborative schedule.',
      },
      {
        order: 4,
        instruction: 'Track Percent Plan Complete (PPC) weekly - goal is 80%+ reliability.',
      },
      {
        order: 5,
        instruction: 'Conduct root cause analysis when tasks don\'t complete and adjust planning process.',
      },
    ],
  },

  // ========== EDUCATION PLAYBOOKS ==========
  {
    id: 'playbook-edu-001',
    title: 'Alternative Teacher Certification Program',
    summary: 'Launch alternative certification pathway to recruit career-changers and paraprofessionals into teaching roles.',
    authorName: 'Dr. A. Wilson, Superintendent',
    authorAvatar: '/avatars/dr-wilson.png',
    sectorId: 'education',
    tags: ['Alternative Certification', 'Teacher Recruitment', 'Career Changers', 'Certification'],
    likes: 124,
    saves: 67,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Partner with local university for state-approved alternative certification program.',
      },
      {
        order: 2,
        instruction: 'Target career-changers with bachelor\'s degrees and existing paraprofessionals.',
      },
      {
        order: 3,
        instruction: 'Offer tuition reimbursement ($8,500) in exchange for 3-year teaching commitment.',
      },
      {
        order: 4,
        instruction: 'Place candidates in classrooms immediately as teacher of record with mentor support.',
      },
      {
        order: 5,
        instruction: 'Provide coursework in evenings/weekends and summer intensives to minimize time out of classroom.',
      },
      {
        order: 6,
        instruction: 'Track certification pass rates and 3-year retention of alternatively certified teachers.',
      },
    ],
  },

  {
    id: 'playbook-edu-002',
    title: 'New Teacher Mentorship Program',
    summary: 'Comprehensive mentorship model pairing veteran teachers with new teachers to improve retention and effectiveness.',
    authorName: 'K. Roberts, Professional Development Director',
    authorAvatar: '/avatars/k-roberts.png',
    sectorId: 'education',
    tags: ['Mentorship', 'Teacher Support', 'Retention', 'Professional Development'],
    likes: 158,
    saves: 91,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Select experienced teachers (5+ years) as mentors through application process.',
      },
      {
        order: 2,
        instruction: 'Provide mentor training on coaching, feedback, and adult learning principles.',
      },
      {
        order: 3,
        instruction: 'Pair mentors and mentees by grade level and subject area for relevant support.',
      },
      {
        order: 4,
        instruction: 'Schedule weekly meetings and monthly classroom observations with debrief.',
      },
      {
        order: 5,
        instruction: 'Compensate mentors with stipend ($2,000/year) or course credit toward recertification.',
      },
      {
        order: 6,
        instruction: 'Survey new teachers quarterly on program effectiveness and adjust as needed.',
      },
    ],
  },

  {
    id: 'playbook-edu-003',
    title: 'Classroom Technology Integration',
    summary: 'Practical guide to integrating technology effectively in K-12 classrooms to enhance student engagement and learning outcomes.',
    authorName: 'J. Lee, Instructional Technology Coach',
    authorAvatar: '/avatars/j-lee.png',
    sectorId: 'education',
    tags: ['EdTech', 'Technology Integration', 'Professional Development', 'Student Engagement'],
    likes: 139,
    saves: 74,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Start with learning objectives - technology should enhance learning, not replace good teaching.',
      },
      {
        order: 2,
        instruction: 'Provide teacher training on 2-3 high-impact tools (e.g., Google Classroom, Kahoot, Nearpod).',
      },
      {
        order: 3,
        instruction: 'Model technology use in professional development so teachers experience it as learners.',
      },
      {
        order: 4,
        instruction: 'Create peer observation opportunities for teachers to see tech integration in action.',
      },
      {
        order: 5,
        instruction: 'Establish instructional technology coach role for ongoing classroom support.',
      },
      {
        order: 6,
        instruction: 'Track student engagement and achievement data to measure impact of tech integration.',
      },
    ],
  },

  // ========== LOGISTICS PLAYBOOKS ==========
  {
    id: 'playbook-log-001',
    title: 'Reducing Driver Turnover',
    summary: 'Comprehensive retention program for CDL drivers addressing top 5 reasons for voluntary attrition in transportation.',
    authorName: 'M. Davis, Fleet Manager',
    authorAvatar: '/avatars/m-davis.png',
    sectorId: 'logistics',
    tags: ['Driver Retention', 'CDL', 'Compensation', 'Quality of Life'],
    likes: 176,
    saves: 95,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Survey departing drivers in exit interviews - top reasons are usually pay, home time, equipment, respect.',
      },
      {
        order: 2,
        instruction: 'Benchmark pay against regional competitors and adjust to at least 50th percentile.',
      },
      {
        order: 3,
        instruction: 'Improve route planning to maximize home time - consider dedicated routes vs. OTR.',
      },
      {
        order: 4,
        instruction: 'Upgrade truck fleet - newer trucks with better amenities (APU, comfortable seats, good AC).',
      },
      {
        order: 5,
        instruction: 'Train dispatchers on respectful communication and problem-solving with drivers.',
      },
      {
        order: 6,
        instruction: 'Implement driver recognition program - monthly awards, safety bonuses, tenure recognition.',
      },
    ],
  },

  {
    id: 'playbook-log-002',
    title: 'Warehouse Safety Excellence',
    summary: 'Best practices for creating safe warehouse operations including forklift safety, ergonomics, and injury prevention.',
    authorName: 'P. Rodriguez, Warehouse Manager',
    authorAvatar: '/avatars/p-rodriguez.png',
    sectorId: 'logistics',
    tags: ['Warehouse', 'Safety', 'OSHA', 'Forklift', 'Injury Prevention'],
    likes: 131,
    saves: 69,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Ensure all forklift operators are certified and refresher training happens annually.',
      },
      {
        order: 2,
        instruction: 'Implement pre-shift equipment inspections and take damaged equipment out of service immediately.',
      },
      {
        order: 3,
        instruction: 'Create clear pedestrian walkways separated from forklift traffic with floor markings.',
      },
      {
        order: 4,
        instruction: 'Provide ergonomic training on proper lifting techniques and use of mechanical aids.',
      },
      {
        order: 5,
        instruction: 'Conduct monthly safety walks with frontline workers to identify hazards.',
      },
      {
        order: 6,
        instruction: 'Track leading indicators: near misses, safety observations, equipment defects reported.',
      },
    ],
  },

  // ========== FINANCE PLAYBOOKS ==========
  {
    id: 'playbook-fin-001',
    title: 'Succession Planning for Finance Leaders',
    summary: 'Identify and develop high-potential finance professionals to fill senior roles through mentoring and stretch assignments.',
    authorName: 'CFO A. Johnson',
    authorAvatar: '/avatars/cfo-johnson.png',
    sectorId: 'finance',
    tags: ['Succession Planning', 'Leadership Development', 'Finance', 'Talent Management'],
    likes: 143,
    saves: 78,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Use 360-degree reviews and performance data to identify top 10 high-potential candidates.',
      },
      {
        order: 2,
        instruction: 'Create individual development plans focused on leadership competencies and technical gaps.',
      },
      {
        order: 3,
        instruction: 'Assign stretch projects (e.g., lead budget process, present to board, manage audit).',
      },
      {
        order: 4,
        instruction: 'Pair candidates with executive mentors (CFO, Controller, Budget Director) for quarterly guidance.',
      },
      {
        order: 5,
        instruction: 'Fund professional certifications (CPA, CGFM, CMA) and executive education.',
      },
      {
        order: 6,
        instruction: 'Document succession matrix with readiness ratings (ready now, 1-2 years, 3+ years) for each role.',
      },
    ],
  },

  {
    id: 'playbook-fin-002',
    title: 'Budget Process Modernization',
    summary: 'Transition from spreadsheet-based budgeting to modern budgeting software for better collaboration and transparency.',
    authorName: 'B. Taylor, Budget Director',
    authorAvatar: '/avatars/b-taylor.png',
    sectorId: 'finance',
    tags: ['Budgeting', 'Process Improvement', 'Technology', 'Financial Planning'],
    likes: 108,
    saves: 61,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Document current budget process pain points - common issues: version control, email overload, manual consolidation.',
      },
      {
        order: 2,
        instruction: 'Evaluate budgeting software (Questica, OpenGov, Adaptive Insights) with demos and reference calls.',
      },
      {
        order: 3,
        instruction: 'Run pilot with 2-3 departments before full rollout to work out configuration issues.',
      },
      {
        order: 4,
        instruction: 'Provide hands-on training for budget managers - avoid just emailing user guide.',
      },
      {
        order: 5,
        instruction: 'Migrate historical data (3 years minimum) for trend analysis and forecasting.',
      },
      {
        order: 6,
        instruction: 'Track adoption metrics and time savings - goal is 30% reduction in budget cycle time.',
      },
    ],
  },

  // ========== RETAIL PLAYBOOKS ==========
  {
    id: 'playbook-ret-001',
    title: 'Frontline to Management Career Path',
    summary: 'Create clear career ladder from cashier/sales associate to store manager with defined skills and milestones.',
    authorName: 'P. Martinez, Retail Operations',
    authorAvatar: '/avatars/p-martinez.png',
    sectorId: 'retail',
    tags: ['Career Development', 'Retail Management', 'Promotion', 'Advancement'],
    likes: 119,
    saves: 64,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Define 5-level career ladder: Sales Associate → Senior Associate → Lead → Assistant Manager → Store Manager.',
      },
      {
        order: 2,
        instruction: 'Document competencies required for each level (e.g., Lead needs shift management, coaching, merchandising).',
      },
      {
        order: 3,
        instruction: 'Create micro-credential or badging system for skill development (customer service, POS, inventory, scheduling).',
      },
      {
        order: 4,
        instruction: 'Require manager shadowing and project completion before promotion to next level.',
      },
      {
        order: 5,
        instruction: 'Publish career paths visibly in break room and discuss in quarterly one-on-ones.',
      },
    ],
  },

  {
    id: 'playbook-ret-002',
    title: 'Seasonal Hiring Surge Playbook',
    summary: 'Efficiently recruit, hire, and onboard 100+ seasonal workers for holiday rush while maintaining quality.',
    authorName: 'L. Wilson, HR Manager',
    authorAvatar: '/avatars/l-wilson.png',
    sectorId: 'retail',
    tags: ['Seasonal Hiring', 'Recruitment', 'Retail', 'High-Volume Hiring'],
    likes: 152,
    saves: 83,
    likedBy: [],
    savedBy: [],
    steps: [
      {
        order: 1,
        instruction: 'Start recruiting 8-10 weeks before peak season (early October for holidays).',
      },
      {
        order: 2,
        instruction: 'Simplify application to mobile-friendly 5-minute form with video interview.',
      },
      {
        order: 3,
        instruction: 'Host open interview events - walk-ins welcome, hire on the spot if qualified.',
      },
      {
        order: 4,
        instruction: 'Create 2-day condensed onboarding covering essentials: POS, customer service, safety.',
      },
      {
        order: 5,
        instruction: 'Pair seasonal workers with permanent staff buddy for first 2 weeks.',
      },
      {
        order: 6,
        instruction: 'Identify top performers for conversion to permanent roles after season ends.',
      },
    ],
  },
];
