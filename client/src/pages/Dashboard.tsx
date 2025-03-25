import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types/types';
import api from '@/axiosInterceptor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LabStatsPerYear from '@/components/custom/LabStatsPerYear';
import LabStatsPerCategory from '@/components/custom/LabStatsPerCategory';
import VendorStatsPerYear from '@/components/custom/VendorStatsPerYear';
import VendorDetailsDialog from '@/components/custom/VendorDetailsDialog';
import VendorStatsCategories from '@/components/custom/VendorStatsCategories';
import hdate from 'human-date'

// Utility function to check if a date is before another date
const isBefore = (date: Date, comparisonDate: Date): boolean => {
    return date.getDate() < comparisonDate.getDate();
};

// Utility function to add days to a date
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};


// Utility function to check if a date is expiring soon or already expired
const checkDateStatus = (date: string | Date | null | undefined, daysThreshold: number) => {
    if (!date) return { isExpiringSoon: false, isExpired: false };
    const targetDate = new Date(date);
    const now = new Date();
    const isExpiringSoon = isBefore(targetDate, addDays(now, daysThreshold)) && targetDate > now;
    const isExpired = isBefore(targetDate, now) || targetDate.toDateString() === now.toDateString();
    return { isExpiringSoon, isExpired };
};

const Dashboard = () => {
    const [importantDates, setImportantDates] = useState<InventoryItem[]>([]);
    const [selectedStat, setSelectedStat] = useState<string>("lab/yearly-sum");
    const [statData, setStatData] = useState<any[]>([]);
    const [vendorDetails, setVendorDetails] = useState(null);
    const [isVendorDialogOpen, setVendorDialogOpen] = useState(false);

    const handleVendorClick = (vendor: any) => {
        setVendorDetails(vendor);
        setVendorDialogOpen(true);
    };

    useEffect(() => {
        // Fetch items with important dates
        const fetchImportantDates = async () => {
            try {
                const response = await api('/inventory/important-dates');
                const sortedData = response.data.sort((a: InventoryItem, b: InventoryItem) => {
                    const warrantyA = new Date(a.warrantyTo || 0).getTime();
                    const warrantyB = new Date(b.warrantyTo || 0).getTime();
                    const amcA = new Date(a.amcTo || 0).getTime();
                    const amcB = new Date(b.amcTo || 0).getTime();
                    return Math.max(warrantyB, amcB) - Math.max(warrantyA, amcA);
                });
                setImportantDates(sortedData);
            } catch (error) {
                console.error('Error fetching important dates:', error);
            }
        };

        fetchImportantDates();
    }, []);

    useEffect(() => {
        if (!selectedStat) return;
        // Fetch data for the selected statistic
        const fetchStatData = async () => {
            try {
                const response = await api(selectedStat === 'vendors' ? `/${selectedStat}` : `/stats/${selectedStat}`);
                setStatData(response.data);
            } catch (error) {
                console.error(`Error fetching data for ${selectedStat}:`, error);
            }
        };

        fetchStatData();
    }, [selectedStat]);

    return (
        <div className='inventory flex p-1'>
            <div className="w-3/4 p-4">
                <div className="mb-4">
                    <Select value={selectedStat} onValueChange={(value) => {
                        setStatData([])
                        setSelectedStat(value)
                    }}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select a statistic" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lab/yearly-sum">Lab Sum Per Year</SelectItem>
                            <SelectItem value="lab/category-sum">Lab Sum Per Category</SelectItem>
                            <SelectItem value="vendor/yearly-sum">Vendor Sum Per Year</SelectItem>
                            <SelectItem value="vendors">Vendor Categories</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {selectedStat === "lab/yearly-sum" ? <LabStatsPerYear data={statData} /> : <></>}
                {selectedStat === "lab/category-sum" ? <LabStatsPerCategory data={statData} /> : <></>}
                {selectedStat === "vendor/yearly-sum" ? <VendorStatsPerYear data={statData} /> : <></>}
                {selectedStat === "vendors" ? (
                    <VendorStatsCategories data={statData} onVendorClick={handleVendorClick} />
                ) : <></>}
            </div>
            <div className="w-1/4 h-[500px] rounded-md px-2 overflow-y-auto">
                <h3 className="sticky top-0 left-0 p-1 bg-background text-lg text-center font-semibold mb-4">Upcoming Important Dates</h3>
                {importantDates.length > 0 ? (
                    <ul className="space-y-2">
                        {importantDates.map((item) => {
                            const { isExpiringSoon: warrantyExpiring, isExpired: warrantyExpired } = checkDateStatus(item.warrantyTo, 7);
                            const { isExpiringSoon: amcExpiring, isExpired: amcExpired } = checkDateStatus(item.amcTo, 7);

                            return (
                                <li key={item.id}>
                                    <Card className='shadow-sm'>
                                        <CardHeader className="pb-1">
                                            <CardTitle className="text-sm font-medium">{item.itemName}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-foreground">
                                            <p className="text-xs text-muted-foreground"><strong>Equipment ID:</strong> {item.equipmentID}</p>
                                            <p className="text-xs text-muted-foreground"><strong>Lab:</strong> {item.lab?.name}</p>
                                            <p className={`${warrantyExpired ? 'text-red-500 line-through' : warrantyExpiring ? 'text-yellow-500 font-semibold' : 'text-xs text-muted-foreground'}`}>
                                                <strong>Warranty To:</strong> {item.warrantyTo ? `${new Date(item.warrantyTo).toLocaleDateString()} (${hdate.relativeTime(new Date(item.warrantyTo))})` : 'N/A'}
                                            </p>
                                            <p className={`${amcExpired ? 'text-red-500 line-through' : amcExpiring ? 'text-yellow-500 font-semibold' : 'text-xs text-muted-foreground'}`}>
                                                <strong>AMC To:</strong> {item.amcTo ? `${new Date(item.amcTo).toLocaleDateString()} (${hdate.relativeTime(new Date(item.amcTo))})` : 'N/A'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No upcoming important dates.</p>
                )}
            </div>
            <VendorDetailsDialog
                open={isVendorDialogOpen}
                onClose={() => setVendorDialogOpen(false)}
                vendorDetails={vendorDetails}
            />
        </div>
    );
};

export default Dashboard;
