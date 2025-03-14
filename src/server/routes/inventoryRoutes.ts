import express from 'express';
import { addInventoryItem, getUniqueLabIncharges } from '../controllers/inventoryController.js';

const router = express.Router();

// Route to add an inventory item
router.post('/', addInventoryItem);

// Route to get all unique values of the field labInchargeAtPurchase
router.get('/faculties', getUniqueLabIncharges);

export default router;
