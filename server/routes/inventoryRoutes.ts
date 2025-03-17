import express from 'express';
import { addInventoryItem, getFile, getInventory } from '../controllers/inventoryController';
import multer from 'multer';
import path from 'path';

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

const router = express.Router();

// Route to add an inventory item
router.post('/', upload, addInventoryItem);

// Get items
router.get('/', getInventory)

// Get file by id (search param 'field': file attribute name)
router.get('/:id', getFile)

export default router;
