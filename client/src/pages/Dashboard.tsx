import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types/types';
import api from '@/axiosInterceptor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

// Utility function to format the days diff to now
const formatDaysToNow = (date: Date): string => {
    const now = new Date();
    const diffInDays = date.getDate() - now.getDate()

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays > 1) return `in ${diffInDays} days`;
    if (diffInDays === -1) return 'Yesterday';
    return `${Math.abs(diffInDays)} days ago`;
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

    useEffect(() => {
        // Fetch items with important dates
        const fetchImportantDates = async () => {
            try {
                const response = await api('/inventory/important-dates');
                setImportantDates(response.data);
            } catch (error) {
                console.error('Error fetching important dates:', error);
            }
        };

        fetchImportantDates();
    }, []);

    return (
        <div className='flex'>
            <div className="w-3/4 p-4">
                {/* ...existing dashboard content... */}
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
                                                <strong>Warranty To:</strong> {item.warrantyTo ? `${new Date(item.warrantyTo).toLocaleDateString()} (${formatDaysToNow(new Date(item.warrantyTo))})` : 'N/A'}
                                            </p>
                                            <p className={`${amcExpired ? 'text-red-500 line-through' : amcExpiring ? 'text-yellow-500 font-semibold' : 'text-xs text-muted-foreground'}`}>
                                                <strong>AMC To:</strong> {item.amcTo ? `${new Date(item.amcTo).toLocaleDateString()} (${formatDaysToNow(new Date(item.amcTo))})` : 'N/A'}
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
        </div>
    );
};

export default Dashboard;
