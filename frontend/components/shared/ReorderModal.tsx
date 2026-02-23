"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingBag, Plus, Trash2 } from "lucide-react";
import { useMedicineStore } from "@/store/useMedicineStore";

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReorderModal({ isOpen, onClose }: ReorderModalProps) {
  const { selectedItems, removeItem, resetItems, updateQuantity } =
    useMedicineStore();

  const totalItems = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };
  //Status ต้องอ่านจาก Current stock:
  const getStatus = (totalStock?: number) => {
    if (!totalStock) return "Critical";
    if (totalStock >= 25 && totalStock <= 100) return "Low";
    if (totalStock >= 0 && totalStock < 25) return "Critical";

    return "Normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "text-red-600";
      case "Low":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="m-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <CardHeader className="flex items-center justify-between border-b p-5">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Reorder List
            </CardTitle>
            <CardTitle className="text-xs text-slate-500">
              This page shows a list of items that need to be added or restocked
              in the inventory.
            </CardTitle>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {selectedItems.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="mb-2 text-slate-500">
                Don&apos;t have Reorder List yet
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 max-h-40 space-y-2 overflow-y-auto">
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        Current Stock: {item.totalStock ?? 0} | Status:
                        <span
                          className={`ml-1 ${getStatusColor(
                            getStatus(item.totalStock),
                          )}`}
                        >
                          {getStatus(item.totalStock)}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </div>
    </div>
  );
}
