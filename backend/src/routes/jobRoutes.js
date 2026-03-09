import express from 'express';
import {
  getJobs,
  getJobInsights,
  getScrapingStats,
  upsertJob,
  bulkUpsertJobs,
  clearJobs,
} from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/insights', getJobInsights);
router.get('/stats', getScrapingStats);
router.post('/', upsertJob);
router.post('/bulk', bulkUpsertJobs);
router.delete('/', clearJobs);

export default router;
