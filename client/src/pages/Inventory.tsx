import { useUserPermissions } from "@/contexts/UserPermissionsProvider";
import { useEffect, useState } from "react";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import axios from "axios";
import api from "@/axiosInterceptor";
import { useNavigate } from "react-router";
import { InventoryItem, User } from "@/types/types";

export const Inventory = () => {
    const userPermissions = useUserPermissions();
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAllLabs, setShowAllLabs] = useState(Boolean(userPermissions));

    const navigate = useNavigate()

    const fetchFile = async (field: string, id: string) => {
        try {
            const response = await axios.get(`/api/inventory/${id}?field=${field}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(response.data);
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            if (newWindow) {
                newWindow.document.title = `${field}.pdf`;
            }
        } catch (error) {
            toast.error('Error fetching file');
            console.error(error);
        }
    };

    const columns: ColumnDef<InventoryItem>[] = [

        // Three pinned columns: Item Name, Category, PO Number
        { accessorKey: 'equipmentID', header: 'Equipment ID' },
        { accessorKey: 'itemName', header: 'Item Name' },
        { accessorKey: 'itemCategory', header: 'Category', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'poNumber', header: 'PO Number', meta: { filterType: 'search' as TableFilterType } },

        { accessorFn: (row) => row.lab.name ?? "NA", header: 'Laboratory', meta: { filterType: 'multiselect' as TableFilterType } },
        { accessorKey: 'labInchargeAtPurchase', header: 'Lab Incharge at Purchase', cell: ({ getValue }) => (getValue() as User)?.name ?? 'NA' },
        { accessorKey: 'labTechnicianAtPurchase', header: 'Lab Technician at Purchase', cell: ({ getValue }) => (getValue() as User)?.name ?? 'NA' },

        // Unpinned columns
        { accessorKey: 'quantity', header: 'Quantity', meta: { filterType: 'number-range' as TableFilterType } },
        { accessorKey: 'itemAmountInPO', header: 'Amount in PO', cell: ({ getValue }) => (Number(getValue())).toLocaleString('en-IN', { style: "currency", currency: "INR" }), meta: { filterType: 'number-range' as TableFilterType } },
        { accessorKey: 'poDate', header: 'PO Date', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'vendorName', header: 'Vendor Name', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'currentLocation', header: 'Current Location', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'status', header: 'Status', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'specifications', header: 'Specifications' },
        { accessorKey: 'noOfLicenses', header: 'No of Licenses' },
        { accessorKey: 'natureOfLicense', header: 'Nature of License' },
        { accessorKey: 'yearOfLease', header: 'Year of Lease' },
        { accessorKey: 'fundingSource', header: 'Funding Source' },
        { accessorKey: 'dateOfInstallation', header: 'Date of Installation', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'vendorAddress', header: 'Vendor Address' },
        { accessorKey: 'vendorPOCName', header: 'Vendor POC Name' },
        { accessorKey: 'vendorPOCPhoneNumber', header: 'Vendor POC Phone Number' },
        { accessorKey: 'vendorPOCEmailID', header: 'Vendor POC Email ID' },
        { accessorKey: 'warrantyFrom', header: 'Warranty From', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'warrantyTo', header: 'Warranty To', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'amcFrom', header: 'AMC From', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'amcTo', header: 'AMC To', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'softcopyOfPO', header: 'Softcopy of PO', cell: ({ row, getValue }) => (getValue() as string | null) ? <Button variant="link" onClick={() => fetchFile('softcopyOfPO', row.original.id)}>View</Button> : "Not Uploaded" },
        { accessorKey: 'softcopyOfInvoice', header: 'Softcopy of Invoice', cell: ({ row, getValue }) => (getValue() as string | null) ? <Button variant="link" onClick={() => fetchFile('softcopyOfInvoice', row.original.id)}>View</Button> : "Not Uploaded" },
        { accessorKey: 'softcopyOfNFA', header: 'Softcopy of NFA', cell: ({ row, getValue }) => (getValue() as string | null) ? <Button variant="link" onClick={() => fetchFile('softcopyOfNFA', row.original.id)}>View</Button> : "Not Uploaded" },
        { accessorKey: 'softcopyOfAMC', header: 'Softcopy of AMC', cell: ({ row, getValue }) => (getValue() as string | null) ? <Button variant="link" onClick={() => fetchFile('softcopyOfAMC', row.original.id)}>View</Button> : "Not Uploaded" },
        { accessorKey: 'equipmentPhoto', header: 'Equipment Photo', cell: ({ row, getValue }) => (getValue() as string | null) ? <Button variant="link" onClick={() => fetchFile('equipmentPhoto', row.original.id)}>View</Button> : "Not Uploaded" },
        { accessorKey: 'remarks', header: 'Remarks' },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setLoading(true), 2000);
        api(showAllLabs ? '/api/inventory?allLabs=true' : '/api/inventory')
            .then(({ data }) => setInventoryData(data))
            .catch(error => {
                toast.error('Error fetching inventory data:')
                console.error({ message: 'Error fetching inventory data:', error });
            })
            .finally(() => {
                setLoading(false);
                clearTimeout(timer);
            });
    }, [showAllLabs, userPermissions]);

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
                }} additionalButtons={userPermissions ? <Button onClick={() => navigate('/add-item')}>Add Item</Button> : <Button variant="link" onClick={() => setShowAllLabs(!showAllLabs)}>Show {showAllLabs ? 'My Labs' : 'All Labs'}</Button>} />
            )}
        </div>
    );
}