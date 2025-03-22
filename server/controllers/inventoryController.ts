/**
 * @file inventoryController.ts
 * @description This file contains the controllers for managing inventory items in the EEE-Inventory system.
 */

import { Request, Response } from 'express';
import { categoryRepository, itemRepository, labRepository, tokenRepository, userRepository } from '../repositories/repositories';
import { In, IsNull } from 'typeorm';
import fs from 'fs';
import path from 'path';
import { Category, InventoryItem, Laboratory, User } from '../entities/entities';
import { WSResponse } from 'websocket-express';
import * as XLSX from 'xlsx';

import parser from 'any-date-parser';


type validSheetType = {
    sheetName: string
    index: number
    rowOffset: number
    columnOffset: number
    dataOffset: number
}

const getValidLabNames = (path: string) => {
    // Read the workbook from the file path
    const workbook = XLSX.readFile(path);
    const validSheets: validSheetType[] = [];

    // Iterate over each sheet in the workbook
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {

        const sheet = workbook.Sheets[sheetName];
        // Convert sheet to an array of arrays (each inner array is a row)
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Look for a row whose first cell equals "Item Category"
        const headerRowIndex = data.findIndex(row => (row as any[]).includes("Item Category"));

        if (headerRowIndex !== -1) {
            const headerRow = data[headerRowIndex] as string[];
            // Find the column index where "Sl. No." is located in the header row
            const columnOffset = headerRow.findIndex(cell => cell === "Sl. No.");

            // Only add the sheet if both "Item Category" and "Sl. No." were found
            if (columnOffset !== -1) {
                const dataOffset = data.findIndex(row => (row as any[])[columnOffset] === 1)

                validSheets.push({
                    sheetName,
                    index: sheetIndex,
                    rowOffset: headerRowIndex,
                    columnOffset,
                    dataOffset
                });
            }
        }
    });

    return validSheets;
};

// Function to check if a lab exists, otherwise create a new one
async function findOrCreateLab(labName: string): Promise<Laboratory> {
    let existingLab = await labRepository.findOneBy({ name: labName }); // Assume this is a DB lookup function
    if (!existingLab) {
        existingLab = new Laboratory();
        existingLab.name = labName;
        existingLab = await labRepository.save(existingLab)

        try {
            existingLab = await labRepository.save(existingLab);
        } catch (error) {
            // If the error is due to a unique constraint violation, try finding the user again
            if ((error as any).code === '23505') { // PostgreSQL unique violation error code
                existingLab = await labRepository.findOneBy({ name: labName });
                return existingLab!
            }
        }

    }
    return existingLab;
}

// Function to check if a user exists, otherwise create a new one
async function findOrCreateUser(userName: string, type: 'Faculty' | 'Technician'): Promise<User> {
    let existingUser = await userRepository.findOneBy({ name: userName }); // Assume this is a DB lookup function
    if (!existingUser) {
        existingUser = new User();
        existingUser.name = userName;
        existingUser.permissions = 0
        existingUser.role = type

        try {
            existingUser = await userRepository.save(existingUser);
        } catch (error) {
            // If the error is due to a unique constraint violation, try finding the user again
            if ((error as any).code === '23505') { // PostgreSQL unique violation error code
                existingUser = await userRepository.findOneBy({ name: userName });
                return existingUser!
            }
        }

    }
    return existingUser;
}

// Some dates have dots in them
const parseDate = (date: string | Date) => {
    const parsedDate = parser.fromAny(date)
    return parsedDate.invalid ? null : parsedDate
}

