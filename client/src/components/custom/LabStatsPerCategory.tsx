import { FunctionComponent, useEffect, useState } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import api from '@/axiosInterceptor';
import { ColumnDef } from '@tanstack/react-table';
import { Laboratory, Category } from '@/types/types';
import { StatData } from './LabStatsPerYear';

interface LabStatsPerCategory {
    lab: Laboratory;
    categories?: {
        [categoryId: string]: StatData | undefined;
    };
}

interface LabStatsPerCategoryProps {
    data: Array<{ labId: string; categoryId: string; totalQuantity: number; totalPrice: number }>;
}

const LabStatsPerCategory: FunctionComponent<LabStatsPerCategoryProps> = ({ data }) => {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tableData, setTableData] = useState<LabStatsPerCategory[]>([]);

    useEffect(() => {
        if (data.length) {
            const fetchLabsAndCategories = async () => {
                try {
                    const [labsResponse, categoriesResponse] = await Promise.all([
                        api('/labs'),
                        api('/categories?type=Inventory')
                    ]);
                    setLabs(labsResponse.data);
                    setCategories(categoriesResponse.data);

                    // Transform data: Group by `labId`
                    const labMap: { [key: string]: LabStatsPerCategory } = {};

                    labsResponse.data.forEach((lab: Laboratory) => {
                        labMap[lab.id] = {
                            lab, categories: (categoriesResponse.data as Category[]).reduce((acc, category) => {
                                acc[category.id] = undefined
                                return acc
                            }, {} as {
                                [categoryId: string]: StatData | undefined;
                            })
                        }
                    })

                    data.forEach(({ labId, categoryId, totalQuantity, totalPrice }) => {
                        labMap[labId].categories![categoryId] = { totalQuantity: Number(totalQuantity), totalPrice: Number(totalPrice) };
                    });

                    setTableData(Object.values(labMap));
                } catch (error) {
                    console.error('Error fetching labs or categories:', error);
                }
            };

            fetchLabsAndCategories();
        }
    }, [data]);

    const columns: ColumnDef<LabStatsPerCategory>[] = [
        {
            accessorKey: 'lab.name',
            header: 'Lab Name',
        },
        ...(categories.map(category => ({
            accessorKey: category.id,
            header: category.name,
            cell: ({ row }) => {
                const categoryData = row.original.categories![category.id];
                if (categoryData) {
                    return `${categoryData.totalQuantity} (${categoryData.totalPrice.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    })})`;
                }
                return '-';
            },
            meta: {
                calculateSum: (rows: LabStatsPerCategory[]) => {
                    const totalQuantitySum = rows.reduce((sum, row) => sum + (row.categories![category.id]?.totalQuantity || 0), 0);
                    const totalPriceSum = rows.reduce((sum, row) => sum + (row.categories![category.id]?.totalPrice || 0), 0);
                    return `${totalQuantitySum} (${totalPriceSum.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })})`;
                }
            }
        })) as ColumnDef<LabStatsPerCategory>[])
    ];

    return labs.length && categories.length ? (
        <DataTable
            data={tableData}
            columns={columns}
            mainSearchColumn={'lab_name' as keyof LabStatsPerCategory}
            initialState={{
                columnPinning: { left: ['lab_name'] }
            }}
        />
    ) : null;
};

export default LabStatsPerCategory;