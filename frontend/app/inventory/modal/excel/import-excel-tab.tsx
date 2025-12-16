"use client";

import React, { useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  Download,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ExcelPreviewTable from "./excel-preview-table";
import { useImportExcel } from "@/hooks/useBatches";
import { ImportType, ExcelRowData } from "@/types/medicines";

const IMPORT_TYPES = {
  MEDICINE_AND_BATCH: "medicine_batch",
  MEDICINE_ONLY: "medicine_only",
  BATCH_ONLY: "batch_only",
} as const;

interface ImportExcelTabProps {
  onSuccess?: () => void;
}

// Shared ExcelRow type that matches excel-preview-table.tsx
interface ExcelRow extends ExcelRowData {
  index: number;
  selected: boolean;
  isExists: boolean; // Override to make required
}

export default function ImportExcelTab({ onSuccess }: ImportExcelTabProps) {
  const [importType, setImportType] = useState<ImportType>(
    "medicine_batch" as ImportType
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [cacheKey, setCacheKey] = useState<string>("");
  const [step, setStep] = useState<"select" | "preview" | "result">("select");
  const [result, setResult] = useState<{
    created?: Array<{ name: string }>;
    updated?: Array<{ name: string }>;
    errors?: Array<{ name: string; error: string }>;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type.includes("spreadsheet") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls") ||
        selectedFile.name.endsWith(".csv"))
    ) {
      setFile(selectedFile);
    } else {
      alert("Please select a valid Excel file (.xlsx, .xls, .csv)");
    }
  };

  const handleUpload = async () => {
    if (!file || !importType) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("importType", importType);

      const response = await fetch("/api/import-excel/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse Excel file");
      }

      const data = await response.json();
      setCacheKey(data.cacheKey);

      // Initialize preview data with selection state
      const previewRows = data.data.map((row: ExcelRowData) => ({
        ...row,
        selected: false,
        isExists: row.isExists || false, // Ensure isExists is always a boolean
      }));

      setPreviewData(previewRows);
      setSelectedRows(new Set());
      setStep("preview");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to parse Excel file");
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);

    // Update preview data
    const newPreviewData = previewData.map((row) => ({
      ...row,
      selected: newSelected.has(row.index),
    }));
    setPreviewData(newPreviewData);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === previewData.length) {
      setSelectedRows(new Set());
      setPreviewData(
        previewData.map((row) => ({
          ...row,
          selected: false,
        }))
      );
    } else {
      const allIndices = new Set(previewData.map((row) => row.index));
      setSelectedRows(allIndices);
      setPreviewData(
        previewData.map((row) => ({
          ...row,
          selected: true,
        }))
      );
    }
  };

  const handleConfirmImport = async () => {
    if (selectedRows.size === 0) {
      alert("Please select at least one row to import");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/import-excel/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          importType,
          selectedRows: Array.from(selectedRows),
          cacheKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm import");
      }

      const resultData = await response.json();
      setResult(resultData);
      setStep("result");

      // Reset form after successful import
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to import data");
    } finally {
      setLoading(false);
    }
  };

  const getImportTypeLabel = (type: ImportType) => {
    switch (type) {
      case "medicine_batch":
        return "Medicine + Batch";
      case "medicine_only":
        return "Medicine Only";
      case "batch_only":
        return "Batch Only";
      default:
        return type;
    }
  };

  const getImportTypeDescription = (type: ImportType) => {
    switch (type) {
      case "medicine_batch":
        return "Import both medicine information and batch details. If medicine exists, it will add a new batch.";
      case "medicine_only":
        return "Import only medicine information without batch details. Existing medicines will be skipped.";
      case "batch_only":
        return "Import only batch details to existing medicines. Only medicines that already exist will be updated.";
      default:
        return "";
    }
  };

  const downloadTemplate = (type: ImportType) => {
    let headers: string[] = [];
    let exampleData: Record<string, string | number>[] = [];
    let filename = "";

    switch (type) {
      case "medicine_batch":
        headers = [
          "name",
          "generic_name",
          "category",
          "unit",
          "price",
          "supplier",
          "batch_number",
          "quantity",
          "expiry_date",
        ];
        exampleData = [
          {
            name: "Lisinopril",
            generic_name: "Lisinopril",
            category: "Antihypertensive",
            unit: "tablet",
            price: 3.5,
            supplier: "Pharma Corp",
            batch_number: "BATCH001",
            quantity: 100,
            expiry_date: "2025-12-31",
          },
        ];
        filename = "medicine_batch_template.xlsx";
        break;
      case "medicine_only":
        headers = [
          "name",
          "generic_name",
          "category",
          "unit",
          "price",
          "supplier",
        ];
        exampleData = [
          {
            name: "Lisinopril",
            generic_name: "Lisinopril",
            category: "Antihypertensive",
            unit: "tablet",
            price: 3.5,
            supplier: "Pharma Corp",
          },
        ];
        filename = "medicine_only_template.xlsx";
        break;
      case "batch_only":
        headers = ["medicine_name", "batch_number", "quantity", "expiry_date"];
        exampleData = [
          {
            medicine_name: "Lisinopril",
            batch_number: "BATCH001",
            quantity: 100,
            expiry_date: "2025-12-31",
          },
        ];
        filename = "batch_only_template.xlsx";
        break;
    }

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...exampleData.map((row) =>
        headers.map((header) => row[header] || "").join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {step === "select" && (
        <div className="space-y-6">
          {/* Import Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Import Type
            </label>
            <div className="space-y-2">
              {Object.values(IMPORT_TYPES).map((type) => (
                <div
                  key={type}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    importType === type
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="importType"
                        value={type}
                        checked={importType === type}
                        onChange={() => setImportType(type as ImportType)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {getImportTypeLabel(type)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {getImportTypeDescription(type)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate(type as ImportType);
                      }}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Select File
            </label>
            <div className="flex items-center gap-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {file ? file.name : "Choose Excel file"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-slate-800 text-white hover:bg-slate-900 w-full"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Parse File
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Preview & Select Data
            </h3>
            <p className="text-sm text-slate-600">
              {previewData.length} rows found. Highlighted rows indicate
              existing medicines.
            </p>
          </div>

          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Checkbox
              checked={
                selectedRows.size === previewData.length &&
                previewData.length > 0
              }
              onCheckedChange={handleSelectAll}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-slate-700">
              Select All ({selectedRows.size}/{previewData.length})
            </span>
          </div>

          {/* Preview Table */}
          <ExcelPreviewTable
            data={previewData}
            importType={importType}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelection}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                setStep("select");
                setPreviewData([]);
                setCacheKey("");
                setSelectedRows(new Set());
              }}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={selectedRows.size === 0 || loading}
              className="bg-slate-800 text-white hover:bg-slate-900 flex-1"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import {selectedRows.size} row(s)
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4 py-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">
              Import Completed!
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700">Created</p>
              <p className="text-2xl font-bold text-green-600">
                {result.created?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700">Updated</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.updated?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-700">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {result.errors?.length || 0}
              </p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900">Errors:</p>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {result.errors.map(
                      (err: { name: string; error: string }, idx: number) => (
                        <li key={idx}>
                          {err.name}: {err.error}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600 text-center italic">
            Redirecting...
          </p>
        </div>
      )}
    </div>
  );
}
