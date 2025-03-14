/**
 * @file inventoryController.ts
 * @description This file contains the controllers for managing inventory items in the EEE-Inventory system.
 */

import { Request, Response } from 'express';
import { itemRepository } from '../repositories/repositories.js';

// Controller to add an inventory item
export const addInventoryItem = async (req: Request, res: Response) => {
    try {
        const newItem = itemRepository.create(req.body);
        const result = await itemRepository.save(newItem);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error adding inventory item', error });
    }
};

// Controller to get all unique values of the field labInchargeAtPurchase
export const getUniqueLabIncharges = async (req: Request, res: Response) => {
    try {
        const uniqueLabIncharges = await itemRepository
            .createQueryBuilder('inventoryItem')
            .select('DISTINCT inventoryItem.labInchargeAtPurchase')
            .getRawMany();
        res.status(200).json(uniqueLabIncharges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unique lab incharges', error });
    }
};
