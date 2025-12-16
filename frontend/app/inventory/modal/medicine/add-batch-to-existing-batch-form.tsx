"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Package, AlertCircle } from "lucide-react";
import Image from "next/image";
import useMedicines from "@/hooks/useMedicines";
import { useBatches } from "@/hooks/useBatches";
import { Medicine, MedicineBatch } from "@/types/medicines";
import { toast } from "sonner";

interface AddBatchToExistingBatchFormProps {
  onSuccess?: () => void;
}

export default function AddBatchToExistingBatchForm({
  onSuccess,
}: AddBatchToExistingBatchFormProps) {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatch | null>(
    null
  );
  const [additionalQuantity, setAdditionalQuantity] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");

  const { medicinesQuery } = useMedicines();
  const { batchesQuery, updateBatchMutation } = useBatches();

  const medicines = useMemo(
    () => medicinesQuery.data ?? [],
    [medicinesQuery.data]
  );
  const batches = useMemo(() => batchesQuery.data ?? [], [batchesQuery.data]);

  // Filter medicines based on search
  const filteredMedicines = useMemo(() => {
    if (!medicineSearch.trim()) {
      return medicines;
    }
    return medicines.filter(
      (med: Medicine) =>
        med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(medicineSearch.toLowerCase())
    );
  }, [medicines, medicineSearch]);

  // Filter batches for selected medicine
  const filteredBatches = useMemo(() => {
    if (!selectedMedicine) return [];
    return batches.filter(
      (batch: MedicineBatch) =>
        batch.medicineId === selectedMedicine.id &&
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batches, selectedMedicine, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBatch || additionalQuantity <= 0) {
      alert("Please select a batch and enter a valid quantity");
      return;
    }

    setIsLoading(true);
    try {
      const newQuantity = selectedBatch.quantity + additionalQuantity;

      await updateBatchMutation.mutateAsync({
        id: selectedBatch.id,
        payload: {
          quantity: newQuantity,
        },
      });

      // Reset form
      setSelectedMedicine(null);
      setSelectedBatch(null);
      setAdditionalQuantity(0);
      setSearchTerm("");
      setMedicineSearch("");

      if (onSuccess) {
        onSuccess();
      }
      toast.success("Batch updated quantity successful!", {
        style: {
          background: "#009966",
          color: "white",
          border: "1px solid #009966",
          fontSize: "15px",
        },
      });
    } catch (error) {
      console.error("Error updating batch:", error);
      toast.error("Failed to update batch quantity.", {
        style: {
          background: "#e74753",
          color: "white",
          border: "1px solid #e74753",
          fontSize: "15px",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicines.find(
      (m: Medicine) => m.id === Number(medicineId)
    );
    setSelectedMedicine(medicine || null);
    setSelectedBatch(null);
    setSearchTerm("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Medicine Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Select Medicine</h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Search Medicine *
          </label>
          <div className="relative">
            {medicinesQuery.isLoading ? (
              <div className="flex items-center justify-center p-2 border border-slate-200 rounded-md">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            ) : (
              <Select
                value={selectedMedicine?.id?.toString() ?? ""}
                onValueChange={handleMedicineSelect}
                disabled={medicinesQuery.isLoading}
              >
                <SelectTrigger className="border-slate-200 p-5">
                  <SelectValue placeholder="Search and select medicine..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {/* Search field in dropdown */}
                  <div className="p-2 border-b border-slate-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search medicines..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="pl-8 h-8 text-sm border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Medicine options */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map((medicine) => (
                        <SelectItem
                          key={medicine.id}
                          value={medicine.id.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{medicine.name}</span>
                            {medicine.genericName && (
                              <span className="text-sm text-slate-500">
                                {medicine.genericName}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-slate-500 text-center">
                        No medicines found
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Medicine Info Display */}
        {selectedMedicine && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              {(() => {
                const imageUrl = selectedMedicine.imageUrl || "";
                const gcsUrl = imageUrl.startsWith("/images/medicine")
                  ? `https://storage.googleapis.com/pharventory-bucket${imageUrl}`
                  : imageUrl;

                return gcsUrl ? (
                  <Image
                    src={gcsUrl}
                    alt={selectedMedicine.name}
                    width={200}
                    height={60}
                    className="w-30 h-30 rounded-lg object-contain "
                    onError={(e) => {
                      e.currentTarget.src = "/images/logo/logo.png";
                    }}
                  />
                ) : (
                  <div className="w-30 h-30 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                );
              })()}
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">
                  {selectedMedicine.name}
                </h4>
                {selectedMedicine.genericName && (
                  <p className="text-sm text-slate-600">
                    {selectedMedicine.genericName}
                  </p>
                )}
                {selectedMedicine.category && (
                  <p className="text-sm text-slate-600">
                    {selectedMedicine.category.name}
                  </p>
                )}
                {selectedMedicine.unit && (
                  <p className="text-sm text-slate-600">
                    Unit: {selectedMedicine.unit.name}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-slate-600">
                    Stock: <strong>{selectedMedicine.totalStock}</strong>
                  </span>
                  <span className="text-slate-600">
                    Price: <strong>฿{selectedMedicine.price}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Selection */}
      {selectedMedicine && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Select Batch</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Search Batch *
            </label>
            <div className="relative">
              {batchesQuery.isLoading ? (
                <div className="flex items-center justify-center p-2 border border-slate-200 rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              ) : (
                <Select
                  value={selectedBatch?.id?.toString() ?? ""}
                  onValueChange={(value) => {
                    const batch = filteredBatches.find(
                      (b: MedicineBatch) => b.id === Number(value)
                    );
                    setSelectedBatch(batch || null);
                  }}
                  disabled={filteredBatches.length === 0}
                >
                  <SelectTrigger className="border-slate-200 py-5">
                    <SelectValue placeholder="Select batch..." />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {filteredBatches.length > 0 ? (
                      filteredBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {batch.batchNumber}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span>Qty: {batch.quantity}</span>
                              <span>•</span>
                              <span>
                                Exp:{" "}
                                {new Date(
                                  batch.expiryDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-slate-500 text-center">
                        No batches found for this medicine
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Batch Info Display */}
          {selectedBatch && (
            <div className="p-4 bg-blue-50/20 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-slate-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">
                    {selectedBatch.batchNumber}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-700">
                    <span>
                      Current Stock: <strong>{selectedBatch.quantity}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Expiry:{" "}
                      <strong>
                        {new Date(
                          selectedBatch.expiryDate
                        ).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Quantity */}
      {selectedBatch && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Add Quantity</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Additional Quantity *
            </label>
            <Input
              type="number"
              min="1"
              value={additionalQuantity}
              onChange={(e) =>
                setAdditionalQuantity(
                  Math.max(0, parseInt(e.target.value) || 0)
                )
              }
              placeholder="Enter quantity to add"
              className="border-slate-200"
            />
          </div>

          {/* Preview */}
          {additionalQuantity > 0 && (
            <div className="p-4  rounded-lg border border-emerald-600">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">Preview</h4>
                  <div className="mt-2 text-sm text-slate-700">
                    <p className="text-green-900">
                      Current Stock: <strong>{selectedBatch.quantity}</strong>
                    </p>
                    <p className="text-green-900">
                      Adding: <strong>+{additionalQuantity}</strong>
                    </p>
                    <p className="font-semibold text-green-900">
                      New Stock:{" "}
                      <strong>
                        {selectedBatch.quantity + additionalQuantity}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alert when no medicine selected */}
      {!selectedMedicine && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Please select a medicine first to view available batches
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isLoading || !selectedBatch || additionalQuantity <= 0}
          className="bg-slate-800 text-white hover:bg-slate-900"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Quantity...
            </>
          ) : (
            `Add ${additionalQuantity} to ${selectedBatch?.batchNumber || ""}`
          )}
        </Button>
      </div>
    </form>
  );
}
