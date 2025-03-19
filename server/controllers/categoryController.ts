import { Request, Response } from 'express';
import { categoryRepository } from '../repositories/repositories';


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

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryRepository.findOneBy({ id: req.params.id });
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return
        }
        categoryRepository.merge(category, req.body);
        const updatedCategory = await categoryRepository.save(category);
        res.json(updatedCategory);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to update category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const result = await categoryRepository.delete(req.params.id);
        if (result.affected === 0) {
            res.status(404).json({ error: 'Category not found' });
            return
        }
        res.status(204).send();
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
