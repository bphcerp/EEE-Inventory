/**
 * @file inventoryRoutes.ts
 * @description Routes for managing inventory-related operations.
 */

import { addBulkData, addInventoryItem, getAccessToken, getInventory, getLastItemNumber, transferItems, getImportantDates, patchInventoryItem, deleteItem, exportData } from '../controllers/inventoryController';
import { Router } from 'websocket-express';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = new Router();

// Route to add an inventory item
router.post('/', addInventoryItem);

// Route to add transfer inventory items from one lab to another
router.patch('/transfer', transferItems);

// Route to edit item(s)
router.patch('/:id', patchInventoryItem);

// Route to delete item(s) ( item with quantity > 1 all items with the same serial number for that lab will be deleted )
router.delete('/:id', deleteItem);

// Route to export data to excel
router.post('/export',exportData)

// Get items
router.get('/', getInventory)

// Get next serial number for a new item to be added
router.get('/lastItemNumber/:labId', getLastItemNumber)

// Get access token to use the websocket
router.get('/token',checkAdminMiddlewareforGET, getAccessToken)

// Websocket listener to bulk add from Excel
router.ws('/excel', addBulkData);

// Route to get items with important dates (warrantyTo or amcTo expiring within a week)
router.get('/important-dates', getImportantDates);

export default router;
