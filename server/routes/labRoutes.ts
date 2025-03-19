import { Router } from 'express';
import { getAllLabs, addLab } from '../controllers/labController';

const router = Router();

// GET /labs Route to get all labs
router.get('/', getAllLabs);

// POST /labs Route to add a new lab
router.post('/', addLab);

export default router;
