"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUnits from "@/hooks/useUnits";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AddUnitFormProps {
  onSuccess?: () => void;
}

export default function AddUnitForm({ onSuccess }: AddUnitFormProps) {
  const { createUnit, unitsQuery } = useUnits();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // check duplicate
  useEffect(() => {
    const check = async () => {
      if (!name.trim()) {
        setFieldError(null);
        return;
      }
      setIsValidating(true);
      const trimmed = name.trim();
      const isDuplicate = unitsQuery.data?.some(
        (u) => u.name.toLowerCase() === trimmed.toLowerCase()
      );
      setFieldError(isDuplicate ? `Unit "${trimmed}" already exists` : null);
      setIsValidating(false);
    };
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, [name, unitsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFieldError("Unit name is required");
      return;
    }
    if (fieldError) return;
    createUnit.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          setError("");
          setFieldError(null);
          if (onSuccess) onSuccess();
          toast.success("Unit added success!", {
            style: {
              background: "#009966",
              color: "white",
              border:"1px solid #009966",
              fontSize: "15px",
            },
          });
        },
        onError: (error) => {
          console.error("Error create unit:", error);
           toast.error("Failed to add unit.", {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Unit Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tablet"
        />
        {isValidating && <p className="text-xs text-slate-500">Checking...</p>}
        {fieldError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{fieldError}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="submit"
          disabled={!name.trim() || !!fieldError || createUnit.isPending}
          className="bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createUnit.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Unit"
          )}
        </Button>
      </div>
    </form>
  );
}
