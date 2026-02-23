"use client";
import React, { useEffect, useState } from "react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

interface DataTableProps<StockLogs> {
  columns: ColumnDef<StockLogs>[];
  data: StockLogs[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}
export function DataTable<StockLogs>({
  columns,
  data,
  globalFilter,
  onGlobalFilterChange,
}: DataTableProps<StockLogs>) {
  const actionFilters = ["IN", "OUT", "ADJUST"];
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize] = React.useState(10); // 10 items per page
  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action],
    );
  };
  const clearFilters = () => {
    setSelectedActions([]);
    onGlobalFilterChange?.("");
  };

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
  const filteredRows = table.getRowModel().rows ?? [];

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = filteredRows.slice(
    currentPageIndex * pageSize,
    currentPageIndex * pageSize + pageSize,
  );
  useEffect(() => {
    setPageIndex(0);
  }, [globalFilter, selectedActions, columnFilters]);
  useEffect(() => {
    const actionColumn = table.getColumn("action");
    if (!actionColumn) return;

    if (selectedActions.length > 0) {
      actionColumn.setFilterValue(selectedActions);
    } else {
      actionColumn.setFilterValue(undefined);
    }
  }, [selectedActions, table]);
  return (
    <>
      <div className="w-full overflow-x-auto rounded-b-md">
        <div className="border-t-lg rounded-t-2xl border-3 border-b-0 border-slate-700/80 bg-slate-800 p-5 text-slate-900">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1">
              <Input
                placeholder="Search logs by medicine, batch, note..."
                value={globalFilter ?? ""}
                onChange={(e) => onGlobalFilterChange?.(e.target.value)}
                className="bg-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {actionFilters.map((action) => {
                const isSelected = selectedActions.includes(action);
                return (
                  <Button
                    key={action}
                    variant={isSelected ? "default" : "outline"}
                    className={`text-xs sm:text-sm ${
                      isSelected ? "bg-slate-500 text-white" : ""
                    }`}
                    onClick={() => toggleAction(action)}
                  >
                    {action}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                className="text-xs text-slate-300 sm:text-sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
        <Table className="min-w-full border-t-3 border-l-3 border-slate-700/80">
          <TableHeader className="bg-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-slate-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="p-2 px-3 text-slate-900 sm:p-2 sm:px-5"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-iceblue">
            {pageRows.length ? (
              pageRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-2 px-3 text-sm text-slate-900 sm:p-5 sm:text-base"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-2 border-3 border-t-0 border-slate-700/80 bg-slate-900/20 px-3 py-4">
          <Button
            onClick={() => setPageIndex(0)}
            disabled={currentPageIndex <= 0}
            variant={"default"}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </Button>
          <Button
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={currentPageIndex <= 0}
            variant={"default"}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>

          <div className="px-4 text-sm font-medium text-slate-100">
            Page {currentPageIndex + 1} of {pageCount}
          </div>

          <Button
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPageIndex >= pageCount - 1}
            variant={"default"}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
          <Button
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={currentPageIndex >= pageCount - 1}
            variant={"default"}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}
