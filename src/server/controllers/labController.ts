import { Request, Response } from 'express';
import { labRepository } from '../repositories/repositories.js';

// Get All Laboratories Controller
export const getAllLabs = async (_req: Request, res: Response) => {
    try {
        const labs = await labRepository.find();
        res.status(200).json(labs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching laboratories', error: (error as Error).message });
        console.error(error);
    }
};
