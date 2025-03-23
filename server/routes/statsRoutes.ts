/**
 * @file statsRoutes.ts
 * @description This file contains the routes for fetching inventory statistics in the EEE-Inventory system.
 */

import { Router } from 'express';
import {
    getLabInventorySumPerYear,
    getInventorySumPerCategory,
    getVendorSumPerYear,
} from '../controllers/statsController';

const router = Router();

router.get('/lab/yearly-sum', getLabInventorySumPerYear);
router.get('/lab/category-sum', getInventorySumPerCategory);
router.get('/vendor/yearly-sum', getVendorSumPerYear);

export default router;
