"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useInventoryUI } from "@/store/useInventoryUI";

export default function DeleteMedicineModal({ onSuccess }: { onSuccess?: () => void }) {
  const { deleteMedicineOpen, deleteMedicineId, closeDeleteMedicine } = useInventoryUI();
  const [isLoading, setIsLoading] = useState(false);

  const confirm = async () => {
    if (!deleteMedicineId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/medicines/${deleteMedicineId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      if (onSuccess) onSuccess();
      closeDeleteMedicine();
    } catch (err) {
      console.error(err);
      alert("Failed to delete medicine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={deleteMedicineOpen} onOpenChange={closeDeleteMedicine}>
      <DialogContent className="max-w-md bg-white border-slate-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">Delete Medicine</DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">This action will soft-delete the medicine. You can restore it later.</DialogDescription>
            </div>

            <Button variant="ghost" size="sm" onClick={closeDeleteMedicine} className="text-slate-500">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-slate-700">Are you sure you want to delete this medicine?</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeDeleteMedicine}>Cancel</Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirm} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
