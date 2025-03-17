/**
 * @file authRoutes.ts
 * @description This file contains the routes for handling user authentication operations.
 */

import { Router } from 'express';
import { signIn, signOut } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

//POST /api/auth/signin Route to sign in
router.post('/signin', signIn);
//POST /api/auth/signout Route to sign out
router.post('/signout', signOut);

//GET /api/auth/check Route to check if the user is authenticated
router.get('/check',authMiddleware, (_req, res) => {
  res.send('Auth check successful!');
})

export default router;
