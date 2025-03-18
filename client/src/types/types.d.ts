export interface User {
    id: string;
    name: string;
    email: string;
    permissions: 0 | 1;
    role: "Admin" | "Technician" | "Faculty";
    laboratories?: Laboratory[];
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
    technicians: User[];
}

export interface InventoryItem {
    id: string;
    lab: Laboratory;
    itemCategory: string;
    itemName: string;
    specifications: string;
    quantity: string;
    noOfLicenses?: number;
    natureOfLicense?: string;
    yearOfLease?: number;
    itemAmountInPO: number;
    poNumber: string;
    poDate: Date;
    labInchargeAtPurchase?: User;
    labTechnicianAtPurchase?: User;
    equipmentID: string;
    fundingSource: string;
    dateOfInstallation?: Date;
    vendorName: string;
    vendorAddress: string;
    vendorPOCName: string;
    vendorPOCPhoneNumber: string;
    vendorPOCEmailID: string;
    warrantyFrom?: Date;
    warrantyTo?: Date;
    amcFrom?: Date;
    amcTo?: Date;
    currentLocation: string;
    softcopyOfPO?: string;
    softcopyOfInvoice?: string;
    softcopyOfNFA?: string;
    softcopyOfAMC?: string;
    status?: "Working" | "Not Working" | null;
    equipmentPhoto?: string;
    remarks?: string;
}