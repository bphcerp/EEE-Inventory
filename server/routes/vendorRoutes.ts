/**
 * @file vendorRoutes.ts
 * @description Routes for managing vendor-related operations.
 */

import { Router } from 'express';
import { getAllVendors, addVendor, patchVendor, deleteVendor } from '../controllers/vendorController';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = Router();

// GET /vendors Route to get all vendors
router.get('/',checkAdminMiddlewareforGET, getAllVendors);

// POST /vendors Route to add a new vendor
router.post('/', addVendor);

// PATCH /vendors/:id Route to update a vendor
router.patch('/:id', patchVendor);

// DELETE /vendors/:id Route to delete a vendor
router.delete('/:id', deleteVendor);

export default router;
