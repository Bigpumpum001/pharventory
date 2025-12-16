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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
interface DataTableProps<Medicines> {
  columns: ColumnDef<Medicines>[];
  data: Medicines[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  statusFilter?: string[];
  showExpired?: boolean;
}

export function DataTable<Medicines>({
  columns,
  data,
  globalFilter,
  onGlobalFilterChange,
  statusFilter,
  showExpired,
}: DataTableProps<Medicines>) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize] = React.useState(10); // 10 items per page
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
  const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = allRows.slice(
    currentPageIndex * pageSize,
    currentPageIndex * pageSize + pageSize
  );

  React.useEffect(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return;
    if (statusFilter && statusFilter.length > 0) {
      statusColumn.setFilterValue(statusFilter);
    } else {
      statusColumn.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  return (
    <div className="overflow-x-auto w-full rounded-b-sm border-t-slate-800 ">
      <div className="max-h-[700px] overflow-y-auto ">
        <Table className="">
          <TableHeader className={`bg-slate-100 `}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-slate-400/90">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`text-slate-900 p-2 px-3 sm:p-2 sm:px-5 
                      ${header.column.columnDef.meta?.headerClassName || ""}
                      
                      `}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-iceblue">
            {/* bg-slate-400/10 */}
            {pageRows.length ? (
              pageRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-400/90 "
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`p-2 px-3 sm:p-5 text-sm sm:text-base  text-slate-900 
                  ${cell.column.columnDef.meta?.cellClassName || ""}
                  `}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-2 px-3 py-4 bg-slate-900/20  ">
        <Button
          onClick={() => setPageIndex(0)}
          disabled={currentPageIndex <= 0}
          variant={"default"}
        >
          <svg
            className="w-4 h-4"
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
            className="w-4 h-4"
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

        <div className="px-4 text-sm text-slate-100 font-medium">
          Page {currentPageIndex + 1} of {pageCount}
        </div>

        <Button
          onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
          disabled={currentPageIndex >= pageCount - 1}
          variant={"default"}
        >
          <svg
            className="w-4 h-4"
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
            className="w-4 h-4"
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
  );
}
