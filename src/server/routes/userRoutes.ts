import { Router } from 'express';
import { getUserPermissions, addUser, modifyUser, deleteUser } from '../controllers/userController.js';

const router = Router();

// GET /user/permissions Route to get user permissions
router.get('/permissions', getUserPermissions);

// POST /user Route to add a new user
router.post('/', addUser);

// PUT /user Route to modify an existing user
router.put('/', modifyUser);

// DELETE /user Route to delete an existing user
router.delete('/', deleteUser);

export default router;
