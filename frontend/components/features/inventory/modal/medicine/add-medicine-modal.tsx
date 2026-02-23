"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";
import AddMedicineForm from "./add-medicine-form";
import AddBatchToExistMedicineForm from "./add-batch-to-exist-medicine-form";
import AddBatchToExistingBatchForm from "./add-batch-to-existing-batch-form";
import ImportExcelTab from "../excel/import-excel-tab";

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddMedicineModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMedicineModalProps) {
  const [activeTab, setActiveTab] = useState("add");
  const [selectedOption, setSelectedOption] = useState("new-medicine");

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const downloadTemplate = (type: string) => {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-slate-200 bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Add Medicine
              </DialogTitle>
              <DialogDescription className="mt-1 text-slate-600">
                Choose how you want to add medicines to your inventory
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* <TabsList className="w-full grid grid-cols-2 bg-slate-100">
            <TabsTrigger value="add" className="text-slate-700">
              Add by UI
            </TabsTrigger>
            <TabsTrigger value="import" className="text-slate-700">
              Import by Excel
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="add" className="space-y-6">
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className=""
            >
              <div
                className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-slate-200 p-3 transition-colors hover:border-slate-300 ${
                  selectedOption === "new-medicine"
                    ? "border-slate-800 bg-slate-50"
                    : ""
                }`}
                onClick={() => setSelectedOption("new-medicine")}
              >
                <RadioGroupItem
                  value="new-medicine"
                  id="new-medicine"
                  className="sr-only"
                />
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-400">
                  {selectedOption === "new-medicine" && (
                    <div className="h-2 w-2 rounded-full bg-slate-800"></div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="new-medicine"
                    className="cursor-pointer font-medium text-slate-900"
                  >
                    New Medicine
                  </Label>
                  <p className="text-sm text-slate-600">
                    Add a completely new medicine with optional batch
                    information
                  </p>
                </div>
              </div>

              <div
                className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-slate-200 p-3 transition-colors hover:border-slate-300 ${
                  selectedOption === "add-batch-medicine"
                    ? "border-slate-800 bg-slate-50"
                    : ""
                }`}
                onClick={() => setSelectedOption("add-batch-medicine")}
              >
                <RadioGroupItem
                  value="add-batch-medicine"
                  id="add-batch-medicine"
                  className="sr-only"
                />
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-400">
                  {selectedOption === "add-batch-medicine" && (
                    <div className="h-2 w-2 rounded-full bg-slate-800"></div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="add-batch-medicine"
                    className="cursor-pointer font-medium text-slate-900"
                  >
                    Add Batch to Existing Medicine
                  </Label>
                  <p className="text-sm text-slate-600">
                    Search for an existing medicine and add new batch
                    information
                  </p>
                </div>
              </div>

              <div
                className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-slate-200 p-3 transition-colors hover:border-slate-300 ${
                  selectedOption === "add-to-batch"
                    ? "border-slate-800 bg-slate-50"
                    : ""
                }`}
                onClick={() => setSelectedOption("add-to-batch")}
              >
                <RadioGroupItem
                  value="add-to-batch"
                  id="add-to-batch"
                  className="sr-only"
                />
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-400">
                  {selectedOption === "add-to-batch" && (
                    <div className="h-2 w-2 rounded-full bg-slate-800"></div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="add-to-batch"
                    className="cursor-pointer font-medium text-slate-900"
                  >
                    Add Quantity to Existing Batch
                  </Label>
                  <p className="text-sm text-slate-600">
                    Select an existing batch and add more quantity
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* Render selected component */}
            <div className="mt-6">
              {selectedOption === "new-medicine" && (
                <AddMedicineForm onSuccess={handleSuccess} />
              )}
              {selectedOption === "add-batch-medicine" && (
                <AddBatchToExistMedicineForm onSuccess={handleSuccess} />
              )}
              {selectedOption === "add-to-batch" && (
                <AddBatchToExistingBatchForm onSuccess={handleSuccess} />
              )}
            </div>
          </TabsContent>

          {/* <TabsContent value="import" className="mt-6">
            <ImportExcelTab onSuccess={handleSuccess} />
          </TabsContent> */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
