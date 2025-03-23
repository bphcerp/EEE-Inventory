import { FunctionComponent, useEffect, useState } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import api from '@/axiosInterceptor';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Laboratory, Category } from '@/types/types';

interface LabStatsPerCategory {
    labId: string;
    categoryId: string;
    totalQuantity: number;
    totalPrice: number;
}

interface LabStatsPerCategoryProps {
    data: Array<LabStatsPerCategory>;
}

const LabStatsPerCategory: FunctionComponent<LabStatsPerCategoryProps> = ({ data }) => {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [labIdMap, setLabIdMap] = useState<{ [key: string]: Laboratory }>({});
    const [tableData, setTableData] = useState<LabStatsPerCategory[]>([]);

    useEffect(() => {
        const fetchLabsAndCategories = async () => {
            try {
                const [labsResponse, categoriesResponse] = await Promise.all([
                    api('/labs'),
                    api('/categories?type=Inventory')
                ]);
                setLabs(labsResponse.data);
                setCategories(categoriesResponse.data);

                labsResponse.data.forEach((lab: Laboratory) => {
                    setLabIdMap((prev) => ({ ...prev, [lab.id]: lab }));
                });

                const updatedTableData = data;
                labsResponse.data.forEach((lab: Laboratory) => {
                    if (!updatedTableData.some(item => item.labId === lab.id)) {
                        updatedTableData.push({
                            labId: lab.id,
                            categoryId: 'Unknown',
                            totalQuantity: 0,
                            totalPrice: 0
                        });
                    }
                });
                setTableData(updatedTableData);
            } catch (error) {
                console.error('Error fetching labs or categories:', error);
            }
        };

        fetchLabsAndCategories();
    }, [data]);

    const columns: ColumnDef<LabStatsPerCategory>[] = [
        { accessorFn: (row) => labIdMap[row.labId]?.name || 'Unknown', header: 'Lab Name' },
        ...(categories.map((category) => ({
            accessorKey: category.id,
            header: category.name,
            cell: ({ row }: { row: Row<LabStatsPerCategory> }) => {
                return row.original.categoryId === category.id
                    ? `${row.original.totalQuantity} (${Number(row.original.totalPrice).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    })})`
                    : '-';
            },
            meta: {
                calculateSum: (rows: LabStatsPerCategory[]) => {
                    const totalQuantitySum = rows
                        .filter(row => row.categoryId === category.id)
                        .reduce((sum, row) => sum + Number(row.totalQuantity), 0);
                    const totalPriceSum = rows
                        .filter(row => row.categoryId === category.id)
                        .reduce((sum, row) => sum + Number(row.totalPrice), 0);
                    return `${totalQuantitySum} (${totalPriceSum.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    })})`;
                }
            }
        })) as ColumnDef<LabStatsPerCategory>[]),
    ];

    return (
        (labs.length && categories.length ? <DataTable data={tableData} columns={columns} mainSearchColumn={'Lab Name' as unknown as keyof LabStatsPerCategory} initialState={{
            columnPinning: {
                left: ['labName']
            }
        }} /> : <></>)
    );
};

export default LabStatsPerCategory;
