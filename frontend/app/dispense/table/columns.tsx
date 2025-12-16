"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Medicine } from "@/types/medicines";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
const LOW_STOCK_THRESHOLD = 100;
const CRITICAL_STOCK_THRESHOLD = 25;

export const getStockStatus = (stock: number | undefined) => {
  if (typeof stock !== "number") return "Normal";
  if (stock <= CRITICAL_STOCK_THRESHOLD) return "Critical";
  if (stock <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "Normal";
};

export const getColumns = (
  onAddMedicine?: (medicine: Medicine) => void
): ColumnDef<Medicine>[] => [
  {
    accessorKey: "imageUrl",
    header: () => {
      return <p className="text-center"> Image</p>;
    },
    cell: ({ row }) => {
      const medicine = row.original;

 
      const imageUrl = medicine.imageUrl || "";
      const gcsUrl = imageUrl.startsWith("/images/medicine")
        ? `https://storage.googleapis.com/pharventory-bucket${imageUrl}`
        : imageUrl;
      return (
              <div className="flex items-center justify-center">
                {gcsUrl ? (
                  <div className="relative h-20 w-full sm:h-25">
                    <Image
                      src={gcsUrl}
                      alt={medicine.name}
                      fill
                      className="rounded-md object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/images/logo/logo.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-25 sm:h-25 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Package className="w-10 h-10 text-slate-400" />
                  </div>
                )}
              </div>
            );
          },
  },
  {
    accessorFn: (row) =>
      `${row.name} ${row.genericName} ${row.category?.name} ${row.unit?.name}`,
    id: "name",
    header: "Medicine",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="capitalize font-medium ">{row.original.name}</div>
          <div className="flex flex-col sm:flex-row text-slate-600">
            <div className="">{row.original.genericName}</div>
          </div>
          <div className="flex gap-3 text-sm text-slate-600 whitespace-break-spaces"> 
            <p>{row.original.category?.name}</p>
            <p>{row.original.unit?.name}</p>
            <p>
              Stock :
              <span className="text-slate-900"> {row.original.totalStock}</span>
            </p>
            <p className="font-medium text-slate-900">฿ {row.original.price}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const med = row.original;
      return (
        <div className="flex justify-end w-full">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-slate-100"
            onClick={() => {
              if (onAddMedicine) {
                onAddMedicine(med);
              }
            }}
            title="Add to prescription"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export const columns = getColumns();
