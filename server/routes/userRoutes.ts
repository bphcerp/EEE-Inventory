import { Router } from 'express';
import { getUserPermissions, addUser, modifyUser, deleteUser, getUserLabs, getAllUsers } from '../controllers/userController';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = Router();

// GET /users/permissions Route to get user permissions
router.get('/permissions', getUserPermissions);

// GET /users Route to get all users
// Needs Admin role in permissions ( user.permissions = 1 )
router.get('/',checkAdminMiddlewareforGET,getAllUsers);

// GET /users/labs Route to get user labs
router.get('/labs', getUserLabs);

// POST /users Route to add a new user
router.post('/', addUser);

// PUT /users Route to modify an existing user
router.put('/:id', modifyUser);

// DELETE /users Route to delete an existing user
router.delete('/:id', deleteUser);

export default router;
