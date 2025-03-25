/**
 * @file inventoryController.ts
 * @description This file contains the controllers for managing inventory items in the EEE-Inventory system.
 */

import { Request, Response } from 'express';
import { categoryRepository, itemRepository, labRepository, tokenRepository, userRepository, vendorRepository } from '../repositories/repositories';
import { In, IsNull, LessThanOrEqual, QueryRunner } from 'typeorm';
import fs from 'fs';
import path from 'path';
import { Category, InventoryItem, Laboratory, User } from '../entities/entities';
import { WSResponse } from 'websocket-express';
import * as XLSX from 'xlsx';

import parser from 'any-date-parser';

type SheetInfo = {
    sheetName: string;
    columnOffset: number;
    dataOffset: number;
    columnIndexMap: Record<string, number>;
};

const getIsValidLabSheet = (path: string): SheetInfo | null => {
    const workbook = XLSX.readFile(path);

    // Ensure there's only one sheet
    if (workbook.SheetNames.length !== 1) return null;

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to an array of arrays
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Find the header row containing "Sl. No." (case-insensitive & trimmed)
    const headerRowIndex = data.findIndex((row) =>
        (row as any[]).some((cell) => typeof cell === "string" && cell.trim().toLowerCase() === "sl. no.")
    );
    if (headerRowIndex === -1) return null; // No valid headers found

    const headerRow = (data[headerRowIndex] as string[]).map((header) =>
        typeof header === "string" ? header.trim().toLowerCase() : ""
    );

    // Create a mapping of column headers to indices
    const columnIndexMap: Record<string, number> = {};
    headerRow.forEach((header, index) => {
        if (header) columnIndexMap[header] = index;
    });

    // Get the column index for "sl. no."
    const columnOffset = columnIndexMap["sl. no."];
    if (columnOffset === undefined) return null;

    // Find the dataOffset (first row where "Sl. No." is 1)
    const dataOffset = data.findIndex((row) => (row as any[])[columnOffset] === 1);
    if (dataOffset === -1) return null;

    return {
        sheetName,
        columnOffset,
        dataOffset,
        columnIndexMap,
    };
};

// Some dates have dots in them
const parseDate = (date: any | Date) => {
    if (!date) return undefined

    if (date instanceof Date) return date
    if (!isNaN(new Date(date.toString()).getTime())) return new Date(date.toString())
    
    // For those edge cases where there are dots or slashes instead of dashes
    const parsedDate = parser.fromAny(date.toString())
    return parsedDate.invalid ? null : parsedDate
}

async function mapToInventoryItemAndSave(data: any[], selectedLab: Laboratory, columnIndexMap: Record<string, number>, queryRunner: QueryRunner): Promise<any> {

    const vendor = (await vendorRepository.findOneBy({ vendorId: data[columnIndexMap['vendor id']] })) ?? undefined
    const itemCategory = await categoryRepository.findOneBy({ code: data[columnIndexMap['category code']] })

    if (!itemCategory) throw Error(`Item category with code ${data[columnIndexMap['category code']]} invalid`)

    const lastItemNumber = ((await queryRunner.manager.query(`
        SELECT COALESCE(MAX("serialNumber")::int, 0) AS count 
        FROM inventory_item 
        WHERE "labId" = $1` , [selectedLab.id]))[0].count) + 1;


    const baseItem: Partial<InventoryItem> = {
        itemCategory,
        serialNumber: lastItemNumber,
        itemName: data[columnIndexMap["item name"]],
        specifications: data[columnIndexMap["specification(s)"]],
        quantity: Number(data[columnIndexMap["quantity"]]),
        noOfLicenses: Number(data[columnIndexMap["no of licenses"]]) ? Number(data[columnIndexMap["no of licenses"]]):  undefined,
        natureOfLicense: data[columnIndexMap["nature of license"]] !== "NA" ? data[columnIndexMap["nature of license"]] : undefined,
        yearOfLease: Number(data[columnIndexMap["year of lease"]]) ? Number(data[columnIndexMap["year of lease"]]) :  undefined,
        poAmount: !isNaN(Number(data[columnIndexMap["item amount in po (inr)"]]))
            ? typeof data[columnIndexMap["item amount in po (inr)"]] === "string"
                ? parseFloat(data[columnIndexMap["item amount in po (inr)"]].replace(/,/g, ""))
                : data[columnIndexMap["item amount in po (inr)"]]
            : 0, // Convert to number, removing commas
        poNumber: data[columnIndexMap["po number"]],
        poDate: parseDate(data[columnIndexMap["po date"]])!,
        lab: selectedLab,
        labInchargeAtPurchase: data[columnIndexMap["lab incharge at the time of purchase"]],
        labTechnicianAtPurchase: data[columnIndexMap["lab technician at the time of purchase"]],
        fundingSource: data[columnIndexMap["funding source"]],
        dateOfInstallation: parseDate(data[columnIndexMap["date of installation"]]) ?? undefined,
        vendor,
        warrantyFrom: parseDate(data[columnIndexMap["warranty details"]]) ?? undefined,
        warrantyTo: parseDate(data[columnIndexMap["warranty details"] + 1]) ?? undefined, // Assuming "to" is the next column (Warranty Details is a merged column)
        amcFrom: parseDate(data[columnIndexMap["amc details"]]) ?? undefined,
        amcTo: parseDate(data[columnIndexMap["amc details"] + 1]) ?? undefined, // Assuming "to" is the next column (AMC Details is a merged column)
        currentLocation: data[columnIndexMap["current location of the item"]],
        softcopyOfPO: data[columnIndexMap["softcopy of po"]] !== "NA" ? data[columnIndexMap["softcopy of po"]] : undefined,
        softcopyOfInvoice: data[columnIndexMap["softcopy of invoice"]] !== "NA" ? data[columnIndexMap["softcopy of invoice"]] : undefined,
        softcopyOfNFA: data[columnIndexMap["softcopy of nfa"]] !== "NA" ? data[columnIndexMap["softcopy of nfa"]] : undefined,
        softcopyOfAMC: data[columnIndexMap["softcopy of amc"]] !== "NA" ? data[columnIndexMap["softcopy of amc"]] : undefined,
        status: data[columnIndexMap["status"]] === "working" ? "Working" : null,
        equipmentPhoto: data[columnIndexMap["equipment photo (for cost above 10 lakhs)"]] !== "NA"
            ? data[columnIndexMap["equipment photo (for cost above 10 lakhs)"]]
            : undefined,
        remarks: data[columnIndexMap["remarks"]] || undefined,
    };

    if (baseItem.quantity === 1) {
        baseItem.equipmentID = `BITS/EEE/${selectedLab.code}/${itemCategory.code}/${lastItemNumber}`
        const newItem = queryRunner.manager.create(InventoryItem, baseItem)
        await queryRunner.manager.save(newItem)
    }
    else {
        const baseEquipmentID = `BITS/EEE/${selectedLab.code}/${itemCategory.code}/${lastItemNumber}`;
        const items = Array.from({ length: baseItem.quantity! }, (_, i) => ({
            ...baseItem,
            equipmentID: `${baseEquipmentID}-${i + 1}`,
        }));
        await queryRunner.manager.save(queryRunner.manager.create(InventoryItem, items));
    }
}

