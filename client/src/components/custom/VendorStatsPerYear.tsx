import { FunctionComponent, useEffect, useState } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import api from '@/axiosInterceptor';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Vendor } from '@/types/types';

interface VendorStatsPerYear {
    vendorId: string;
    year: number;
    totalQuantity: number;
    totalPrice: number;
}

interface VendorStatsPerYearProps {
    data: Array<VendorStatsPerYear>;
}

const VendorStatsPerYear: FunctionComponent<VendorStatsPerYearProps> = ({ data }) => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2008 + 1 }, (_, i) => currentYear - i);
    const [vendorIdMap, setVendorIdMap] = useState<{ [key: string]: Vendor }>({});
    const [tableData, setTableData] = useState<VendorStatsPerYear[]>([]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await api('/vendors');
                setVendors(response.data);
                (response.data as Vendor[]).map(vendor => {
                    setVendorIdMap((prev) => ({ ...prev, [vendor.id]: vendor }));
                });

                // Add remaining vendorIds to tableData
                const updatedTableData = data;
                response.data.forEach((vendor: Vendor) => {
                    if (!updatedTableData.some(item => item.vendorId === vendor.id)) {
                        updatedTableData.push({
                            vendorId: vendor.id,
                            year: 0, // Default year for missing data
                            totalQuantity: 0,
                            totalPrice: 0
                        });
                    }
                });
                setTableData(updatedTableData);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        };

        fetchVendors();
    }, [data]);

    const columns: ColumnDef<VendorStatsPerYear>[] = [
        { accessorFn: (row) => vendorIdMap[row.vendorId]?.name || 'Unknown Vendor', header: 'Vendor Name' },
        ...(years.map((year) => ({
            accessorKey: year.toString(),
            header: year.toString(),
            cell: ({ row }: { row: Row<VendorStatsPerYear> }) => {
                return row.original.year === year ? `${row.original.totalQuantity} (${Number(row.original.totalPrice).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                })})` : '-';
            },
            meta: {
                calculateSum: (rows: VendorStatsPerYear[]) => {
                    const totalQuantitySum = rows.filter(row => row.year === year).reduce((sum, row) => sum + Number(row.totalQuantity), 0);
                    const totalPriceSum = rows.filter(row => row.year === year).reduce((sum, row) => sum + Number(row.totalPrice), 0);
                    return `${totalQuantitySum} (${totalPriceSum.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    })})`;
                }
            }
        })) as ColumnDef<VendorStatsPerYear>[]),
    ];

    return (
        (vendors.length ? <DataTable data={tableData} columns={columns} mainSearchColumn={'Vendor Name' as unknown as keyof VendorStatsPerYear} initialState={{
            columnPinning: {
                left: ['vendorName']
            }
        }} /> : <></>)
    );
};

export default VendorStatsPerYear;
