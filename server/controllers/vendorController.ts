/**
 * @file vendorController.ts
 * @description This file contains the controllers for managing vendor-related operations.
 */

import { Request, Response } from 'express';
import { vendorRepository, categoryRepository } from '../repositories/repositories';
import { In } from 'typeorm';

// Get All Vendors Controller
export const getAllVendors = async (_req: Request, res: Response) => {
    try {
        const vendors = await vendorRepository.find({relations : ['categories']});
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors', error });
        console.error(error);
    }
};

// Add Vendor Controller
export const addVendor = async (req: Request, res: Response) => {
    try {
        const vendorData = req.body;
        const newVendor = vendorRepository.create({ ...vendorData, categories: vendorData.categories.map((categoryId:string) => ({id : categoryId})) });
        await vendorRepository.save(newVendor);
        res.status(201).json(newVendor);
    } catch (error) {
        res.status(500).json({ message: 'Error adding vendor', error });
        console.error(error);
    }
};

// Edit Vendor Controller
export const editVendor = async (req: Request, res: Response) => {
    try {
        const updatedVendor = await vendorRepository.update(req.params.id, req.body);
        res.status(200).json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: 'Error editing vendor', error });
        console.error(error);
    }
};

// Update Vendor Controller
export const patchVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Check if the vendor exists
        const vendor = await vendorRepository.findOneBy({ id });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }

        // Update the vendor
        const updatedVendor = await vendorRepository.save({...updatedData, categories: updatedData.categories.map((categoryId:string) => ({id : categoryId}))});
        res.status(200).json({ message: 'Vendor updated successfully', vendor: updatedVendor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vendor', error });
        console.error(error);
    }
};

// Delete Vendor Controller
export const deleteVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if the vendor exists
        const vendor = await vendorRepository.findOneBy({ id });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }

        // Delete the vendor
        await vendorRepository.delete(id);

        res.status(204).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as any)?.code === '23503' ? ' Cannot delete, this vendor has some items of the inventory linked to them' : 'Error deleting vendor', error });
        console.error(error);
    }
};
