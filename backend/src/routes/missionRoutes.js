import express from 'express';
import {
  getMissions,
  getMissionById,
  createMission,
  updateMissionStep,
  updateMission,
  deleteMission,
} from '../controllers/missionController.js';

const router = express.Router();

router.get('/', getMissions);
router.get('/:id', getMissionById);
router.post('/', createMission);
router.patch('/:id', updateMission);
router.patch('/:id/steps/:stepId', updateMissionStep);
router.delete('/:id', deleteMission);

export default router;
