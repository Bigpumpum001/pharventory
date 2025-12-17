"use client";

import React, { useEffect, useState } from "react";
import useMedicines from "@/hooks/useMedicines";
import useCategories from "@/hooks/useCategories";
import useUnits from "@/hooks/useUnits";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Package, Upload } from "lucide-react";
import Image from "next/image";
import { useImageUpload, validateImageFile } from "@/hooks/useImageUpload";
import { useInventoryUI } from "@/store/useInventoryUI";
import { UpdateMedicinePayload } from "@/types/medicines";
import { toast } from "sonner";

export default function EditMedicineModal({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { editMedicineOpen, editMedicinePayload, closeEditMedicine } =
    useInventoryUI();
  const { categoriesQuery } = useCategories();
  const { unitsQuery } = useUnits();

  const [formData, setFormData] = useState<
    UpdateMedicinePayload & { gcsUrl?: string }
  >({
    name: "",
    genericName: "",
    categoryId: null,
    unitId: null,
    price: 0,
    supplier: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [newPicPreviewUrl, setNewPicPreviewUrl] = useState<string>("");
  const imageUploadMutation = useImageUpload();

  useEffect(() => {
    if (!editMedicinePayload?.medicine) return;

    const m = editMedicinePayload.medicine;
    const timer = setTimeout(() => {
      // ถ้า imageUrl เริ่มต้นด้วย /images/medicine ให้แปลงเป็น GCS URL
      const imageUrl = m.imageUrl || "";
      const gcsUrl = imageUrl.startsWith("/images/medicine")
        ? `https://storage.googleapis.com/pharventory-bucket${imageUrl}`
        : imageUrl;

      setFormData({
        name: m.name || "",
        genericName: m.genericName || "",
        categoryId: m.category?.id ?? null,
        unitId: m.unit?.id ?? null,
        price: m.price ?? 0,
        supplier: m.supplier || "",
        imageUrl: imageUrl,
        gcsUrl: gcsUrl,
      });
      setPreviewUrl(gcsUrl);
      setNewPicPreviewUrl("");
      setSelectedFile(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [editMedicinePayload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: value }));
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
        setNewPicPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelNewImage = () => {
    setSelectedFile(null);
    setNewPicPreviewUrl("");
  };

  const { updateMedicine } = useMedicines();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMedicinePayload?.medicine?.id) return;
    setIsLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // ถ้ามีรูปใหม่ที่เลือก ให้อัปโหลดก่อน
      if (selectedFile) {
        const result = await imageUploadMutation.mutateAsync(selectedFile);
        finalImageUrl =
          "/" + result.localPath || `/images/medicine/${result.filename}`;
      }
      updateMedicine.mutate(
        {
          id: editMedicinePayload.medicine.id,
          payload: {
            name: formData.name,
            genericName: formData.genericName,
            categoryId: formData.categoryId
              ? Number(formData.categoryId)
              : undefined,
            unitId: formData.unitId ? Number(formData.unitId) : undefined,
            price: formData.price ? Number(formData.price) : undefined,
            supplier: formData.supplier,
            imageUrl: finalImageUrl,
          },
        },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess();
            closeEditMedicine();
            toast.success("Medicine updated success!", {
              style: {
                background: "#009966",
                color: "white",
                border: "1px solid #009966",
                fontSize: "15px",
              },
            });
          },
          onError: (err: unknown) => {
            console.error(err);

            toast.error("Failed to update medicine.", {
              style: {
                background: "#e74753",
                color: "white",
                border: "1px solid #e74753",
                fontSize: "15px",
              },
            });
          },
          onSettled: () => setIsLoading(false),
        }
      );
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={editMedicineOpen} onOpenChange={closeEditMedicine}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Edit Medicine
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                Update basic information of medicine
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Generic Name
              </label>
              <Input
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <Select
                value={formData.categoryId?.toString() || ""}
                onValueChange={(v) => handleSelect("categoryId", v)}
                disabled={categoriesQuery.isLoading}
              >
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue>
                    {formData.categoryId && categoriesQuery.data
                      ? (() => {
                          const category = categoriesQuery.data.find(
                            (cat) => cat.id === Number(formData.categoryId)
                          );
                          return category ? category.name : "Select category";
                        })()
                      : categoriesQuery.isLoading
                      ? "Loading categories..."
                      : categoriesQuery.isError
                      ? "Error loading categories"
                      : "Select category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categoriesQuery.data?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoriesQuery.isError && (
                <p className="text-sm text-red-600 mt-1">
                  Failed to load categories. Please try again.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Unit
              </label>
              <Select
                value={formData.unitId?.toString() || ""}
                onValueChange={(v) => handleSelect("unitId", v)}
                disabled={unitsQuery.isLoading}
              >
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue>
                    {formData.unitId && unitsQuery.data
                      ? (() => {
                          const unit = unitsQuery.data.find(
                            (u) => u.id === Number(formData.unitId)
                          );
                          return unit ? unit.name : "Select unit";
                        })()
                      : unitsQuery.isLoading
                      ? "Loading units..."
                      : unitsQuery.isError
                      ? "Error loading units"
                      : "Select unit"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {unitsQuery.data?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unitsQuery.isError && (
                <p className="text-sm text-red-600 mt-1">
                  Failed to load units. Please try again.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Price
              </label>
              <Input
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Supplier
              </label>
              <Input
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* Medicine Image Section - IMPROVED */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Medicine Image
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Current Image */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Current Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                  {previewUrl ? (
                    <div className="w-full h-32 flex items-center justify-center">
                      <Image
                        src={previewUrl}
                        alt="Current medicine"
                        width={128}
                        height={128}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Package size={40} />
                      <span className="text-sm mt-2">No image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload New Image */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Upload New Image
                </label>

                {!newPicPreviewUrl ? (
                  <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                      <Upload size={40} />
                      <span className="text-sm font-medium mt-2">
                        Choose File
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 relative">
                    <div className="w-full h-32 flex items-center justify-center">
                      <Image
                        src={newPicPreviewUrl}
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={closeEditMedicine}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-800 text-white hover:bg-slate-900"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
