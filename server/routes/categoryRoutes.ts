/**
 * @file categoryRoutes.ts
 * @description Routes for managing category-related operations.
 */

import { Router } from 'express';
import { getAllCategories, getCategoryById, createCategory, patchCategory, deleteCategory } from '../controllers/categoryController';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = Router();

// GET /categories Route to get all categories
router.get('/',checkAdminMiddlewareforGET, getAllCategories);

// GET /categories/:id Route to get a category by ID
router.get('/:id', getCategoryById);

// POST /categories Route to create a new category
router.post('/', createCategory);

// PATCH /categories/:id Route to update a category
router.patch('/:id', patchCategory);

// DELETE /categories/:id Route to delete a category
router.delete('/:id', deleteCategory);

export default router;
