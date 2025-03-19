/**
 * @file categoryRoutes.ts
 * @description Routes for managing category-related operations.
 */

import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController';
import checkAdminMiddlewareforGET from '../middleware/checkAdminMiddlewareforGet';

const router = express.Router();

// GET /categories Route to get all categories
router.get('/', checkAdminMiddlewareforGET, getAllCategories);

// GET /categories/:id Route to get a category by ID
router.get('/:id', getCategoryById);

// POST /categories Route to create a new category
router.post('/', createCategory);

// PUT /categories/:id Route to update a category by ID
router.put('/:id', updateCategory);

// DELETE /categories/:id Route to delete a category by ID
router.delete('/:id', deleteCategory);

export default router;
