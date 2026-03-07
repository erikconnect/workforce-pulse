import express from 'express';
import {
  getSkills,
  getSkillById,
  upsertSkill,
  deleteSkill,
} from '../controllers/skillController.js';

const router = express.Router();

router.get('/', getSkills);
router.get('/:id', getSkillById);
router.post('/', upsertSkill);
router.delete('/:id', deleteSkill);

export default router;
