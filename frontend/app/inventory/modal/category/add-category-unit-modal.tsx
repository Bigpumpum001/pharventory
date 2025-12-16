"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddCategoryForm from "./add-category-form";
import AddUnitForm from "../unit/add-unit-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AddCategoryModalProps {
  onSuccess?: () => void;
}

export default function AddCategoryUnitModal({ onSuccess }: AddCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="border-2 border-slate-600/70  hover:bg-slate-600">
          <Plus className="w-4 h-4" />
          Add Category/Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category / Unit</DialogTitle>
          <DialogDescription>
            Create a new medicine category or unit for inventory
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="category">
          <TabsList>
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="unit">Unit</TabsTrigger>
          </TabsList>

          <TabsContent value="category">
            <AddCategoryForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="unit">
            <AddUnitForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
