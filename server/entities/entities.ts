/**
 * @file entities.ts
 * @description This file contains the entity definitions for the User, Laboratory, and InventoryItem entities used in the EEE-Inventory system.
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable, ManyToMany, Generated, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

// User entity
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text", { unique: true })
    name: string;

    @Column({ type: "text", unique: true })
    email: string;

    @Column({ type: "enum", enum: [0, 1] })
    permissions: 0 | 1; // 0 for read (non-Admin), 1 for read and write (Admin)

    @Column({ type: "enum", enum: ["Admin", "Technician", "Faculty"]})
    role: "Admin" | "Technician" | "Faculty"; // 0 for read (non-Admin), 1 for read and write (Admin)
    
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
}

// Laboratory entity
@Entity()
export class Laboratory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", unique: true })
    name: string;

    @Column({ type: "text", nullable: true })
    location?: string;

    @Column({ type: "char", length: 4 })
    code: string;

    @ManyToOne(() => User)
    technicianInCharge: User

    @ManyToOne(() => User)
    facultyInCharge: User

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
}

//Category Entity
@Entity()
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", unique: true })
    name: string;

    @Column({ type: "char", length: 4 })
    code: string;

    @Column({ type: "enum", enum: ['Vendor', 'Inventory'] })
    type: 'Vendor' | 'Inventory'

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
}

//Vendor
@Entity()
export class Vendor {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "int" })
    vendorId: number; // Temporary ID for easier bulk-entry

    @Column({ type: "text" })
    name: string;

    @Column("text", { nullable: true })
    address: string; // Vendor address

    @Column("text")
    pocName: string; // Vendor point of contact name

    @Column("text")
    phoneNumber: string; // Vendor point of contact phone number

    @Column("text")
    email: string; // Vendor point of contact email ID

    @ManyToMany(() => Category)
    @JoinTable()
    categories: Category[]

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;  
} 

// AccessToken entity
@Entity()
export class AccessToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    
    @OneToOne(() => User)
    @JoinColumn()
    admin: User

    @Column("timestamp with time zone")
    tokenExpiry: Date;

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
}

// InventoryItem entity
@Entity()
export class InventoryItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("int")
    serialNumber: number; // Serial number ( Same for equipments entered at one time )

    @ManyToOne(() => Laboratory)
    lab: Laboratory; // Foreign key to the laboratory

    @OneToOne(() => InventoryItem, { nullable: true })
    @JoinColumn()
    transfer?: InventoryItem; // Foreign key to the transferred item (is set once the item is transferred)

    @ManyToOne(() => Category)
    itemCategory: Category;

    @Column("text")
    itemName: string; // Name of the item

    @Column("text", { nullable: true })
    specifications: string; // Specifications of the item

    @Column("int")
    quantity: number; // Quantity of the item

    @Column("int", { nullable: true })
    noOfLicenses?: number; // Number of licenses (if applicable)

    @Column("text", { nullable: true })
    natureOfLicense?: string; // Nature of the license (if applicable)

    @Column("int", { nullable: true })
    yearOfLease?: number; // Year of lease (if applicable)

    @Column("decimal", { precision: 15, scale: 2 })
    poAmount: number; // Amount of the item in the purchase order

    @Column("text", { nullable: true })
    poNumber: string; // Purchase order number

    @Column("date", { nullable: true })
    poDate: Date; // Purchase order date

    @Column("text", { nullable: true })
    labInchargeAtPurchase?: string; // Lab in-charge at the time of purchase

    @Column("text", { nullable: true })
    labTechnicianAtPurchase?: string; // Lab technician at the time of purchase

    @Column("text", { unique: true })
    equipmentID: string; // Equipment ID

    @Column({ type: "enum", enum: ['Institute', 'Project'], nullable: true })
    fundingSource: string; // Source of funding

    @Column("date", { nullable: true })
    dateOfInstallation?: Date; // Date of installation (if applicable)

    @ManyToOne(() => Vendor, { nullable : true})
    vendor: Vendor; // Vendor name

    @Column("date", { nullable: true })
    warrantyFrom?: Date; // Warranty start date (if applicable)

    @Column("date", { nullable: true })
    warrantyTo?: Date; // Warranty end date (if applicable)

    @Column("date", { nullable: true })
    amcFrom?: Date; // AMC start date (if applicable)

    @Column("date", { nullable: true })
    amcTo?: Date; // AMC end date (if applicable)

    @Column("text")
    currentLocation: string; // Current location of the item

    @Column("text", { nullable: true })
    softcopyOfPO?: string; // Soft copy of the purchase order (if applicable)

    @Column("text", { nullable: true })
    softcopyOfInvoice?: string; // Soft copy of the invoice (if applicable)

    @Column("text", { nullable: true })
    softcopyOfNFA?: string; // Soft copy of the NFA (if applicable)

    @Column("text", { nullable: true })
    softcopyOfAMC?: string; // Soft copy of the AMC (if applicable)

    @Column({ type: "enum", enum: ["Working", "Not Working", "Under Repair"], nullable: true })
    status?: "Working" | "Not Working" | "Under Repair" | null; // Status of the item

    @Column("text", { nullable: true })
    equipmentPhoto?: string; // Photo of the equipment (if applicable)

    @Column("text", { nullable: true })
    remarks?: string; // Additional remarks (if applicable)

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
}