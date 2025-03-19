import { Router } from 'express';
import { getAllVendors, addVendor, editVendor, deleteVendor } from '../controllers/vendorController';

const router = Router();

// GET /vendors Route to get all vendors
router.get('/', getAllVendors);

// POST /vendors Route to add a new vendor
router.post('/', addVendor);

// PUT /vendors/:id Route to edit a vendor
router.put('/:id', editVendor);

// DELETE /vendors/:id Route to delete a vendor
router.delete('/:id', deleteVendor);

export default router;
