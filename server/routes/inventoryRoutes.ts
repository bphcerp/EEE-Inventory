/**
 * @file inventoryRoutes.ts
 * @description Routes for managing inventory-related operations.
 */

import { addBulkData, addInventoryItem, getAccessToken, getFile, getInventory, getLastItemNumber } from '../controllers/inventoryController';
import multer from 'multer';
import path from 'path';
import { Router } from 'websocket-express';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage }).fields([
    { name: 'softcopyOfPO', maxCount: 1 },
    { name: 'softcopyOfInvoice', maxCount: 1 },
    { name: 'softcopyOfNFA', maxCount: 1 },
    { name: 'softcopyOfAMC', maxCount: 1 },
    { name: 'equipmentPhoto', maxCount: 1 }
]);

const router = new Router();

// Route to add an inventory item
router.post('/', upload, addInventoryItem);

// Get items
router.get('/', getInventory)

// Get next serial number for a new item to be added
router.get('/lastItemNumber', getLastItemNumber)

// Get access token to use the websocket
router.get('/token',checkAdminMiddlewareforGET, getAccessToken)

// Get file by id (search param 'field': file attribute name)
router.get('/:id', getFile)

// Websocket listener to bulk add from Excel
router.ws('/excel', addBulkData);

export default router;
