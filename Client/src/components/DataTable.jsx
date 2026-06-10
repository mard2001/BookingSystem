import React, { useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { ArrowDownZaIcon, ArrowUpZaIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileDown } from "lucide-react";
import { exportToCSV, exportToExcel } from "../utils/ExportTable";
import { TablePagination } from "./DataTablePagination";
 
export const DataTable = ({ data = [], columns = [], loading = false, error = null, placeholder = "Search...", pageSize = 5, exportFilename = "export", exportable = false }) => {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize } },
    });

    if (loading) return (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Loading...
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-16 text-red-400 text-sm">
        {error}
        </div>
    );
    const getExportData = () =>
        table.getFilteredRowModel().rows.map(row => row.original);

    return (
        <div className="space-y-4 bg-background py-5 rounded-2xl shadow-lg">

            {/* Search */}
            <div className="flex items-center justify-between mx-5">
                {/* Export buttons */}
                {exportable && (
                <div className="flex gap-2">
                    <button
                    onClick={() => exportToCSV(getExportData(), exportFilename)}
                    className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 hover:cursor-pointer"
                    >
                    <FileDown className="w-3.5 h-3.5" />
                    CSV
                    </button>
                    <button
                    onClick={() => exportToExcel(getExportData(), exportFilename)}
                    className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-green-600 hover:cursor-pointer"
                    >
                    <FileDown className="w-3.5 h-3.5" />
                    Excel
                    </button>
                </div>
                )}
                <input
                    value={globalFilter}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder={placeholder}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl w-64 focus:outline-none ring-1 focus:ring-2 ring-primary/30"
                />
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-scroll">
            <table className="w-full text-sm">
                <thead className="bg-foreground border-b border-gray-200">
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
                        >
                            <span className="flex items-center justify-center gap-1">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {
                                    header.column.getCanSort() &&
                                    ({ asc: <ArrowUpZaIcon className="w-3.5 h-3.5" />, desc: <ArrowDownZaIcon className="w-3.5 h-3.5" /> }[header.column.getIsSorted()] ?? " ↕")
                                }

                            </span>
                        </th>
                    ))}
                    </tr>
                ))}
                </thead>
                <tbody className="divide-y divide-gray-100 bg-foreground">
                {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-gray-700 text-xs">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                        ))}
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                        No records found.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            <TablePagination table={table} />
        </div>
    );
};