async function mapToInventoryItem(data: any[]): Promise<any> {
    return {
        itemCategory: data[1],
        itemName: data[2],
        specifications: data[3],
        quantity: data[4],
        noOfLicenses: data[5] !== "NA" ? Number(data[5]) : undefined,
        natureOfLicense: data[6] !== "NA" ? data[6] : undefined,
        yearOfLease: data[7] !== "NA" ? Number(data[7]) : undefined,
        poAmount: data[8] ? typeof data[8] === 'string' ? parseFloat(data[8].replace(/,/g, "")) : data[8] : 0, // Convert to number, removing commas
        poNumber: data[10],
        poDate: parseDate(data[12]),
        lab: await findOrCreateLab(data[14]),
        labInchargeAtPurchase: data[15],
        labTechnicianAtPurchase: data[16],
        equipmentID: data[17] || "Not Provided", // Use empty string if null
        fundingSource: data[18],
        dateOfInstallation: parseDate(data[19]),
        vendorName: data[20] ?? "Not Provided",
        vendorAddress: data[21] ?? "Not Provided",
        vendorPOCName: data[22] ?? "Not Provided",
        vendorPOCPhoneNumber: data[23]?.toString() ?? "Not Provided",
        vendorPOCEmailID: data[24] ?? "Not Provided",
        warrantyFrom: parseDate(data[25]),
        warrantyTo: parseDate(data[26]),
        amcFrom: parseDate(data[27]),
        amcTo: parseDate(data[28]),
        currentLocation: data[29],
        softcopyOfPO: data[30] !== "NA" ? data[30] : undefined,
        softcopyOfInvoice: data[31] !== "NA" ? data[31] : undefined,
        softcopyOfNFA: data[32] !== "NA" ? data[32] : undefined,
        softcopyOfAMC: data[33] !== "NA" ? data[33] : undefined,
        status: (data[34] ? (data[34] as string).toLowerCase() === "working" ? "Working" : "Not Working" : null) as "Working" | "Not Working" | null,
        equipmentPhoto: data[35] !== "NA" ? data[35] : undefined,
        remarks: data[36] || undefined
    };
}

const getAndSaveDataFromSheets = (path: string, sheetsMeta: validSheetType[]) => {
    // Read workbook with dates preserved
    const workbook = XLSX.readFile(path, { cellDates: true });

    return sheetsMeta.map(async (meta) => {
        const { sheetName, rowOffset, columnOffset, dataOffset } = meta;
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            console.warn(`Sheet ${sheetName} not found.`);
            return { ...meta, data: [] };
        }

        // Get sheet data as an array of arrays
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        // Process filtered data:
        // - Slice rows starting at dataOffset (where the actual data begins)
        // - Filter out all of the rows for which Item Name is not set (they're empty rows. Item Name is mandatory)
        // - For each row, slice columns starting at columnOffset
        // - For each cell, if a hyperlink exists (in sheet[cellRef].l.Target),
        //   replace the cell value with the hyperlink URL.
        const filteredData = jsonData.slice(dataOffset).filter((row) => (row as any[])[columnOffset + 2] !== null).map((row, rowIndex) =>
            (row as any[]).slice(columnOffset).map((cell, colIndex) => {
                // Compute Excel cell reference from dataOffset and columnOffset
                const cellRef = XLSX.utils.encode_cell({ r: dataOffset + rowIndex, c: columnOffset + colIndex });
                if (sheet[cellRef] && sheet[cellRef].l && sheet[cellRef].l.Target) {
                    return sheet[cellRef].l.Target;
                }
                return cell;
            })
        );

        // Parse and Save Data

        return await Promise.all(filteredData.map(mapToInventoryItem))

    });
};


export const getAccessToken = async (req: Request, res: Response) => {
    const queryRunner = itemRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
        const token = await tokenRepository.findOneBy({ admin: req.user! });

        if (token) {
            if (token.tokenExpiry < new Date()) {
                await queryRunner.manager.delete(tokenRepository.target, token);
            } else {
                await queryRunner.commitTransaction();
                res.status(200).json({ accessToken: token.id });
                return;
            }
        }

        const newToken = tokenRepository.create();
        newToken.tokenExpiry = new Date(Date.now() + 10 * 60);
        newToken.admin = { id: req.user!.id } as any;
        const savedToken = await queryRunner.manager.save(newToken);

        await queryRunner.commitTransaction();
        res.status(201).json({ accessToken: savedToken.id });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        res.status(500).json({ message: 'Error generating access token', error });
        console.error(error);
    } finally {
        await queryRunner.release();
    }
};

