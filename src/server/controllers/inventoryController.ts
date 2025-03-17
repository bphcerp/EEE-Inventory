/**
 * @file inventoryController.ts
 * @description This file contains the controllers for managing inventory items in the EEE-Inventory system.
 */

import { Request, Response } from 'express';
import { itemRepository } from '../repositories/repositories.js';
import { In } from 'typeorm';
import fs from 'fs';
import path from 'path';
import { InventoryItem } from '../entities/entities.js';

// Controller to add an inventory item
export const addInventoryItem = async (req: Request, res: Response) => {
    // Assumes upload middleware is used while handling the route
    try {
        console.log(req.files);

        // Parse form data and convert date fields back to Date objects
        const formData = {
            ...req.body,
            poDate: req.body.poDate ? new Date(req.body.poDate) : null,
            dateOfInstallation: req.body.dateOfInstallation ? new Date(req.body.dateOfInstallation) : null,
            warrantyFrom: req.body.warrantyFrom ? new Date(req.body.warrantyFrom) : null,
            warrantyTo: req.body.warrantyTo ? new Date(req.body.warrantyTo) : null,
            amcFrom: req.body.amcFrom ? new Date(req.body.amcFrom) : null,
            amcTo: req.body.amcTo ? new Date(req.body.amcTo) : null,
            softcopyOfPO: (req.files as any)?.softcopyOfPO?.[0]?.path || null,
            softcopyOfInvoice: (req.files as any)?.softcopyOfInvoice?.[0]?.path || null,
            softcopyOfNFA: (req.files as any)?.softcopyOfNFA?.[0]?.path || null,
            softcopyOfAMC: (req.files as any)?.softcopyOfAMC?.[0]?.path || null,
            equipmentPhoto: (req.files as any)?.equipmentPhoto?.[0]?.path || null,
        };

        const newItem = itemRepository.create(formData as Object);
        newItem.lab = { id : req.body.labId } as any
        newItem.labTechnicianAtPurchase =  { id : req.body.labTechnicianAtPurchaseId } as any
        newItem.labInchargeAtPurchase =  { id : req.body.labInchargeAtPurchaseId } as any
        const result = await itemRepository.save(newItem);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error adding inventory item', error });
        console.error(error)
    }
};


// Get all items from the inventory
export const getInventory = async (req: Request, res: Response) => {
    const { allLabs } = req.query;

    try {
        const items = await itemRepository.find({
            ...( !allLabs ? { where : { lab : In(req.user!.laboratories ?? []) } } : {} ),
            relations: ['lab']
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory items', error });
        console.error(error);
    }
};

// Controller to get a file based on the path saved in the inventory item fields
export const getFile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { field } = req.query;

    if (!id || !field) {
        res.status(400).json({ message: 'Item ID and field are required' })
        return
    }

    try {
        const item = await itemRepository.findOneBy({ id });

        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return
        }

        const filePath = item[field as keyof InventoryItem];

        if (!filePath) {
            res.status(404).json({ message: 'File not found for the specified field' });
            return
        }

        const absolutePath = path.resolve(filePath as string);

        fs.access(absolutePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ message: 'File not found' });
            }

            res.sendFile(absolutePath);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching file', error });
        console.error(error);
    }
};
