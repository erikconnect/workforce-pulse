import express from 'express';
import {
  getSectors,
  getSectorById,
  upsertSector,
  deleteSector,
} from '../controllers/sectorController.js';

const router = express.Router();

router.get('/', getSectors);
router.get('/:id', getSectorById);
router.post('/', upsertSector);
router.delete('/:id', deleteSector);

export default router;
