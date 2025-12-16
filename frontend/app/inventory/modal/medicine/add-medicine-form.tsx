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
import { Plus, X, Search, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import useCategories from "@/hooks/useCategories";
import useUnits from "@/hooks/useUnits";
import {
  CreateMedicinePayload,
  CreateMedicineBatchPayload,
} from "@/types/medicines";
import useMedicines from "@/hooks/useMedicines";
import { useImageUpload, validateImageFile } from "@/hooks/useImageUpload";
import { toast } from "sonner";

interface AddMedicineFormProps {
  onSuccess?: () => void;
}

export default function AddMedicineForm({ onSuccess }: AddMedicineFormProps) {
  const [isFormValid, setIsFormValid] = useState(false);
  const { categoriesQuery } = useCategories();
  const { createMedicine } = useMedicines();
  const { unitsQuery } = useUnits();
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  );
  const units = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);

  const [formData, setFormData] = useState<CreateMedicinePayload>({
    name: "",
    genericName: "",
    categoryId: null,
    unitId: null,
    price: 0,
    supplier: "",
    imageUrl: "",
  });
  const [categorySearch, setCategorySearch] = useState("");
  const [batches, setBatches] = useState<CreateMedicineBatchPayload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const imageUploadMutation = useImageUpload();

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) {
      return categories;
    }
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const validateForm = () => {
    const isValid =
      formData.name.trim() !== "" &&
      formData.categoryId !== null &&
      formData.price >= 0; // price ≥ 0
    setIsFormValid(isValid);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Math.max(0, Number(value)) : value, // price ≥ 0
    }));
    validateForm();
  };

  const handleSelectChange = (name: "categoryId" | "unitId", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
    validateForm();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
      setSelectedFile(file);

      // Create preview for new image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelNewImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image to GCS if there's a selected file
      if (selectedFile) {
        const result = await imageUploadMutation.mutateAsync(selectedFile);
        finalImageUrl =
          "/" + result.localPath || `/images/medicine/${result.filename}`;
      }

      const payload: CreateMedicinePayload = {
        name: formData.name,
        genericName: formData.genericName,
        categoryId: Number(formData.categoryId) ?? undefined,
        unitId: Number(formData.unitId) ?? undefined,
        price: Number(formData.price) ?? 0,
        supplier: formData.supplier,
        imageUrl: finalImageUrl,
        batches: batches?.length ? batches : [],
      };

      createMedicine.mutate(payload, {
        onSuccess: (data) => {
          setFormData({
            name: "",
            genericName: "",
            categoryId: null,
            unitId: null,
            price: 0,
            supplier: "",
            imageUrl: "",
          });
          setBatches([]);
          setCategorySearch("");
          setSelectedFile(null);
          setPreviewUrl("");
          if (onSuccess) {
            onSuccess();
          }
          toast.success("Medicine added  successful!", {
            style: {
              background: "#009966",
              color: "white",
              border: "1px solid #009966",
              fontSize: "15px",
            },
          });
          setIsLoading(false);
        },
        onError: (error) => {
          console.error("Error create medicine:", error);
          toast.error("Failed to add medicine.", {
            style: {
              background: "#e74753",
              color: "white",
              border: "1px solid #e74753",
              fontSize: "15px",
            },
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
      setIsLoading(false);
    }
  };

  // Batch Management (optional)
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
    field: string,
    value: string | number
  ) => {
    const newBatches = [...batches];
    newBatches[index] = {
      ...newBatches[index],
      [field]: value,
    };
    setBatches(newBatches);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Medicine Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Medicine Name *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter medicine name"
              className="border-slate-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Generic Name
            </label>
            <Input
              name="genericName"
              value={formData.genericName}
              onChange={handleInputChange}
              placeholder="Enter generic name"
              className="border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Category *
            </label>
            <div className="relative">
              {categoriesQuery.isLoading ? (
                <div className="flex items-center justify-center p-2 border border-slate-200 rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              ) : (
                <Select
                  value={formData.categoryId?.toString() ?? undefined}
                  onValueChange={(value) => {
                    handleSelectChange("categoryId", value);
                    setCategorySearch("");
                  }}
                  required
                >
                  <SelectTrigger className="border-slate-200 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {/* Search field in dropdown */}
                    <div className="p-2 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="pl-8 h-8 text-sm border-slate-200"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Category options */}
                    <div className="max-h-40 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-slate-500 text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Unit
            </label>
            <Select
              value={formData.unitId?.toString() ?? undefined}
              onValueChange={(value) => handleSelectChange("unitId", value)}
              required
            >
              <SelectTrigger className="border-slate-200 w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Price
            </label>
            <Input
              name="price"
              type="number"
              step="1"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Supplier
            </label>
            <Input
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              className="border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Medicine Image Section - IMPROVED */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Medicine Image
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Upload New Image */}
          <div className="">
            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                  <Upload size={40} />
                  <span className="text-sm font-medium mt-2">Choose File</span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              </label>
            ) : (
              <div className=" rounded-lg p-4 bg-blue-50 relative">
                <div className="w-full h-32 flex items-center justify-center">
                  <Image
                    src={previewUrl}
                    alt="New medicine"
                    width={128}
                    height={128}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <button
                  onClick={handleCancelNewImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Batches (Optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBatch}
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" />
            Add Batch
          </Button>
        </div>

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
                  Batch Number
                </label>
                <Input
                  value={batch.batchNumber}
                  onChange={(e) =>
                    updateBatch(index, "batchNumber", e.target.value)
                  }
                  placeholder="e.g., BATCH001"
                  className="bg-white border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={batch.quantity}
                  onChange={(e) =>
                    updateBatch(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  className="bg-white border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={batch.expiryDate}
                  onChange={(e) =>
                    updateBatch(index, "expiryDate", e.target.value)
                  }
                  className="bg-white border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {batches.length === 0 && (
          <p className="text-sm text-slate-500 italic">
            No batches added yet. Click &quot;Add Batch&quot; to add one.
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="bg-slate-800 text-white hover:bg-slate-900"
        >
          {isLoading
            ? "Adding..."
            : !isFormValid
            ? "Please fill all required fields"
            : "Add Medicine"}
        </Button>
      </div>
    </form>
  );
}
