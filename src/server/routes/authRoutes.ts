/**
 * @file authRoutes.ts
 * @description This file contains the routes for handling user authentication operations.
 */

import { Router } from 'express';
import { signIn, signOut } from '../controllers/authController.js';

const router = Router();

//POST /auth/signin Route to sign in
router.post('/signin', signIn);
//POST /auth/signout Route to sign out
router.post('/signout', signOut);

export default router;
