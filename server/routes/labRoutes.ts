/**
 * @file labRoutes.ts
 * @description Routes for managing lab-related operations.
 */

import { Router } from 'express';
import { getAllLabs, addLab, patchLab, deleteLab } from '../controllers/labController';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = Router();

// GET /labs Route to get all labs
router.get('/',checkAdminMiddlewareforGET, getAllLabs);

// POST /labs Route to add a new lab
router.post('/', addLab);

// PATCH /labs/:id Route to update a lab
router.patch('/:id', patchLab);

// DELETE /labs/:id Route to delete a lab
router.delete('/:id', deleteLab);

export default router;
