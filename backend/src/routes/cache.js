import express from 'express';
import {
  getCacheStatus,
  invalidateCache,
  refreshCache,
  checkCache,
} from '../controllers/cacheController.js';

const router = express.Router();

router.get('/status', getCacheStatus);
router.post('/invalidate', invalidateCache);
router.post('/refresh', refreshCache);
router.get('/check/:dataType', checkCache);

export default router;
