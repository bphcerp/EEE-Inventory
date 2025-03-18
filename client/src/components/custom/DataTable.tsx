"use client"

import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    InitialTableState,
    Row,
    RowData,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CSSProperties, ReactNode, useEffect, useState } from "react"

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];

    // If mainSearchColumn is set, the meta filter options if set are ignored as there is a global filter already present.
    mainSearchColumn?: keyof T;
    initialState?: InitialTableState
    additionalButtons?: ReactNode
}

export type TableFilterType = "dropdown" | "multiselect" | "search" | "number-range" | "date-range";

// Extend ColumnMeta interface to add custom properties
declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        getSum?: boolean;
        sumFormatter?: (sum: number) => string;
        truncateLength?: number
        filterType?: TableFilterType
    }
}

export function DataTable<T>({ data, columns, mainSearchColumn, initialState, additionalButtons }: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const [cellStyleMap, setCellStyleMap] = useState<{ [key: string]: CSSProperties }>({})

    const isWithinRange = (row: Row<T>, columnId: string, value: any) => {
        const date = new Date(row.getValue(columnId));
        const [startDateString, endDateString] = value;
        const [start, end] = [startDateString ? new Date(startDateString) : undefined, endDateString ? new Date(endDateString) : undefined]

        // value => two date input values
        //If one filter defined and date is null filter it
        if ((start || end) && !date) return false;
        if (start && !end) {
            return date.getTime() >= start.getTime()
        } else if (!start && end) {
            return date.getTime() <= end.getTime()
        } else if (start && end) {
            return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
        } else return true;
    }

    const multiFilterFn = (row: Row<T>, columnId: string, filterValue: any) => {
        console.log(filterValue)
        if (!filterValue || filterValue.length === 0) return true
        return filterValue.includes(row.getValue(columnId))
      }

    const table = useReactTable({
        data,
        columns: columns.map((columnDef) => ({
            ...columnDef,
            ...(columnDef.meta ? columnDef.meta.filterType === 'date-range' ?  { filterFn : isWithinRange} : columnDef.meta.filterType === 'multiselect' ? { filterFn : multiFilterFn} : {} : {})
        })),
        initialState,
        enableColumnPinning: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    useEffect(() => {
        table.getAllColumns().map((column) => {
            setCellStyleMap(prev => ({ ...prev, [column.id]: getCommonPinningStyles(column) }))
        })
    }, [table.getState().pagination.pageSize])

    const getCommonPinningStyles = (column: Column<T>): CSSProperties => {
        const isPinned = column.getIsPinned()
        const isLastLeftPinnedColumn =
            isPinned === 'left' && column.getIsLastColumn('left')

        const computedJSWidth = document.getElementById(column.id)?.offsetLeft ?? 0

        return {
            backgroundColor: "var(--background)",
            ...(isPinned && isLastLeftPinnedColumn && {
                boxShadow: '-2px 0 4px -4px var(--primary) inset'
            }),
            left: isPinned === 'left' ? `${computedJSWidth}px` : undefined,
            position: isPinned ? 'sticky' : 'relative',
            zIndex: isPinned ? 10 : 0,
        }
    }

    const renderFilter = (column: Column<T>) => {
        const filterType = column.columnDef.meta?.filterType;
        const uniqueValues = Array.from(column.getFacetedUniqueValues().keys());

        switch (filterType) {
            case "dropdown":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Filter</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {uniqueValues.map(value => (
                                <DropdownMenuCheckboxItem
                                    key={value as string}
                                    checked={column.getFilterValue() === value}
                                    onCheckedChange={(checked) => column.setFilterValue(checked ? value : null)}
                                >
                                    {value as string}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            case "multiselect":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Filter</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {uniqueValues.map(value => (
                                <DropdownMenuCheckboxItem
                                    key={value as string}
                                    onSelect={(e) => e.preventDefault()}
                                    checked={(column.getFilterValue() as string[] ?? []).includes(value as string)}
                                    onCheckedChange={(checked) => {
                                        const currentValue = column.getFilterValue() as string[] ?? []
                                        column.setFilterValue(
                                            !checked ? currentValue.filter(v => v !== value)
                                                : [...currentValue, value as string]
                                        );
                                    }}
                                >
                                    {value as string}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            case "search":
                return (
                    <Input
                        placeholder='Search'
                        className="w-32"
                        value={column.getFilterValue() as string}
                        onChange={(event) => column.setFilterValue(event.target.value)}
                    />
                );
            case "number-range":
                return (
                    <div className="flex space-x-2">
                        <Input
                            type="number"
                            min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                            max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                            value={(column.getFilterValue() as [number, number])?.[0] ?? ''}
                            onChange={(event) => {
                                const [, max] = column.getFilterValue() as [number, number];
                                column.setFilterValue([Number(event.target.value), max]);
                            }}
                            placeholder='Min'
                        />
                        <Input
                            type="number"
                            min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                            max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                            value={(column.getFilterValue() as [number, number])?.[1] ?? ''}
                            onChange={(event) => {
                                const [min,] = column.getFilterValue() as [number, number];
                                column.setFilterValue([min, Number(event.target.value)]);
                            }}
                            placeholder='Max'
                        />
                    </div>
                );
            case "date-range":
                return (
                    <div className="flex space-x-2">
                        <Input
                            type="date"
                            value={(column.getFilterValue() as [string, string])?.[0] ?? ''}
                            onChange={(event) => {
                                const prevFilterValue = column.getFilterValue() as [string, string]
                                if (!event.target.value) {
                                    column.setFilterValue([undefined, prevFilterValue[1]])
                                    return
                                }
                                if (prevFilterValue) {
                                    const [, max] = prevFilterValue
                                    column.setFilterValue([event.target.value, max]);
                                }
                                else {
                                    column.setFilterValue([event.target.value, undefined])
                                }
                            }}
                        />
                        <Input
                            type="date"
                            value={(column.getFilterValue() as [string, string])?.[1] ?? ''}
                            onChange={(event) => {
                                const prevFilterValue = column.getFilterValue() as [string, string]
                                if (!event.target.value) {
                                    column.setFilterValue([prevFilterValue[0], undefined])
                                    return
                                }
                                if (prevFilterValue) {
                                    const [min,] = prevFilterValue
                                    column.setFilterValue([min, event.target.value]);
                                }
                                else {
                                    column.setFilterValue([undefined, event.target.value]);
                                }
                            }}
                        />
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div>
            <div className="flex items-center justify-between py-4">
                {mainSearchColumn && <Input
                    placeholder={`Filter ${table.getColumn(mainSearchColumn as string)?.columnDef.header?.toString()}...`}
                    value={(table.getColumn(mainSearchColumn as string)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(mainSearchColumn as string)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />}
                <div className="flex items-center space-x-2">
                    {additionalButtons}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <div className={`${table.getAllColumns().length >= 6 && 'grid grid-cols-3'} max-h-56 overflow-y-auto`}>
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    //To stop the dropdown from closing on click (onSelect)
                                                    onSelect={(e) => e.preventDefault()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.columnDef.header?.toString()}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {data.length ? <div className="rounded-md border p-2">
                <Table className='table-auto'>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                <TableHead className="z-2 bg-(--background) sticky left-0 h-full w-[20px]">
                                    <Checkbox
                                        checked={
                                            table.getIsAllPageRowsSelected() ||
                                            (table.getIsSomePageRowsSelected() && "indeterminate")
                                        }
                                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead id={header.column.id} colSpan={header.colSpan} style={{ ...cellStyleMap[header.column.id] }} key={header.id}>
                                            <div className={`flex flex-col w-max text-center items-start gap-y-2 py-2`}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {(!mainSearchColumn || header.column.columnDef.header?.toString().toLowerCase() !== mainSearchColumn.toString().toLowerCase()) && renderFilter(header.column)}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    {table.getVisibleLeafColumns().length ? <TableBody>
                        {
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    <TableCell className="z-2 bg-(--background) sticky left-0 w-[20px]">
                                        <Checkbox
                                            checked={row.getIsSelected()}
                                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                                            aria-label="Select row"
                                        />
                                    </TableCell>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell 
                                            className={` ${(cell.column.columnDef.meta && ['date-range', 'number-range'].includes(cell.column.columnDef.meta.filterType ?? '')) ? 'text-center' : ''}`} 
                                            style={{ ...cellStyleMap[cell.column.id] }} 
                                            key={cell.id}
                                            title={cell.getValue() && (cell.getValue() as any).toString().length > 20 ? (cell.getValue() as any).toString() : undefined}
                                        >
                                            {
                                                (cell.getValue() && typeof cell.getValue() === 'string' )
                                                    ? (cell.getValue() as string).length > 30 
                                                        ? `${(cell.getValue() as string).slice(0, 20)}...` 
                                                        : flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        ) 
                                                    : "Not set"
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        }
                    </TableBody> : <div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-lg text-gray-500">No columns to show</p>
                        </div>
                    </div>}
                </Table>
            </div> : <div>
                <div className="flex flex-col items-center justify-center border-1 border-primary rounded-md h-40">
                    <p className="text-lg text-gray-500">No data</p>
                </div>
            </div>}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Rows per page <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[5, 10, 20, 50, 100, table.getPrePaginationRowModel().rows.length].map(pageSize => (
                                <DropdownMenuCheckboxItem
                                    key={pageSize}
                                    checked={table.getState().pagination.pageSize === pageSize}
                                    onCheckedChange={() => table.setPageSize(pageSize)}
                                >
                                    {pageSize === table.getPrePaginationRowModel().rows.length ? 'All' : pageSize}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}