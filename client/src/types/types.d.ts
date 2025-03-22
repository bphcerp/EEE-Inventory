export interface User {
    id: string;
    name: string;
    email?: string;
    permissions: 0 | 1;
    role: "Admin" | "Technician" | "Faculty";
}

export interface ValidSheet {
    sheetName: string
    index: number
    rowOffset: number
    columnOffset: number
    dataOffset: number
}

export interface Laboratory {
    id: string;
    name: string;
    code: string;
    location?: string
    technicianInCharge?: User;
    facultyInCharge?: User;
}

export interface Vendor {
    id: string;
    name: string;
    address?: string;
    pocName: string;
    phoneNumber: string;
    email: string;
}

export interface Category {
    id: string;
    name: string;
    code: string;
    type: 'Vendor' | 'Inventory'
}

export interface InventoryItem {
    id: string;
    serialNumber: int
    lab: Laboratory;
    itemCategory: string;
    itemName: string;
    specifications: string;
    quantity: number;
    noOfLicenses?: number;
    natureOfLicense?: string;
    yearOfLease?: number;
    poAmount: number;
    poNumber?: string; 
    poDate?: Date | string;
    labInchargeAtPurchase?: string
    labTechnicianAtPurchase?: string;
    equipmentID: string;
    fundingSource: string;
    dateOfInstallation?: Date | string;
    vendor: Vendor;
    warrantyFrom?: Date | string;
    warrantyTo?: Date | string;
    amcFrom?: Date | string;
    amcTo?: Date | string;
    currentLocation: string;
    softcopyOfPO?: string;
    softcopyOfInvoice?: string;
    softcopyOfNFA?: string;
    softcopyOfAMC?: string;
    status?: "Working" | "Not Working" | "Under Repair" | null
    equipmentPhoto?: string;
    remarks?: string;
}