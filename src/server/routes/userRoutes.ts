import { Router } from 'express';
import { getUserPermissions, addUser, modifyUser, deleteUser } from '../controllers/userController.js';

const router = Router();

// GET /users/permissions Route to get user permissions
router.get('/permissions', getUserPermissions);

// POST /users Route to add a new user
router.post('/', addUser);

// PUT /users Route to modify an existing user
router.put('/', modifyUser);

// DELETE /users Route to delete an existing user
router.delete('/', deleteUser);

export default router;
