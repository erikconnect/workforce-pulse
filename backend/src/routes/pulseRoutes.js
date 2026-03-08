import express from 'express';
import {
  getPulseAlerts,
  getPulseSummary,
  submitPulseCheckIn,
  getRecentPostings,
} from '../controllers/pulseController.js';

const router = express.Router();

router.get('/alerts', getPulseAlerts);
router.get('/summary', getPulseSummary);
router.post('/check-in', submitPulseCheckIn);
router.get('/recent-postings', getRecentPostings);

export default router;
