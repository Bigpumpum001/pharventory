"use client";
import React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<Medicines> {
  columns: ColumnDef<Medicines>[];
  data: Medicines[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function DataTable<Medicines>({
  columns,
  data,
  globalFilter,
  onGlobalFilterChange,
}: DataTableProps<Medicines>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    onGlobalFilterChange,
  });

  const allRows = table.getRowModel().rows ?? [];

  return (
    <div className="overflow-x-auto w-full rounded-md border border-slate-400/50 ">
      <div className="max-h-[595px] overflow-y-auto">
        <Table className="  ">
          <TableBody className="bg-white/70 ">
            {allRows.length ? (
              allRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3  text-sm sm:text-base text-slate-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
