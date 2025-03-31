import { Request, Response } from "express";
import { itemRepository } from "../repositories/repositories";

// Helper function to get the date range
const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    return { start: '2008-01-01', end: `${currentYear}-12-31` };
};

// Fetches the total quantity and price of inventory items per lab per year
export const getLabInventorySumPerYear = async (req: Request, res: Response) => {
    try {
        const { start, end } = getYearRange();

        const data = await itemRepository.query(`
            SELECT 
                "subquery"."labId" AS "labId",
                "subquery".year AS year,
                SUM("subquery"."quantity") AS "totalQuantity",
                SUM("subquery"."poAmount") AS "totalPrice"
            FROM 
                (SELECT DISTINCT ON (inventory_item."labId", inventory_item."serialNumber") 
                    inventory_item."serialNumber",  -- Ensure each serial number is counted only once
                    inventory_item."labId",
                    DATE_PART('year', inventory_item."poDate") AS year,
                    inventory_item."quantity",
                    inventory_item."poAmount"
                FROM "inventory_item"
                WHERE "inventory_item"."poDate" BETWEEN $1 AND $2 
                AND "inventory_item"."transferId" IS NULL
                ) "subquery" -- Using a subquery to filter distinct serial numbers
            GROUP BY "subquery"."labId", "subquery".year
            ORDER BY "subquery".year DESC;
        `, [start, end]);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching lab inventory sum per year', error });
    }
};

// Fetches the total quantity and price of inventory items per category, grouped by lab ID
export const getInventorySumPerCategory = async (req: Request, res: Response) => {
    try {
        const data = await itemRepository.query(`
            SELECT 
                "subquery"."labId" AS "labId",
                "subquery"."categoryId" AS "categoryId",
                SUM("subquery"."quantity") AS "totalQuantity",
                SUM("subquery"."poAmount") AS "totalPrice"
            FROM 
                (SELECT DISTINCT ON (inventory_item."labId", inventory_item."serialNumber")
                    inventory_item."serialNumber",  -- Ensure each serial number is counted only once
                    inventory_item."labId",
                    inventory_item."itemCategoryId" AS "categoryId",
                    inventory_item."quantity",
                    inventory_item."poAmount"
                FROM "inventory_item"
                WHERE "inventory_item"."transferId" IS NULL
                ) "subquery" -- Using a subquery to filter distinct serial numbers
            GROUP BY "subquery"."labId", "subquery"."categoryId";
        `);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching inventory sum per category per lab', error });
    }
};

// Fetches the total quantity and price of inventory items per vendor per year
export const getVendorSumPerYear = async (req: Request, res: Response) => {
    try {
        const { start, end } = getYearRange();

        const data = await itemRepository.query(`
            SELECT 
                "subquery"."vendorId" AS "vendorId",
                "subquery".year AS year,
                SUM("subquery"."quantity") AS "totalQuantity",
                SUM("subquery"."poAmount") AS "totalPrice"
            FROM 
                (SELECT DISTINCT ON (inventory_item."labId", inventory_item."serialNumber")
                    inventory_item."serialNumber",  -- Ensure each serial number is counted only once
                    inventory_item."vendorId",
                    DATE_PART('year', inventory_item."poDate") AS year,
                    inventory_item."quantity",
                    inventory_item."poAmount"
                FROM "inventory_item"
                WHERE "inventory_item"."poDate" BETWEEN $1 AND $2 AND "vendorId" IS NOT NULL
                AND "inventory_item"."transferId" IS NULL
                ) "subquery" -- Using a subquery to filter distinct serial numbers
            GROUP BY "subquery"."vendorId", "subquery".year
            ORDER BY "subquery".year DESC;
        `, [start, end]);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendor sum per year', error });
    }
};
