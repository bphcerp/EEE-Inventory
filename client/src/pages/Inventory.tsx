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
import DeleteConfirmationDialog from "@/components/custom/DeleteConfirmationDialog";
import { AxiosError } from "axios";

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

        // Three pinned columns: EquipmentID, Item Name, Category, PO Number
        { accessorFn: () => 'S.No', header: 'S.No', cell: ({ row }) => row.index + 1 },
        { accessorKey: 'equipmentID', header: 'Equipment ID', meta: { filterType: 'search' as TableFilterType } },
        { accessorKey: 'itemName', header: 'Item Name' },
        { accessorKey: 'itemCategory.name', header: 'Category', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'poNumber', header: 'PO Number', meta: { filterType: 'search' as TableFilterType } },

        // Unpinned columns
        { accessorKey: 'createdAt', header: 'Created At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
        { accessorKey: 'updatedAt', header: 'Updated At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
        { accessorKey: 'lab.name', header: 'Laboratory', meta: { filterType: 'multiselect' as TableFilterType } },
        { accessorKey: 'labInchargeAtPurchase', header: 'Lab Incharge at Purchase' },
        { accessorKey: 'labTechnicianAtPurchase', header: 'Lab Technician at Purchase' },
        { accessorFn: (row) => Number(row.poAmount), header: 'PO Amount', cell: ({ getValue }) => (getValue() as number).toLocaleString('en-IN', { style: "currency", currency: "INR" }), meta: { filterType: 'number-range' as TableFilterType } },
        { accessorKey: 'poDate', header: 'PO Date', meta: { filterType: 'date-range' as TableFilterType } },
        { accessorKey: 'currentLocation', header: 'Current Location', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'status', header: 'Status', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'specifications', header: 'Specifications' },
        { accessorKey: 'noOfLicenses', header: 'No of Licenses' },
        { accessorKey: 'natureOfLicense', header: 'Nature of License' },
        { accessorKey: 'yearOfLease', header: 'Year of Lease', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'fundingSource', header: 'Funding Source', meta: { filterType: 'dropdown' as TableFilterType } },
        { accessorKey: 'dateOfInstallation', header: 'Date of Installation', meta: { filterType: 'date-range' as TableFilterType } },
        {
            accessorKey: 'vendor.name',
            header: 'Vendor Name',
            cell: ({ row, getValue }) => (
                <Button variant="link" onClick={() => handleVendorClick(row.original.vendor)}>
                    {getValue() as string}
                </Button>
            )
        },
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

    const fetchData = () => {
        api('/inventory')
            .then(({ data }) => setInventoryData(data))
            .catch(error => {
                toast.error('Error fetching inventory data:')
                console.error({ message: 'Error fetching inventory data:', error });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleDelete = () => {
        if (selectedItems.length !== 1) return;

        api.delete(`/inventory/${selectedItems[0].id}`)
            .then(() => {
                fetchData();
                toast.success("Item deleted successfully");
            })
            .catch((err) => {
                console.error({ message: "Error deleting item", err });
                toast.error(((err as AxiosError).response?.data as any).message ?? "Error deleting item");
            });
    };

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <div className="inventory p-2">
            {loading ? (
                <div className="flex flex-col w-full h-full space-y-2 my-2">
                    <Skeleton className="w-full h-8" />
                    <Skeleton className="w-full h-96" />
                </div>
            ) : (
                <DataTable<InventoryItem> data={inventoryData} exportFunction={(itemIds, columnsVisible) => {
                    columnsVisible = columnsVisible.map(column => column === 'PO Amount' ? 'poAmount' : column);

                    columnsVisible = columnsVisible.map(column => column === 'PO Amount' ? 'poAmount' : column);

                    api.post('/inventory/export', { itemIds, columnsVisible }, { responseType: 'blob' })
                        .then(response => {
                            const blob = new Blob([response.data], { type: response.headers['content-type'] });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download= "EEE Department - Export Inventory.xlsx"
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(link.href);
                            toast.success('File downloaded successfully!');
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            toast.error('Failed to download file');
                        });
                }} columns={columns} mainSearchColumn="itemName" initialState={{
                    columnPinning: {
                        left: ['S.No', 'equipmentID', 'itemName', 'itemCategory', 'poNumber']
                    }
                }} setSelected={setSelectedItems} additionalButtons={<>
                    {selectedItems.length ? (
                        <Button variant="outline" onClick={() => setTransferDialogOpen(true)}>
                            Transfer
                        </Button>
                    ) : <></>}
                    {selectedItems.length === 1 && (
                        <DeleteConfirmationDialog onConfirm={handleDelete} />
                    )}
                    {userPermissions ?
                        selectedItems.length === 1 ? <Button disabled={true} variant="outline" onClick={() => {
                            const item = selectedItems[0];
                            ["createdAt", "updatedAt", "poDate", "dateOfInstallation", "warrantyFrom", "warrantyTo", "amcFrom", "amcTo"].forEach((field) => {
                                if (item[field as keyof InventoryItem]) {
                                    (item[field as keyof InventoryItem] as Date) = new Date(item[field as keyof InventoryItem]);
                                }
                            });
                            ["itemCategory", "lab", "vendor"].forEach((field) => {
                                if (item[field as keyof InventoryItem]) {
                                    (item[field as keyof InventoryItem] as string) = item[field as 'lab' | 'itemCategory' | 'vendor'].id
                                }
                            });

                            navigate('/add-item', {
                                state: {
                                    toBeEditedItem: item
                                }
                            })
                        }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-background">Edit Item</Button>
                            : <Button disabled={true} onClick={() => navigate('/add-item')}>Add Item</Button> : <></>}
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
