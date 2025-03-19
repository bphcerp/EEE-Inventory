/**
 * @file vendorController.ts
 * @description This file contains the controllers for managing vendor-related operations.
 */

import { Request, Response } from 'express';
import { vendorRepository } from '../repositories/repositories';

// Get All Vendors Controller
export const getAllVendors = async (_req: Request, res: Response) => {
    try {
        const vendors = await vendorRepository.find();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors', error });
        console.error(error);
    }
};

// Add Vendor Controller
export const addVendor = async (req: Request, res: Response) => {
    try {
        const newVendor = await vendorRepository.save(req.body);
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

// Delete Vendor Controller
export const deleteVendor = async (req: Request, res: Response) => {
    try {
        await vendorRepository.delete(req.params.id);
        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vendor', error });
        console.error(error);
    }
};
