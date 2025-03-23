import { FunctionComponent, useEffect, useState } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import api from '@/axiosInterceptor';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Laboratory } from '@/types/types';

interface LabStatsPerYear{
    labId: string;
    year: number;
    totalQuantity: number;
    totalPrice: number;
}

interface LabStatsPerYearProps {
    data: Array<LabStatsPerYear>;
}

const LabStatsPerYear: FunctionComponent<LabStatsPerYearProps> = ({ data }) => {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2008 + 1 }, (_, i) => currentYear - i);
    const [labIdMap, setlabIdMap] = useState<{ [key:string] : Laboratory }>({})
    const [tableData, setTableData] = useState<LabStatsPerYear[]>([])

    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const response = await api('/labs');
                setLabs(response.data);
                (response.data as Laboratory[]).map(lab => {
                    setlabIdMap((prev) => ({ ...prev, [lab.id] : lab }))
                });

                // Add remaining labIds to tableData
                const updatedTableData = data;
                response.data.forEach((lab: Laboratory) => {
                    if (!updatedTableData.some(item => item.labId === lab.id)) {
                        updatedTableData.push({
                            labId: lab.id,
                            year: 0, // Default year for missing data
                            totalQuantity: 0,
                            totalPrice: 0
                        });
                    }
                });
                setTableData(updatedTableData);
            } catch (error) {
                console.error('Error fetching labs:', error);
            }
        };

        fetchLabs();
    }, [data]);

    const columns: ColumnDef<LabStatsPerYear>[] = [
        { accessorFn: (row) => labIdMap[row.labId]?.name || 'Unknown Lab', header: 'Lab Name' },
        ...(years.map((year) => ({
            accessorKey: year.toString(),
            header: year.toString(),
            cell: ({ row }: { row: Row<LabStatsPerYear> }) => {
                return row.original.year === year ? `${row.original.totalQuantity} (${Number(row.original.totalPrice).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                })})` : '-';
            },
            meta: {
                calculateSum: (rows: LabStatsPerYear[]) => {
                    const totalQuantitySum = rows.filter(row => row.year === year).reduce((sum, row) => sum + Number(row.totalQuantity), 0);
                    const totalPriceSum = rows.filter(row => row.year === year).reduce((sum, row) => sum + Number(row.totalPrice), 0);
                    return `${totalQuantitySum} (${totalPriceSum.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    })})`;
                }
            }
        })) as ColumnDef<LabStatsPerYear>[]),
    ];

    return (
        ( labs.length ? <DataTable data={tableData} columns={columns} mainSearchColumn={'Lab Name' as unknown as keyof LabStatsPerYear} initialState={{
            columnPinning: {
                left: ['labName']
            }
        }} /> : <></> )
    );
};

export default LabStatsPerYear;