const getAndSaveDataFromSheet = async (path: string, sheetInfo: SheetInfo, selectedLabId: string) => {
    // Read workbook with dates preserved

    const workbook = XLSX.readFile(path, { cellDates: true });

    const { sheetName, columnOffset, dataOffset } = sheetInfo;
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw Error(`Sheet ${sheetName} not found.`)

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

    const selectedLab = (await labRepository.findOneBy({ id: selectedLabId }))!;
    const queryRunner = itemRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
        for (const item of filteredData) {
            if (!item[sheetInfo.columnIndexMap['item name']]) continue; // Skip empty rows
            await mapToInventoryItemAndSave(item, selectedLab, sheetInfo.columnIndexMap, queryRunner);
        }
        await queryRunner.commitTransaction();
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error saving data from sheet:", error);
        throw error;
    } finally {
        await queryRunner.release();
    }
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

                    const sheetInfo = getIsValidLabSheet(savePath)

                    if (!sheetInfo) throw Error("An invalid sheet was uploaded. Please check again!")
                    else if (!sheetInfo.columnIndexMap['vendor id']) throw Error("Vendor Id column not found. Please check again!")
                    else if (!sheetInfo.columnIndexMap['category code']) throw Error("Category Code column not found. Please check again!")

                    console.log(`------------ File Saved at temp/temp-${token.id}.xlsx ----------------`)

                    ws.send(JSON.stringify({ stage: 2, sheetInfo }))
                }
                else if (JSON.parse(msg).stage === 2) {
                    // Stage - 2 Extract Data
                    const { sheetInfo, selectedLabId } = JSON.parse(msg)

                    await getAndSaveDataFromSheet(savePath, sheetInfo, selectedLabId)

                    ws.send(JSON.stringify({ stage: 3 }))
                }

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

        const lab = await labRepository.findOneBy({ id: req.body.labId })
        const category = await categoryRepository.findOneBy({ id: req.body.itemCategory })
        const lastItemNumber = (await itemRepository.query(`
            SELECT COALESCE(MAX("serialNumber")::int, 0) AS count 
            FROM inventory_item 
            WHERE "labId" = $1`, [req.body.labId]))[0].count + 1

        let result: InventoryItem | InventoryItem[];
        if (req.body.quantity == 1) {
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
            SELECT COALESCE(MAX("serialNumber")::int, 0) AS count 
            FROM inventory_item 
            WHERE "labId" = $1`, [req.params.labId]))[0].count + 1
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
            where: { transfer: IsNull() },
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

        const itemsToTransfer = await itemRepository.find({ where: { id: In(itemIds), transfer: IsNull() }, relations: ['lab', 'itemCategory', 'vendor'] });
        if (itemsToTransfer.length !== itemIds.length) {
            res.status(404).json({ message: "Some items not found" });
            return
        }

        const lastItemNumber = (await itemRepository.query(`
            SELECT COALESCE(MAX("serialNumber")::int, 0) AS count 
            FROM inventory_item 
            WHERE "labId" = $1`, [destLabId]))[0].count + 1;

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

export const getImportantDates = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const items = await itemRepository
            .createQueryBuilder("inventory_item")
            .distinctOn(['inventory_item.serialNumber', 'inventory_item.labId'])
            .leftJoinAndSelect("inventory_item.lab", "lab")
            .where("(inventory_item.warrantyTo IS NOT NULL AND inventory_item.warrantyTo <= :nextWeek)")
            .orWhere("(inventory_item.amcTo IS NOT NULL AND inventory_item.amcTo <= :nextWeek)")
            .setParameters({ nextWeek })
            .getMany()

        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching important dates:", error);
        res.status(500).json({ message: "Error fetching important dates", error });
    }
};
