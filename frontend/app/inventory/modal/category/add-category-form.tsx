"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCategories from "@/hooks/useCategories";
import { Loader2, AlertCircle } from "lucide-react";
import { CreateCategoryPayload } from "@/types/category";
import { toast } from "sonner";

interface AddCategoryFormProps {
  onSuccess?: () => void;
}

export default function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
  const { createCategory, categoriesQuery } = useCategories();
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
  }>({});
  const [isValidating, setIsValidating] = useState(false);

  // Check for duplicate category name while typing
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!formData.name.trim()) {
        setFieldErrors({});
        return;
      }

      setIsValidating(true);
      const trimmedName = formData.name.trim();
      const isDuplicate = categoriesQuery.data?.some(
        (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        setFieldErrors({
          name: `Category "${trimmedName}" already exists in the system`,
        });
      } else {
        setFieldErrors({});
      }
      setIsValidating(false);
    };

    const timer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timer);
  }, [formData.name, categoriesQuery.data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      setFieldErrors({ name: "Category name is required" });
      return;
    }

    if (fieldErrors.name) {
      return;
    }
    createCategory.mutate(
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
      },
      {
        onSuccess: () => {
          setFormData({ name: "", description: "" });
          setError("");
          setFieldErrors({});
          if (onSuccess) {
            onSuccess();
          }
          toast.success("Category added success!", {
            style: {
              background: "#009966",
              color: "white",
              border:"1px solid #009966",
              fontSize: "15px",
            },
          });
        },
        onError: (error) => {
          console.error("Error to create category", error);
          toast.error("Failed to add category.", {
            style: {
              background: "#e74753",
              color: "white",
              border: "1px solid #e74753",
              fontSize: "15px",
            },
          });
        },
      }
    );
  };

  const isDisabled =
    !formData.name.trim() ||
    !!fieldErrors.name ||
    createCategory.isPending ||
    isValidating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Category Name *
            </label>
            {isValidating && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Checking...
              </span>
            )}
          </div>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter category name"
            className={`border-slate-200 ${
              fieldErrors.name ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {fieldErrors.name && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{fieldErrors.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter category description (optional)"
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-400 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isDisabled}
          className="bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createCategory.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Category"
          )}
        </Button>
      </div>
    </form>
  );
}
