/**
 * @file apiRoutes.ts
 * @description This file contains the routes for handling API.
 */

import { Router } from 'express';
import authRoutes from "./authRoutes";
import authMiddleware from '../middleware/authMiddleware';
import userRoutes from './userRoutes';
import morgan from 'morgan';
import labRoutes from './labRoutes';
import inventoryRoutes from './inventoryRoutes'


const router = Router();

// Log all requests to the console
router.use(morgan('combined'))

// Sign in and sign out routes
router.use('/auth', authRoutes);

// User API routes
router.use('/users', authMiddleware, userRoutes);

// Lab API routes
router.use('/labs', authMiddleware, labRoutes);

// Inventory API routes
router.use('/inventory', authMiddleware, inventoryRoutes);

//404 for all non-existing routes
router.use((_, res) => {
    res.status(404).json({ message: "404 - Not Found" });
});


export default router;