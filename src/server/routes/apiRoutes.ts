/**
 * @file apiRoutes.ts
 * @description This file contains the routes for handling API.
 */

import { Router } from 'express';
import authRoutes from "./authRoutes.js";
import authMiddleware from '../middleware/authMiddleware.js';
import userRoutes from './userRoutes.js';
import morgan from 'morgan';
import labRoutes from './labRoutes.js';


const router = Router();

// Log all requests to the console
router.use(morgan('combined'))

// Sign in and sign out routes
router.use('/auth', authRoutes);

// User API routes
router.use('/users',authMiddleware, userRoutes);

// Lab API routes
router.use('/labs',authMiddleware, labRoutes);

export default router;