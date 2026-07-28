import React, { useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { ArrowDownZaIcon, ArrowUpZaIcon, GripVertical } from "lucide-react";
import { FileDown } from "lucide-react";
import { exportToCSV, exportToExcel } from "../utils/ExportTable";
import { TablePagination } from "./DataTablePagination";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DragHandleCell = ({ id }) => {
  const { attributes, listeners } = useSortable({ id });
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1"
      aria-label="Drag to reorder"
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className="w-4 h-4" />
    </button>
  );
};

const SortableRow = ({ row, onRowClick }) => {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={() => onRowClick?.(row.original)}
      className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
    >
      {row.getVisibleCells().map(cell => (
        <td key={cell.id} className="px-4 py-3 text-gray-700 text-xs">
          {cell.column.id === "__drag" ? (
            <DragHandleCell id={row.id} />
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </td>
      ))}
    </tr>
  );
};

export const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  placeholder = "Search...",
  pageSize = 5,
  exportFilename = "export",
  exportable = false,
  onRowClick,
  enableRowReorder = false,
  onReorderRows, // (newOrderedArray) => void
  getRowId, // (row) => string | number — required when enableRowReorder is true
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const dragDisabled = sorting.length > 0 || !!globalFilter;

  const tableColumns = enableRowReorder
    ? [
        {
          id: "__drag",
          header: "",
          enableSorting: false,
          cell: () => null, // rendered directly in SortableRow
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: enableRowReorder && getRowId ? (row) => String(getRowId(row)) : undefined,
    initialState: { pagination: { pageSize } },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentRows = table.getRowModel().rows.map(r => r.original);
    const oldIndex = currentRows.findIndex((r) => String(getRowId(r)) === active.id);
    const newIndex = currentRows.findIndex((r) => String(getRowId(r)) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentRows, oldIndex, newIndex);
    onReorderRows?.(reordered);
  };

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

  const rowIds = table.getRowModel().rows.map(r => r.id);

  const tableBody = (
    <tbody className="divide-y divide-gray-100 bg-foreground">
      {table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map(row =>
          enableRowReorder ? (
            <SortableRow key={row.id} row={row} onRowClick={onRowClick} />
          ) : (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 text-gray-700 text-xs">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          )
        )
      ) : (
        <tr>
          <td colSpan={tableColumns.length} className="px-4 py-8 text-center text-gray-400">
            No records found.
          </td>
        </tr>
      )}
    </tbody>
  );

  const tableElement = (
    <table className="w-full text-sm">
      <thead className="bg-foreground border-b border-gray-200">
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th
                key={header.id}
                onClick={header.column.id === "__drag" ? undefined : header.column.getToggleSortingHandler()}
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
      {enableRowReorder && !dragDisabled ? (
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {tableBody}
        </SortableContext>
      ) : (
        tableBody
      )}
    </table>
  );

  return (
    <div className="space-y-4 bg-card py-5 rounded-2xl shadow-lg">

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

      {enableRowReorder && dragDisabled && (
        <div className="mx-5 -mt-2 text-[11px] text-amber-600">
          Clear sorting and search to enable drag-to-reorder.
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-scroll">
        {enableRowReorder && !dragDisabled ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {tableElement}
          </DndContext>
        ) : (
          tableElement
        )}
      </div>

      <TablePagination table={table} />
    </div>
  );
};