import express from 'express';
import jobRoutes from './jobRoutes.js';
import sectorRoutes from './sectorRoutes.js';
import skillRoutes from './skillRoutes.js';
import missionRoutes from './missionRoutes.js';
import playbookRoutes from './playbookRoutes.js';
import pulseRoutes from './pulseRoutes.js';
import communityRoutes from './communityRoutes.js';
import benefitRoutes from './benefitRoutes.js';

const router = express.Router();

// API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Workforce Pulse API',
    version: '1.0.0',
    endpoints: {
      jobs: '/jobs',
      sectors: '/sectors',
      skills: '/skills',
      missions: '/missions',
      playbooks: '/playbooks',
      pulse: '/pulse',
      community: '/community',
      benefits: '/benefits',
    },
  });
});

// Mount routes
router.use('/jobs', jobRoutes);
router.use('/sectors', sectorRoutes);
router.use('/skills', skillRoutes);
router.use('/missions', missionRoutes);
router.use('/playbooks', playbookRoutes);
router.use('/pulse', pulseRoutes);
router.use('/community', communityRoutes);
router.use('/benefits', benefitRoutes);

export default router;
