import express from 'express';
import { getBenefitsCatalog, getRedemptions, redeemBenefit } from '../controllers/benefitController.js';

const router = express.Router();

router.get('/catalog', getBenefitsCatalog);
router.get('/redemptions', getRedemptions);
router.post('/redeem', redeemBenefit);

export default router;