export const addBulkData = async (req: Request, res: WSResponse) => {
    try {
        console.log("Bulk Data - WebSocket Connecting...");

        const { access_token } = req.query;

        if (!access_token) {
            console.error("Websocket connection rejected - No token provided");
            res.reject(401, JSON.stringify({ error: "No token provided" }));
            return;
        }

        const token = await tokenRepository.findOneBy({ id: access_token as string });

        if (!token) {
            console.error("Websocket connection rejected - Invalid token provided");
            res.reject(403, JSON.stringify({ error: "Invalid token provided" }));
            return;
        }

        const ws = await res.accept();

        ws.on("message", async (msg: any, isBinary) => {
            try {
                const savePath = path.join('temp', `temp-${token.id}.xlsx`)
                //Stage 1 has file upload
                if (isBinary) {
                    console.log("------------ STAGE 1 ----------------")
                    if (!fs.existsSync('temp')) fs.mkdirSync('temp')

                    fs.writeFileSync(savePath, msg)

                    const validSheets: validSheetType[] = getValidLabNames(savePath)

                    if (validSheets.length == 0) throw Error("No valid sheets found")

                    console.log(`------------ File Saved at temp/temp-${token.id}.xlsx ----------------`)

                    // If it's one go straight to stage 3
                    if (validSheets.length > 1) {
                        ws.send(JSON.stringify({ stage: 2, validSheets }))
                        return
                    }
                    else ws.send(JSON.stringify({ stage: 3 }))
                }
                // Stage - 3 Response Selected Labs

                const msgJSON = JSON.parse(msg)
                ws.send(JSON.stringify({ stage: 3 }))
                const allItemsToBeAdded = await Promise.all(getAndSaveDataFromSheets(savePath, msgJSON.selectedSheets))
                const allItemsToBeAddedFlattened = allItemsToBeAdded.flat()

                const inventoryItems = itemRepository.create(allItemsToBeAddedFlattened)
                await itemRepository.insert(inventoryItems)

                ws.send(JSON.stringify({ stage: 4 }))

            } catch (e) {
                console.error({ error: (e as Error).message ?? "Something went wrong" });
                ws.send(JSON.stringify({ error: (e as Error).message ?? "Something went wrong" }));
                // itemRepository.delete({ id: token.id });
            }
        });

        ws.on("close", () => {
            const excelPath = path.join('temp', `temp-${token.id}.xlsx`)
            if (fs.existsSync(excelPath)) fs.rmSync(excelPath)
            console.log("WebSocket Disconnected");
        });
    } catch (e) {
        res.sendError(500, 500, (e as Error).message ?? "Something went wrong");
    }
};


