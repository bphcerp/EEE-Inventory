/**
 * @file inventoryRoutes.ts
 * @description Routes for managing inventory-related operations.
 */

import { addBulkData, addInventoryItem, getAccessToken, getInventory, getLastItemNumber } from '../controllers/inventoryController';
import path from 'path';
import { Router } from 'websocket-express';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = new Router();

// Route to add an inventory item
router.post('/', addInventoryItem);

// Get items
router.get('/', getInventory)

// Get next serial number for a new item to be added
router.get('/lastItemNumber', getLastItemNumber)

// Get access token to use the websocket
router.get('/token',checkAdminMiddlewareforGET, getAccessToken)

// Websocket listener to bulk add from Excel
router.ws('/excel', addBulkData);

export default router;
