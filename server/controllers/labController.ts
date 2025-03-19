/**
 * @file labController.ts
 * @description This file contains the controllers for managing lab-related operations. 
*/

import { Request, Response } from 'express';
import { labRepository } from '../repositories/repositories';

// Get All Laboratories Controller
export const getAllLabs = async (_req: Request, res: Response) => {
    try {
        const labs = await labRepository.find({
            relations: ['technicianInCharge','facultyInCharge']
        });
        res.status(200).json(labs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching laboratories', error });
        console.error(error);
    }
};

// Add Laboratory Controller
export const addLab = async (req: Request, res: Response) => {
    try {
        const { name, code, technicianInChargeId, facultyInChargeId } = req.body;

        // Validate input
        if (!name || !code) {
            res.status(400).json({ message: 'Name and code are required' });
            return
        }

        // Check if lab with the same code already exists
        const existingLab = await labRepository.findOne({ where: { code } });
        if (existingLab) {
            res.status(409).json({ message: 'Laboratory with this code already exists' });
            return
        }

        // Create and save the new lab
        const newLab = labRepository.create({
            name,
            code,
        });
        newLab.facultyInCharge = { id: facultyInChargeId } as any
        newLab.technicianInCharge = { id : technicianInChargeId } as any
        await labRepository.save(newLab);

        res.status(201).json({ message: 'Laboratory added successfully', lab: newLab });
    } catch (error) {
        res.status(500).json({ message: (error as any)?.code === '23505' ? 'Lab already exists' : 'Error adding lab', error });
        console.error(error);
    }
};
