/**
 * @file apiRoutes.ts
 * @description This file contains the routes for handling API.
 */

import authRoutes from "./authRoutes";
import authMiddleware from '../middleware/authMiddleware';
import userRoutes from './userRoutes';
import morgan from 'morgan';
import labRoutes from './labRoutes';
import inventoryRoutes from './inventoryRoutes'
import { Router } from "websocket-express";
import vendorRoutes from "./vendorRoutes";
import categoryRoutes from './categoryRoutes';
import statsRoutes from "./statsRoutes";

const router = new Router();

// Log all requests to the console
router.use(morgan('combined'))

// Sign in and sign out routes
router.useHTTP('/auth', authRoutes);

// User API routes
router.useHTTP('/users', authMiddleware, userRoutes);

// Lab API routes
router.useHTTP('/labs', authMiddleware, labRoutes);

// Inventory API routes
router.use('/inventory',authMiddleware, inventoryRoutes);

router.useHTTP('/vendors',authMiddleware, vendorRoutes);

router.useHTTP('/categories', authMiddleware, categoryRoutes);

router.useHTTP('/stats', authMiddleware, statsRoutes);

//404 for all non-existing routes
router.use((_, res) => {
    res.status(404).json({ message: "404 - Not Found" });
});


export default router;