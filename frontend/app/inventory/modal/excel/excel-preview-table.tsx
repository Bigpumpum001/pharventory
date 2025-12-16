"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, XCircle } from "lucide-react";
import { ImportType, ExcelRowData } from "@/types/medicines";

interface ExcelRow extends ExcelRowData {
  index: number;
  selected: boolean;
  isExists: boolean; // Override to make required
}

interface ExcelPreviewTableProps {
  data: ExcelRow[];
  importType: ImportType;
  selectedRows: Set<number>;
  onRowSelect: (index: number) => void;
  onSelectAll?: () => void;
}

export default function ExcelPreviewTable({
  data,
  importType,
  selectedRows,
  onRowSelect,
}: ExcelPreviewTableProps) {
  const getVisibleColumns = () => {
    const baseColumns = ["name", "categoryId"];

    if (
      importType === "medicine_batch" ||
      importType === "medicine_only"
    ) {
      baseColumns.push("generic_name", "unit", "supplier", "price");
    }

    if (
      importType === "medicine_batch" ||
      importType === "batch_only"
    ) {
      baseColumns.push("batch_number", "quantity", "expiry_date");
    }

    return baseColumns;
  };

  const visibleColumns = getVisibleColumns();

  const getColumnLabel = (column: string) => {
    const labels: Record<string, string> = {
      name: "Medicine Name",
      generic_name: "Generic Name",
      categoryId: "Category ID",
      unit: "Unit",
      supplier: "Supplier",
      price: "Price",
      batch_number: "Batch Number",
      quantity: "Quantity",
      expiry_date: "Expiry Date",
    };
    return labels[column] || column;
  };

  const getCellValue = (row: ExcelRow, column: string) => {
    const value = row[column as keyof ExcelRow];
    if (value === undefined || value === null) return "-";
    if (column === "price") return `฿${value}`;
    return String(value);
  };

  const getRowStatus = (row: ExcelRow) => {
    if (row.hasError) return "error";
    if (row.isExists) return "exists";
    return "new";
  };

  const getStatusBadge = (row: ExcelRow) => {
    const status = getRowStatus(row);
    
    if (status === "error") {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
        >
          <XCircle className="w-3 h-3" />
          Error
        </Badge>
      );
    }
    
    if (status === "exists") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Exists
        </Badge>
      );
    }
    
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        New
      </Badge>
    );
  };

  const getErrorIcon = (row: ExcelRow, column: string) => {
    if (!row.validationErrors || !row.validationErrors[column]) return null;
    return (
      <div className="flex items-center gap-1">
        <AlertCircle className="w-4 h-4 text-red-500" />
      </div>
    );
  };

  // Count errors
  const errorCount = data.filter(row => row.hasError).length;
  const validCount = data.filter(row => !row.hasError).length;

  return (
    <div className="space-y-4">
      {/* Error Summary */}
      {errorCount > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">
                Found {errorCount} row(s) with errors
              </p>
              <p className="text-sm text-red-700 mt-1">
                Rows with errors cannot be imported. Please fix the issues before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-left">
                <Checkbox
                  checked={
                    data.length > 0 && selectedRows.size === data.length
                  }
                  className="w-4 h-4"
                />
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column}
                  className="p-3 text-left font-medium text-slate-700 whitespace-nowrap"
                >
                  {getColumnLabel(column)}
                </th>
              ))}
              <th className="p-3 text-left font-medium text-slate-700 whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.index}
                className={`border-b border-slate-200 transition-colors ${
                  row.hasError
                    ? "bg-red-50 hover:bg-red-100"
                    : row.isExists
                    ? "bg-amber-50 hover:bg-amber-100"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="p-3">
                  <Checkbox
                    checked={selectedRows.has(row.index)}
                    onCheckedChange={() => onRowSelect(row.index)}
                    disabled={row.hasError}
                    className="w-4 h-4"
                  />
                </td>
                {visibleColumns.map((column) => (
                  <td
                    key={`${row.index}-${column}`}
                    className={`p-3 text-slate-700 whitespace-nowrap ${
                      row.hasError && row.validationErrors?.[column]
                        ? "text-red-600"
                        : row.isExists && column === "name"
                        ? "font-medium text-amber-900"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCellValue(row, column)}
                      {getErrorIcon(row, column)}
                    </div>
                  </td>
                ))}
                <td className="p-3 whitespace-nowrap">
                  {getStatusBadge(row)}
                  {row.errorMessage && (
                    <div className="mt-1 text-xs text-red-600">
                      {row.errorMessage}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {data.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          No data to display
        </div>
      )}
    </div>
  );
}
