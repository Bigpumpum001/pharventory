"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryUI } from "@/store/useInventoryUI";
import { useUpdateBatch } from "@/hooks/useBatches";
import { UpdateMedicineBatchPayload } from "@/types/medicines";
import { toast } from "sonner";

export default function EditBatchModal() {
  const { editBatchOpen, editBatchPayload, closeEditBatch, updateBatchInView, triggerRefetchMedicines } =
    useInventoryUI();

  const updateBatchMutation = useUpdateBatch();

  const batch = editBatchPayload?.batch ?? null;

  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset form when batch changes
      if (batch) {
        setBatchNumber(batch.batchNumber ?? "");
        setQuantity(batch.quantity ?? "");
        // normalize expiry to YYYY-MM-DD for input[type=date]
        const dateVal = batch.expiryDate ?? null;
        if (dateVal) {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            setExpiry(`${yyyy}-${mm}-${dd}`);
          } else {
            setExpiry("");
          }
        } else {
          setExpiry("");
        }
      } else {
        setBatchNumber("");
        setQuantity("");
        setExpiry("");
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [batch]);

  async function onSave() {
    if (!batch || !batch.id) return closeEditBatch();

    const updateData: UpdateMedicineBatchPayload = {};

    // Only include fields that have changed
    if (batchNumber && batchNumber !== batch.batchNumber) {
      updateData.batchNumber = batchNumber;
    }

    if (typeof quantity === "number" && quantity !== batch.quantity) {
      updateData.quantity = quantity;
    }

    if (expiry) {
      const newDate = new Date(expiry);
      const currentDate = new Date(batch.expiryDate);

      // Compare dates without time component to avoid timezone issues
      const newDateOnly = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate()
      );
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      if (newDateOnly.getTime() !== currentDateOnly.getTime()) {
        updateData.expiryDate = newDate.toISOString();
      }
    }

    // If no changes, just close modal
    if (Object.keys(updateData).length === 0) {
      return closeEditBatch();
    }
    updateBatchMutation.mutate(
      {
        id: batch.id,
        data: updateData,
      },
      {
        onSuccess: (result) => {
             toast.success("Batch updated successfully!", {
            style: {
              background: "#009966",
              color: "white",
              border:"1px solid #009966",
              fontSize: "15px",
            },
          });
          closeEditBatch();
          if (result) {
            updateBatchInView(result);
          }
          // Trigger refetch medicines to update inventory quantities
          triggerRefetchMedicines();
        },
        onError: (error) => {
          console.error("Failed to update batch:", error);
          toast.error("Failed to update batch. Please try again.", {
            style: {
              background: "#e74753",
              color: "white",
              fontSize: "15px",
            },
          });
        }
      }
    );
  }

  return (
    <Dialog open={!!editBatchOpen} onOpenChange={closeEditBatch}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Batch</DialogTitle>
          <DialogDescription>
            Edit batch details for{" "}
            {editBatchPayload?.medicine?.name ?? "medicine"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label>Batch Number</Label>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Enter batch number"
            />
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Enter quantity"
              min="0"
            />
          </div>

          <div>
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={closeEditBatch}
            disabled={updateBatchMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-slate-800 text-white hover:bg-slate-900"
            disabled={updateBatchMutation.isPending}
          >
            {updateBatchMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
