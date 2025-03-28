import { Request, Response } from 'express';
import { categoryRepository, itemRepository } from '../repositories/repositories';


export const getAllCategories = async (req: Request, res: Response) => {

    if (!['Vendor', 'Inventory'].includes(req.query.type as string)){
        res.status(400).send({ message : "Only types Vendor and Inventory allowed" })
        return
    }

    try {
        const categories = await categoryRepository.findBy({ type : req.query.type as 'Vendor' | 'Inventory'});
        res.json(categories);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await categoryRepository.findOneBy({ id: req.params.id });
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return
        }
        res.json(category);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch category' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = categoryRepository.create(req.body);
        const savedCategory = await categoryRepository.save(category);
        res.status(201).json(savedCategory);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create category' });
    }
};

// Update Category Controller
export const patchCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;


        // Check if the category exists
        const category = await categoryRepository.findOneBy({ id });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        if (await itemRepository.findOneBy({ itemCategory : { id } })){
            res.status(403).json({ message: 'Cannot update, this category has inventory items linked to it' });
            return;
        }

        // Update the category
        const updatedCategory = await categoryRepository.save(updatedData);
        res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
        console.error(error);
    }
};

// Delete Category Controller
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if the category exists
        const category = await categoryRepository.findOneBy({ id });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        // Delete the category
        await categoryRepository.delete(id);

        res.status(204).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as any)?.code === '23503' ? 'Cannot delete, this category has inventory items linked to it' : 'Error deleting category', error });
        console.error(error);
    }
};