// Controller to add an inventory item
export const addInventoryItem = async (req: Request, res: Response) => {
    // Assumes upload middleware is used while handling the route
    try {

        // Parse form data and convert date fields back to Date objects
        const formData = {
            ...req.body,
            poDate: req.body.poDate ? new Date(req.body.poDate) : null,
            dateOfInstallation: req.body.dateOfInstallation ? new Date(req.body.dateOfInstallation) : null,
            warrantyFrom: req.body.warrantyFrom ? new Date(req.body.warrantyFrom) : null,
            warrantyTo: req.body.warrantyTo ? new Date(req.body.warrantyTo) : null,
            amcFrom: req.body.amcFrom ? new Date(req.body.amcFrom) : null,
            amcTo: req.body.amcTo ? new Date(req.body.amcTo) : null
        };

        const lab = await labRepository.findOneBy({ id : req.body.labId })
        const category = await categoryRepository.findOneBy({id: req.body.itemCategory})
        const lastItemNumber = (await itemRepository.query(`
            SELECT COUNT(DISTINCT "serialNumber")::int AS count 
            FROM inventory_item 
            WHERE "labId" = $1
        `, [req.body.labId]))[0].count + 1

        let result: InventoryItem | InventoryItem[];
        if (req.body.quantity == 1){
            const equipmentID = `BITS/EEE/${lab!.code}/${category!.code}/${lastItemNumber}`
            const newItem = itemRepository.create(formData as Object);
            newItem.lab = req.body.labId ? { id: req.body.labId } as any : undefined
            newItem.vendor = req.body.vendorId ? { id: req.body.vendorId } as any : undefined
            newItem.equipmentID = equipmentID
            newItem.serialNumber = lastItemNumber
            result = await itemRepository.save(newItem);
        }
        else {
            const baseEquipmentID = `BITS/EEE/${lab!.code}/${category!.code}/${lastItemNumber}`;
            const items = Array.from({ length: req.body.quantity }, (_, i) => ({
                ...formData,
                lab: req.body.labId ? { id: req.body.labId } as any : undefined,
                vendor: req.body.vendorId ? { id: req.body.vendorId } as any : undefined,
                equipmentID: `${baseEquipmentID}-${i + 1}`,
                serialNumber: lastItemNumber
            }));
            result = await itemRepository.save(itemRepository.create(items));
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error adding inventory item', error });
        console.error(error)
    }
};

// Get serial number for a to be added item (no of items for that lab + 1)
export const getLastItemNumber = async (req: Request, res: Response) => {

    try {
        const lastItemNumber = (await itemRepository.query(`
            SELECT COUNT(DISTINCT "serialNumber")::int AS count 
            FROM inventory_item 
            WHERE "labId" = $1
        `, [req.params.labId]))[0].count + 1
        res.status(200).json({ lastItemNumber });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory items', error });
        console.error(error);
    }
};


// Get all items from the inventory
export const getInventory = async (req: Request, res: Response) => {

    try {
        const items = await itemRepository.find({
            where: { transfer: IsNull()},
            relations: ['lab', 'vendor', 'itemCategory']
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory items', error });
        console.error(error);
    }
};


// Transfer items from one lab to another
export const transferItems = async (req: Request, res: Response) => {
    try {
        const { itemIds, destLabId } = req.body;

        if (!itemIds || !destLabId) {
            res.status(400).json({ message: "itemIds and destLabId are required" });
            return
        }

        const destLab = await labRepository.findOneBy({ id: destLabId });
        if (!destLab) {
            res.status(404).json({ message: "Destination lab not found" });
            return
        }

        const itemsToTransfer = await itemRepository.find({ where : { id : In(itemIds) }, relations: ['lab', 'itemCategory']});
        if (itemsToTransfer.length !== itemIds.length) {
            res.status(404).json({ message: "Some items not found" });
            return
        }

        const lastItemNumber = (await itemRepository.query(`
            SELECT COUNT(DISTINCT "serialNumber")::int AS count 
            FROM inventory_item 
            WHERE "labId" = $1
        `, [destLabId]))[0].count + 1;

        const newItems = itemsToTransfer.map((item, index) => {
            const newEquipmentID = item.equipmentID.includes('-')
                ? `BITS/EEE/${destLab.code}/${(item.itemCategory as unknown as Category).code}/${lastItemNumber}-${item.equipmentID.split('-')[1]}`
                : `BITS/EEE/${destLab.code}/${(item.itemCategory as unknown as Category).code}/${lastItemNumber}`;
            return {
                ...item,
                id: undefined, // Let TypeORM generate a new ID
                lab: destLab,
                equipmentID: newEquipmentID,
            };
        });

        const createdItems = await itemRepository.save(itemRepository.create(newItems));

        // Update the transfer field of the old items
        for (let i = 0; i < itemsToTransfer.length; i++) {
            itemsToTransfer[i].transfer = createdItems[i];
        }
        await itemRepository.save(itemsToTransfer);

        res.status(200).json({ message: "Items transferred successfully", transferredItems: createdItems });
    } catch (error) {
        res.status(500).json({ message: 'Error transferring items', error });
        console.error(error);
    }
};
