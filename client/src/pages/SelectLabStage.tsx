import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ValidSheet } from '@/types/types';
import React, { useState } from 'react';


interface GridProps {
    sheets: ValidSheet[];
    onSubmit: (selectedSheets: ValidSheet[]) => void;
}

const SelectLabStage: React.FC<GridProps> = ({ sheets, onSubmit }) => {
    const [selectedSheets, setSelectedSheets] = useState<Set<number>>(new Set());

    const toggleSelection = (index: number) => {
        setSelectedSheets((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        const selected = sheets.filter((sheet) => selectedSheets.has(sheet.index));
        onSubmit(selected);
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            {sheets.map((sheet) => (
                <div key={sheet.index} className="flex items-center space-x-2">
                    <Checkbox
                        checked={selectedSheets.has(sheet.index)}
                        onCheckedChange={() => toggleSelection(sheet.index)}
                    />
                    <span>{sheet.sheetName}</span>
                </div>
            ))}
            <div className="col-span-3 mt-4">
                <Button onClick={handleSubmit}>Submit</Button>
            </div>
        </div>
    );
};

export default SelectLabStage;
