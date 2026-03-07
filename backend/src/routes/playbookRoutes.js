import express from 'express';
import {
  getPlaybooks,
  getPlaybookById,
  createPlaybook,
  toggleLike,
  toggleSave,
  deletePlaybook,
} from '../controllers/playbookController.js';

const router = express.Router();

router.get('/', getPlaybooks);
router.get('/:id', getPlaybookById);
router.post('/', createPlaybook);
router.post('/:id/like', toggleLike);
router.post('/:id/save', toggleSave);
router.delete('/:id', deletePlaybook);

export default router;
