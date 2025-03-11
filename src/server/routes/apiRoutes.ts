/**
 * @file apiRoutes.ts
 * @description This file contains the routes for handling API.
 */

import { Router } from 'express';
import authRoutes from "./authRoutes.js";
import authMiddleware from '../middleware/authMiddleware.js';


const router = Router();

// Sign in and sign out routes
router.use('/auth', authRoutes);

//Use authorization middleware for all routes after this
router.use(authMiddleware);

export default router;