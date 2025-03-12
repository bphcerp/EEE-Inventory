"use client"

import * as React from "react"
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    RowData,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    mainSearchColumn?: keyof T;
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

export function DataTable<T>({ data, columns, mainSearchColumn }: DataTableProps<T>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const renderFilter = (column: Column<T>) => {
        const filterType = column.columnDef.meta?.filterType;
        const uniqueValues = Array.from(new Set(data.map(row => row[column.id as keyof T])));

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
                                    onCheckedChange={() => column.setFilterValue(value)}
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
                                    checked={(column.getFilterValue() as string[]).includes(value as string)}
                                    onCheckedChange={() => {
                                        const currentValue = column.getFilterValue() as string[];
                                        column.setFilterValue(
                                            currentValue.includes(value as string)
                                                ? currentValue.filter(v => v !== value)
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
                        placeholder={`Search ${column.id as string}...`}
                        value={column.getFilterValue() as string}
                        onChange={(event) => column.setFilterValue(event.target.value)}
                    />
                );
            case "number-range":
            case "date-range":
                return (
                    <div className="flex space-x-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={(column.getFilterValue() as [number, number])[0]}
                            onChange={(event) => {
                                const [min, max] = column.getFilterValue() as [number, number];
                                column.setFilterValue([Number(event.target.value), max]);
                            }}
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            value={(column.getFilterValue() as [number, number])[1]}
                            onChange={(event) => {
                                const [min, max] = column.getFilterValue() as [number, number];
                                column.setFilterValue([min, Number(event.target.value)]);
                            }}
                        />
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                {mainSearchColumn && <Input
                    placeholder={`Filter ${mainSearchColumn as string}...`}
                    value={(table.getColumn(mainSearchColumn as string)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(mainSearchColumn as string)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {table.getVisibleLeafColumns().length && table.getRowModel().rows?.length ? <>
                <div className="rounded-md border p-2">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow className="flex items-center" key={headerGroup.id}>
                                    <Checkbox
                                        checked={
                                            table.getIsAllPageRowsSelected() ||
                                            (table.getIsSomePageRowsSelected() && "indeterminate")
                                        }
                                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                        aria-label="Select all"
                                    />
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead className="flex items-center" key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                <div className="my-2 max-w-fit">
                                                    {(!mainSearchColumn || header.column.columnDef.header?.toString().toLowerCase() !== mainSearchColumn.toString().toLowerCase()) && renderFilter(header.column)}
                                                </div>
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="flex items-center"
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        <Checkbox
                                            checked={row.getIsSelected()}
                                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                                            aria-label="Select row"
                                        />
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
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
            </> :  <div>
                <div className="flex flex-col items-center justify-center h-64">
                <p className="text-lg text-gray-500">No data to show</p>
                </div>
            </div>}
        </div>
    )
}