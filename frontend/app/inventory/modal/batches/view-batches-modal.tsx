"use client";

import React, { useEffect } from "react";
import { useBatches } from "@/hooks/useBatches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";
import { useInventoryUI } from "@/store/useInventoryUI";
import EditBatchModal from "./edit-batch-modal";
import { MedicineBatch } from "@/types/medicines";
import useMedicines from "@/hooks/useMedicines";

interface ViewBatchesModalProps {
  showExpired?: boolean;
}

export default function ViewBatchesModal(props: ViewBatchesModalProps) {
  const { viewBatchesOpen, viewBatchesPayload, closeViewBatches } =
    useInventoryUI();

  const medicine = viewBatchesPayload?.medicine;
  const showExpired =
    props.showExpired ?? viewBatchesPayload?.showExpired ?? false;
  // Use React Query to fetch all batches, then filter for this medicine
  const { batchesQuery } = useBatches();
  const data = batchesQuery.data ?? [];
  const batches = data?.filter((b) => b.medicineId === medicine?.id) ?? [];
  const getFilteredBatches = () => {
    const now = new Date();
    return batches.filter((b) => {
      if (showExpired) {
        return new Date(b.expiryDate) < now; // Show expired batches in inventory view
      } else {
        return new Date(b.expiryDate) >= now; // Show only non-expired in inventory view
      }
    });
  };
  const isLoading = batchesQuery.isLoading;

  return (
    <>
      <Dialog open={viewBatchesOpen} onOpenChange={closeViewBatches}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white border-slate-200">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  Batches — {medicine?.name ?? "Medicine"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  List of batches and their quantities/expiry dates
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading batches...</p>
            ) : batches.length === 0 ? (
              <p className="text-sm text-slate-500">
                No batches found for this medicine.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {getFilteredBatches().map((b: MedicineBatch) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">
                          {b.batchNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {b.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-700">
                          Exp:{" "}
                          {b.expiryDate
                            ? (() => {
                                const date = new Date(b.expiryDate);
                                const day = date
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0");
                                const month = date
                                  .toLocaleDateString("en-US", {
                                    month: "short",
                                  })
                                  .toLowerCase();
                                const year = date.getFullYear();
                                return `${day}-${month}-${year}`;
                              })()
                            : "—"}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            useInventoryUI.getState().openEditBatch({
                              medicine,
                              batch: b,
                            })
                          }
                          className="text-slate-500 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={closeViewBatches}
              className="bg-slate-800 text-white hover:bg-slate-900"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditBatchModal />
    </>
  );
}
