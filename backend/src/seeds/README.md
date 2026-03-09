# Database Seed Data

This directory contains seed data for populating the Workforce Pulse database with initial missions, playbooks, sectors, and skills.

## Seed Files

### 1. **missions.seed.js**
Contains 13 comprehensive missions across all 8 sectors:

#### Public Safety (2 missions)
- **Public Safety Recruitment Surge 2026**: Fill 50 critical roles across police, fire, and EMS
- **Crisis Intervention Training Expansion**: Train 100% of patrol officers in CIT protocols

#### Healthcare (2 missions)
- **Close the Nursing Gap at Baptist Health**: Fill 35 RN/LPN vacancies with retention bonuses
- **Medical Coding Certification Program**: Upskill 25 staff in CPC certification

#### Technology (2 missions)
- **Build Montgomery Cyber Defense Team**: Hire and train 12 cybersecurity professionals
- **Modern Cloud Infrastructure Training**: Upskill 20 city IT staff in AWS cloud services

#### Construction (2 missions)
- **Skilled Trades Apprenticeship Program**: Launch 50-person apprenticeship for HVAC, electrical, plumbing
- **Safety Certification Blitz**: Get 200 workers OSHA 10/30 certified

#### Education (2 missions)
- **Special Education Teacher Pipeline**: Address critical SpEd teacher shortage
- **Teacher Retention Incentive Program**: Reduce turnover from 16% to under 10%

#### Logistics (1 mission)
- **CDL Driver Fast-Track Program**: Train and certify 40 Class A CDL drivers

#### Finance (1 mission)
- **Finance Leadership Succession Planning**: Develop 8 high-potential professionals for senior roles

#### Retail (1 mission)
- **Retail Management Training Initiative**: Upskill 30 supervisors into store manager roles

Each mission includes:
- Detailed steps with due dates and completion status
- Impact metrics (before/after measurements)
- Realistic participant counts and reward points
- Community impact descriptions specific to Montgomery, AL

### 2. **playbooks.seed.js**
Contains 20 detailed playbooks with step-by-step instructions:

#### Public Safety (3 playbooks)
- Emergency Services 30-Day Onboarding
- De-escalation Training for Law Enforcement
- Firefighter Physical Fitness Program

#### Healthcare (3 playbooks)
- ICU Nurse Retention Strategy
- Rural Health Clinic Staffing Model
- Medical Billing Accuracy Improvement

#### Technology (3 playbooks)
- Cloud Team Scaling Playbook
- Cybersecurity Incident Response Plan
- Software Developer Onboarding

#### Construction (3 playbooks)
- Apprenticeship Program Launch Guide
- Construction Safety Culture Transformation
- Lean Construction Workflow Optimization

#### Education (3 playbooks)
- Alternative Teacher Certification Program
- New Teacher Mentorship Program
- Classroom Technology Integration

#### Logistics (2 playbooks)
- Reducing Driver Turnover
- Warehouse Safety Excellence

#### Finance (2 playbooks)
- Succession Planning for Finance Leaders
- Budget Process Modernization

#### Retail (1 playbook)
- Frontline to Management Career Path
- Seasonal Hiring Surge Playbook

Each playbook includes:
- 5-6 actionable steps
- Author information
- Difficulty level (starter/operator/advanced)
- Realistic engagement metrics (likes, saves)
- Tags for discoverability

### 3. **sectors.seed.js**
8 sectors with KPIs and pulse scores (existing)

### 4. **skills.seed.js**
23 skills across technical, soft, certification categories (existing)

## How to Run the Seeder

### Automatic Seeding
The database is automatically seeded when the backend server starts if collections are empty. This happens in `src/server.js` via the `seedDatabase()` function.

### Manual Seeding
To manually seed the database, run:

```bash
cd backend
npm run seed
```

Or directly:

```bash
node backend/src/utils/seed-standalone.js
```

This will:
1. Connect to MongoDB (using `MONGODB_URI` from `.env`)
2. Check if collections are empty
3. Insert seed data only if collections are empty
4. Display progress and completion status

## Data Relevance

All missions and playbooks are specifically designed for **Montgomery, Alabama** and reference:

- **Real job data sources**: Indeed, JobAps (City of Montgomery), USAJOBS, LinkedIn, Glassdoor
- **Montgomery neighborhoods**: West Montgomery, Downtown, Midtown, North Montgomery  
- **Local institutions**: Alabama State University, Auburn University Montgomery, H. Councill Trenholm State
- **Montgomery employers**: Baptist Health, Montgomery Public Schools, City of Montgomery departments
- **Real workforce challenges**: CDL driver shortage, nursing gaps, special education needs, cybersecurity threats

## Integration with Frontend

These missions and playbooks will be:

1. **Displayed on `/missions` page** with filtering by status (active/completed/paused) and sector
2. **Displayed on `/playbooks` page** with difficulty filters and search
3. **Linked to sectors** on sector detail pages
4. **Tracked for gamification** - users earn points by completing mission steps and creating playbooks

## Updating Seed Data

To add new missions or playbooks:

1. Edit `missions.seed.js` or `playbooks.seed.js`
2. Follow the existing data structure
3. Run `npm run seed` to populate (only inserts if collections are empty)
4. To force re-seed, manually delete collections in MongoDB first

## Schema Compatibility

All seed data matches the Mongoose schemas in:
- `backend/src/models/Mission.js`
- `backend/src/models/Playbook.js`

And the TypeScript types in:
- `src/services/types/index.ts` (Mission, Playbook interfaces)
