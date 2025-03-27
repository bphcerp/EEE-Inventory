/**
 * @file labController.ts
 * @description This file contains the controllers for managing lab-related operations. 
*/

import { Request, Response } from 'express';
import { labRepository } from '../repositories/repositories';
import { Laboratory } from '../entities/entities';

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
        const newLabData: Laboratory = req.body;

        // Validate input
        if (!newLabData.name || !newLabData.code) {
            res.status(400).json({ message: 'Name and code are required' });
            return
        }

        // Check if lab with the same code already exists
        const existingLab = await labRepository.findOne({ where: { code: newLabData.code } });
        if (existingLab) {
            res.status(409).json({ message: 'Laboratory with this code already exists' });
            return
        }

        // Create and save the new lab
        const newLab = labRepository.create(newLabData);
        await labRepository.save(newLab);

        res.status(201).json({ message: 'Laboratory added successfully', lab: newLab });
    } catch (error) {
        res.status(500).json({ message: (error as any)?.code === '23505' ? 'Lab already exists' : 'Error adding lab', error });
        console.error(error);
    }
};
