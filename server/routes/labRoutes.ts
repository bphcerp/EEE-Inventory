/**
 * @file labRoutes.ts
 * @description Routes for managing lab-related operations.
 */

import { Router } from 'express';
import { getAllLabs, addLab } from '../controllers/labController';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = Router();

// GET /labs Route to get all labs
router.get('/',checkAdminMiddlewareforGET, getAllLabs);

// POST /labs Route to add a new lab
router.post('/', addLab);

export default router;
