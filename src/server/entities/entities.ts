/**
 * @file entities.ts
 * @description This file contains the entity definitions for the User, Laboratory, and InventoryItem entities used in the EEE-Inventory system.
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable, ManyToMany } from 'typeorm';

// User entity
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", unique: true })
    email: string;

    @Column({ type: "enum", enum: ["Admin", "Technician"] })
    type: "Admin" | "Technician";

    @Column({ type: "enum", enum: [0, 1] })
    permissions: 0 | 1; // 0 for read (Technician), 1 for read and write (Admin)
}


// Laboratory entity
@Entity()
export class Laboratory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", unique: true })
    name: string;

    // The technicians related to the laboratory
    @ManyToMany(() => User, (user) => user.id)
    @JoinTable()
    technicians: User[];
}

// InventoryItem entity
@Entity()
export class InventoryItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Laboratory, (lab) => lab.id)
    labId: Laboratory; // Foreign key to the laboratory

    @Column()
    itemCategory: string; // Category of the item

    @Column()
    itemName: string; // Name of the item

    @Column("text")
    specifications: string; // Specifications of the item

    @Column("int")
    quantity: number; // Quantity of the item

    @Column("int", { nullable: true })
    noOfLicenses?: number; // Number of licenses (if applicable)

    @Column({ nullable: true })
    natureOfLicense?: string; // Nature of the license (if applicable)

    @Column("int", { nullable: true })
    yearOfLease?: number; // Year of lease (if applicable)

    @Column("decimal", { precision: 15, scale: 2 })
    itemAmountInPO: number; // Amount of the item in the purchase order

    @Column({ nullable: true })
    rangeOfItemAmount?: string; // Range of the item amount (if applicable)

    @Column()
    poNumber: string; // Purchase order number

    @Column("date")
    poDate: Date; // Purchase order date

    @Column()
    labInchargeAtPurchase: string; // Lab in-charge at the time of purchase

    @Column()
    labTechnicianAtPurchase: string; // Lab technician at the time of purchase

    @Column()
    equipmentID: string; // Equipment ID

    @Column()
    fundingSource: string; // Source of funding

    @Column("date", { nullable: true })
    dateOfInstallation?: Date; // Date of installation (if applicable)

    @Column()
    vendorName: string; // Vendor name

    @Column("text")
    vendorAddress: string; // Vendor address

    @Column()
    vendorPOCName: string; // Vendor point of contact name

    @Column()
    vendorPOCPhoneNumber: string; // Vendor point of contact phone number

    @Column()
    vendorPOCEmailID: string; // Vendor point of contact email ID

    @Column("date", { nullable: true })
    warrantyFrom?: Date; // Warranty start date (if applicable)

    @Column("date", { nullable: true })
    warrantyTo?: Date; // Warranty end date (if applicable)

    @Column("date", { nullable: true })
    amcFrom?: Date; // AMC start date (if applicable)

    @Column("date", { nullable: true })
    amcTo?: Date; // AMC end date (if applicable)

    @Column()
    currentLocation: string; // Current location of the item

    @Column({ nullable: true })
    softcopyOfPO?: string; // Soft copy of the purchase order (if applicable)

    @Column({ nullable: true })
    softcopyOfInvoice?: string; // Soft copy of the invoice (if applicable)

    @Column({ nullable: true })
    softcopyOfNFA?: string; // Soft copy of the NFA (if applicable)

    @Column({ nullable: true })
    softcopyOfAMC?: string; // Soft copy of the AMC (if applicable)

    @Column({ type: "enum", enum: ["Working", "Not Working"], nullable: true })
    status?: "Working" | "Not Working" | null; // Status of the item

    @Column({ nullable: true })
    equipmentPhoto?: string; // Photo of the equipment (if applicable)

    @Column("text", { nullable: true })
    remarks?: string; // Additional remarks (if applicable)
}