import express from 'express';
import {
  getJobs,
  getJobInsights,
  upsertJob,
  bulkUpsertJobs,
  clearJobs,
} from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/insights', getJobInsights);
router.post('/', upsertJob);
router.post('/bulk', bulkUpsertJobs);
router.delete('/', clearJobs);

export default router;
