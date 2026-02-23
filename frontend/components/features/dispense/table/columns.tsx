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
  onAddMedicine?: (medicine: Medicine) => void,
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
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <Image
                src={gcsUrl}
                alt={medicine.name}
                fill
                // sizes="(max-width: 640px) 48px, 64px"
                className="rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/logo/logo.png";
                }}
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-100 sm:h-25 sm:w-25">
              <Package className="h-10 w-10 text-slate-400" />
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
          <div className="font-medium capitalize">{row.original.name}</div>
          <div className="flex flex-col text-slate-600 sm:flex-row">
            <div className="">{row.original.genericName}</div>
          </div>
          <div className="flex gap-3 text-sm whitespace-break-spaces text-slate-600">
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
        <div className="flex w-full justify-end">
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
