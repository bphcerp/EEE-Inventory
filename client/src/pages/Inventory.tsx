import { useUserPermissions } from "@/contexts/UserPermissionsProvider";
import { useEffect, useState } from "react";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import api from "@/axiosInterceptor";
import { Link, useNavigate } from "react-router";
import { InventoryItem } from "@/types/types";
import { TransferConfirmationDialog } from "@/components/custom/TransferConfirmationDialog";
import VendorDetailsDialog from "@/components/custom/VendorDetailsDialog";

export const Inventory = () => {
    const userPermissions = useUserPermissions();
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [vendorDetails, setVendorDetails] = useState<InventoryItem["vendor"] | null>(null);
    const [isVendorDialogOpen, setVendorDialogOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
    const [isTransferDialogOpen, setTransferDialogOpen] = useState(false);

    const navigate = useNavigate()

    const handleVendorClick = (vendor: InventoryItem["vendor"]) => {
        setVendorDetails(vendor);
        setVendorDialogOpen(true);
    };

    const handleTransferSuccess = () => {
        setSelectedItems([]);
        setTransferDialogOpen(false);
        toast.success("Transfer completed successfully!");
    };

    const columns: ColumnDef<InventoryItem>[] = [

        // Three pinned columns: Item Name, Category, PO Number
        { accessorKey: 'equipmentID', header: 'Equipment ID', meta: { filterType: 'search' as TableFilterType } },
        { accessorKey: 'itemName', header: 'Item Name' },
        { accessorKey: 'itemCategory.name', header: 'Category', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'poNumber', header: 'PO Number', meta: { filterType: 'search' as TableFilterType } },

        { accessorFn: (row) => row.lab.name ?? "NA", header: 'Laboratory', meta: { filterType: 'multiselect' as TableFilterType } },
        { accessorKey: 'labInchargeAtPurchase', header: 'Lab Incharge at Purchase' },
        { accessorKey: 'labTechnicianAtPurchase', header: 'Lab Technician at Purchase' },

        // Unpinned columns
        { accessorFn: (row) => Number(row.poAmount) , header: 'PO Amount', cell: ({ getValue }) => (getValue() as number).toLocaleString('en-IN', { style: "currency", currency: "INR" }), meta: { filterType: 'number-range' as TableFilterType } },
        { accessorKey: 'poDate', header: 'PO Date', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'currentLocation', header: 'Current Location', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorFn: (row) => row.status ?? "Not Provided" , header: 'Status', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'specifications', header: 'Specifications' },
        { accessorKey: 'noOfLicenses', header: 'No of Licenses' },
        { accessorKey: 'natureOfLicense', header: 'Nature of License' },
        { accessorKey: 'yearOfLease', header: 'Year of Lease', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'fundingSource', header: 'Funding Source',meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'dateOfInstallation', header: 'Date of Installation', meta: { filterType: 'date-range' as TableFilterType } },
        { 
            accessorKey: 'vendor.name', 
            header: 'Vendor Name', 
            cell: ({ row,getValue }) => (
                <Button variant="link" onClick={() => handleVendorClick(row.original.vendor)}>
                    {getValue() as string}
                </Button>
            ) 
        },
        // { accessorKey: 'vendor.address', header: 'Vendor Address' },
        // { accessorKey: 'vendor.pocName', header: 'Vendor POC Name' },
        // { accessorKey: 'vendor.phoneNumber', header: 'Vendor POC Phone Number' },
        // { accessorKey: 'vendor.email', header: 'Vendor POC Email ID' },
        { accessorKey: 'warrantyFrom', header: 'Warranty From', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'warrantyTo', header: 'Warranty To', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'amcFrom', header: 'AMC From', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'amcTo', header: 'AMC To', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'softcopyOfPO', enableColumnFilter: false, header: 'Softcopy of PO', cell: ({ getValue }) => (getValue() as string | null) ? <Link target="_blank" rel="noopener noreferrer" to={getValue()!}><Button variant="link">View</Button></Link> : "Not Uploaded" },
        { accessorKey: 'softcopyOfInvoice', enableColumnFilter: false, header: 'Softcopy of Invoice', cell: ({ getValue }) => (getValue() as string | null) ? <Link target="_blank" rel="noopener noreferrer" to={getValue()!}><Button variant="link">View</Button></Link> : "Not Uploaded" },
        { accessorKey: 'softcopyOfNFA', enableColumnFilter: false, header: 'Softcopy of NFA', cell: ({ getValue }) => (getValue() as string | null) ? <Link target="_blank" rel="noopener noreferrer" to={getValue()!}><Button variant="link">View</Button></Link> : "Not Uploaded" },
        { accessorKey: 'softcopyOfAMC', enableColumnFilter: false, header: 'Softcopy of AMC', cell: ({ getValue }) => (getValue() as string | null) ? <Link target="_blank" rel="noopener noreferrer" to={getValue()!}><Button variant="link">View</Button></Link> : "Not Uploaded" },
        { accessorKey: 'equipmentPhoto', enableColumnFilter: false, header: 'Equipment Photo', cell: ({ getValue }) => (getValue() as string | null) ? <Link target="_blank" rel="noopener noreferrer" to={getValue()!}><Button variant="link">View</Button></Link> : "Not Uploaded" },
        { accessorKey: 'remarks', header: 'Remarks' },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setLoading(true), 2000);
        api('/inventory')
            .then(({ data }) => setInventoryData(data))
            .catch(error => {
                toast.error('Error fetching inventory data:')
                console.error({ message: 'Error fetching inventory data:', error });
            })
            .finally(() => {
                setLoading(false);
                clearTimeout(timer);
            });
    }, []);

    return (
        <div className="inventory p-2">
            {loading ? (
                <div className="flex flex-col w-full h-full space-y-2 my-2">
                    <Skeleton className="w-full h-8" />
                    <Skeleton className="w-full h-96" />
                </div>
            ) : (
                <DataTable<InventoryItem> data={inventoryData} columns={columns} mainSearchColumn="itemName" initialState={{
                    columnPinning: {
                        left: ['equipmentID', 'itemName', 'itemCategory', 'poNumber']
                    }
                }} setSelected={setSelectedItems} additionalButtons={<>
                    {selectedItems.length ? (
                        <Button variant="outline" onClick={() => setTransferDialogOpen(true)}>
                            Transfer
                        </Button>
                    ) : <></>}
                    {userPermissions ? <Button onClick={() => navigate('/add-item')}>Add Item</Button> : <></>}
                </>} />
            )}
            <TransferConfirmationDialog 
                open={isTransferDialogOpen} 
                onClose={() => setTransferDialogOpen(false)} 
                selectedItems={selectedItems} 
                onTransferSuccess={handleTransferSuccess} 
            />
            <VendorDetailsDialog 
                open={isVendorDialogOpen} 
                onClose={() => setVendorDialogOpen(false)} 
                vendorDetails={vendorDetails} 
            />
        </div>
    );
};