import { FunctionComponent, useEffect, useState } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import api from '@/axiosInterceptor';
import { ColumnDef } from '@tanstack/react-table';
import { Vendor } from '@/types/types';

export interface StatData {
    totalQuantity: number;
    totalPrice: number;
}

interface VendorStatsPerYear {
    vendor: Vendor;
    [year: number]: StatData | undefined; // Year as a key with structured data
}

interface VendorStatsPerYearProps {
    data: Array<{ vendorId: string; year: number; totalQuantity: number; totalPrice: number }>;
}

const VendorStatsPerYear: FunctionComponent<VendorStatsPerYearProps> = ({ data }) => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2008 + 1 }, (_, i) => currentYear - i);
    const [tableData, setTableData] = useState<VendorStatsPerYear[]>([]);

    useEffect(() => {
        if (data.length) {
            const fetchVendors = async () => {
                try {
                    const response = await api('/vendors');
                    setVendors(response.data);

                    // Transform data: Group by `vendorId`
                    const vendorMap: { [key: string]: VendorStatsPerYear } = {};

                    response.data.forEach((vendor: Vendor) => vendorMap[vendor.id] = { vendor });

                    data.forEach(({ vendorId, year, totalQuantity, totalPrice }) => {
                        vendorMap[vendorId][year] = { totalQuantity: Number(totalQuantity), totalPrice: Number(totalPrice) };
                    });

                    setTableData(Object.values(vendorMap));
                } catch (error) {
                    console.error('Error fetching vendors:', error);
                }
            };

            fetchVendors();
        }
    }, [data]);

    const columns: ColumnDef<VendorStatsPerYear>[] = [
        {
            accessorKey: 'vendor.name',
            header: 'Vendor Name',
        },
        ...(years.map(year => ({
            accessorKey: year.toString(),
            header: year.toString(),
            cell: ({ row }) => {
                const yearData = row.original[year];
                if (yearData) {
                    return `${yearData.totalQuantity} (${yearData.totalPrice.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    })})`;
                }
                return '-';
            },
            meta: {
                calculateSum: (rows: VendorStatsPerYear[]) => {
                    const totalQuantitySum = rows.reduce((sum, row) => sum + (row[year]?.totalQuantity || 0), 0);
                    const totalPriceSum = rows.reduce((sum, row) => sum + (row[year]?.totalPrice || 0), 0);
                    return `${totalQuantitySum} (${totalPriceSum.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })})`;
                }
            }
        })) as ColumnDef<VendorStatsPerYear>[])
    ];

    return vendors.length ? (
        <DataTable
            data={tableData}
            columns={columns}
            mainSearchColumn={'vendor_name' as keyof VendorStatsPerYear}
            initialState={{
                columnPinning: { left: ['vendor_name'] }
            }}
        />
    ) : null;
};

export default VendorStatsPerYear;
