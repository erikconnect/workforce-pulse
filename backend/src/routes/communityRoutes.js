import express from 'express';
import { recordPlaybookAction, recordSkillAction, recordSectorAction } from '../controllers/communityController.js';

const router = express.Router();

router.post('/actions/skill', recordSkillAction);
router.post('/actions/sector', recordSectorAction);
router.post('/actions/playbook', recordPlaybookAction);

export default router;
