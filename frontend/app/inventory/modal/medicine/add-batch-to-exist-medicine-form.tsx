"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Search, Loader2, Package, AlertCircle } from "lucide-react";
import Image from "next/image";
import useMedicines from "@/hooks/useMedicines";
import { useBatches } from "@/hooks/useBatches";
import { Medicine, CreateMedicineBatchPayload } from "@/types/medicines";
import { useAddBatchToMedicine } from "@/hooks/useBatches";
import { toast } from "sonner";

interface AddBatchToExistMedicineFormProps {
  onSuccess?: () => void;
}

export default function AddBatchToExistMedicineForm({
  onSuccess,
}: AddBatchToExistMedicineFormProps) {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [batches, setBatches] = useState<CreateMedicineBatchPayload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");

  const { medicinesQuery } = useMedicines();
  const addBatchToMedicineMutation = useAddBatchToMedicine();

  const medicines = useMemo(
    () => medicinesQuery.data ?? [],
    [medicinesQuery.data]
  );

  // Filter medicines based on search
  const filteredMedicines = useMemo(() => {
    if (!medicineSearch.trim()) {
      return medicines;
    }
    return medicines.filter(
      (med) =>
        med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(medicineSearch.toLowerCase())
    );
  }, [medicines, medicineSearch]);

  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicines.find((m) => m.id === Number(medicineId));
    setSelectedMedicine(medicine || null);
    setBatches([]);
  };

  const addBatch = () => {
    setBatches((prev) => [
      ...prev,
      {
        batchNumber: "",
        quantity: 0,
        expiryDate: "",
      },
    ]);
  };

  const removeBatch = (index: number) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const updateBatch = (
    index: number,
    field: keyof CreateMedicineBatchPayload,
    value: string | number
  ) => {
    const newBatches = [...batches];
    newBatches[index] = {
      ...newBatches[index],
      [field]: value,
    };
    setBatches(newBatches);
  };

  const validateForm = () => {
    if (!selectedMedicine) return false;
    if (batches.length === 0) return false;

    return batches.every(
      (batch) =>
        batch.batchNumber.trim() !== "" &&
        batch.quantity > 0 &&
        batch.expiryDate !== ""
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning(
        `Please select a medicine and fill in all batch information.`,
        {
          style: {
            background: "#ffdf20",
            color: "black",
            border: "1px solid #ffdf20",
          },
        }
      );

      return;
    }

    if (!selectedMedicine) return;
    setIsLoading(true);
    try {
      // Create batches for selected medicine
      for (const batch of batches) {
        await addBatchToMedicineMutation.mutateAsync({
          medicineId: selectedMedicine.id,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
        });
      }

      // Reset form
      setSelectedMedicine(null);
      setBatches([]);
      setMedicineSearch("");

      if (onSuccess) {
        onSuccess();
      }
      toast.success("Batch Added  to medicine successful!", {
        style: {
          background: "#009966",
          color: "white",
          border: "1px solid #009966",
          fontSize: "15px",
        },
      });
    } catch (error) {
      console.error("Error adding batch:", error);
       toast.error("Failed to add batch to medicine.", {
        style: {
          background: "#e74753",
          color: "white",
          border: "1px solid #e74753",
          fontSize:"15px"
        },
      });
    } finally {
      setIsLoading(false);
    }
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
                <SelectTrigger className="border-slate-200 py-5">
                  <SelectValue placeholder="Search and select medicine..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {/* Search field in dropdown */}
                  <div className="p-2 border-b border-slate-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        placeholder="Search medicines..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="pl-8 h-8 text-sm border-slate-200 w-full px-2 rounded"
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

      {/* Batches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Add New Batches</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBatch}
            disabled={!selectedMedicine}
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" />
            Add Batch
          </Button>
        </div>

        {!selectedMedicine && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-700">
              Please select a medicine first to add batches
            </p>
          </div>
        )}

        {batches.map((batch, index) => (
          <div
            key={index}
            className="p-4 border border-slate-200 rounded-lg space-y-3 "
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-600">
                Batch {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBatch(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Batch Number *
                </label>
                <input
                  type="text"
                  value={batch.batchNumber}
                  onChange={(e) =>
                    updateBatch(index, "batchNumber", e.target.value)
                  }
                  placeholder="e.g., BATCH001"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={batch.quantity || ""}
                  onChange={(e) =>
                    updateBatch(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={batch.expiryDate}
                  onChange={(e) =>
                    updateBatch(index, "expiryDate", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>
        ))}

        {selectedMedicine && batches.length === 0 && (
          <p className="text-sm text-slate-500 italic">
            No batches added yet. Click &quot;Add Batch&quot; to add one.
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="submit"
          disabled={
            isLoading || addBatchToMedicineMutation.isPending || !validateForm()
          }
          className="bg-slate-800 text-white hover:bg-slate-900"
        >
          {isLoading || addBatchToMedicineMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Batches...
            </>
          ) : !selectedMedicine ? (
            "Please select a medicine"
          ) : batches.length === 0 ? (
            "Please add at least one batch"
          ) : (
            `Add ${batches.length} batch(es) to ${
              selectedMedicine?.name || "medicine"
            }`
          )}
        </Button>
      </div>
    </form>
  );
}
