/**
 * @file labController.ts
 * @description This file contains the controllers for managing lab-related operations. 
*/

import { Request, Response } from 'express';
import { labRepository } from '../repositories/repositories';

// Get All Laboratories Controller
export const getAllLabs = async (_req: Request, res: Response) => {
    try {
        const labs = await labRepository.find();
        res.status(200).json(labs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching laboratories', error });
        console.error(error);
    }
};
