import { Router } from 'express';
import { getAllLabs } from '../controllers/labController.js';

const router = Router();

// GET /labs Route to get all labs
router.get('/', getAllLabs);

export default router;
