"use client";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { StockLog } from "@/types/stock-log";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Package } from "lucide-react";
import Image from "next/image";

const ACTION_COLORS: Record<string, string> = {
  IN: "bg-emerald-600 text-slate-100 ",
  OUT: "bg-red-600/70 text-white",
  ADJUST: "bg-yellow-300 text-black",
};

export const columns: ColumnDef<StockLog>[] = [
  {
    accessorKey: "imageUrl",
    header: () => {
      return <p className="text-center"> Image</p>;
    },
    cell: ({ row }) => {
      const medicine = row.original.medicineBatch;
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
    accessorFn: (row) => row.medicineBatch.name,
    id: "medicine",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Medicine
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <>
        <div className="capitalize font-medium text-xs sm:text-base ">
          {row.original.medicineBatch.name}
        </div>
        <div className="capitalize whitespace-normal text-xs  text-slate-600">
          Batch #{row.original.medicineBatch.batchNumber}
        </div>
      </>
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.medicineBatch.name?.toLowerCase() || "";
      const b = rowB.original.medicineBatch.name?.toLowerCase() || "";

      if (a > b) return 1;
      if (a < b) return -1;

      const batchA =
        rowA.original.medicineBatch.batchNumber?.toLowerCase() || "";
      const batchB =
        rowB.original.medicineBatch.batchNumber?.toLowerCase() || "";

      if (batchA > batchB) return 1;
      if (batchA < batchB) return -1;

      return 0;
    },
  },
  {
    accessorFn: (row) => `${row.action} ${row.quantityChange} `,
    accessorKey: "action",
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const { action, quantityChange } = row.original;
      let displayValue = "";

      if (action.includes(",")) {
        const actions = action.split(",");

        if (actions.includes("IN")) {
          displayValue = `+${quantityChange}`;
        } else if (actions.includes("OUT")) {
          displayValue = `-${quantityChange}`;
        }

        return (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 flex-col sm:flex-row">
              {actions.map((act) => (
                <Badge
                  key={act}
                  className={`capitalize font-medium text-xs rounded-sm
                    ${ACTION_COLORS[act] ?? "bg-slate-100  border-slate-200"}
                  `}
                >
                  {act}
                </Badge>
              ))}
            </div>
            <span className="text-sm font-medium ">{displayValue} pcs</span>
          </div>
        );
      } else {
        if (action === "IN") {
          displayValue = `+${quantityChange}`;
        } else if (action === "OUT") {
          displayValue = `-${Math.abs(quantityChange)}`;
        } else if (action === "ADJUST") {
          displayValue = quantityChange.toString();
        } else {
          displayValue = quantityChange.toString();
        }

        return (
          <div className="flex flex-col ">
            <Badge
              className={`capitalize font-medium text-xs rounded-sm
                ${ACTION_COLORS[action] ?? "bg-slate-100  border-slate-200"}
              `}
            >
              {action}
            </Badge>
            <span className="text-sm font-medium ">{displayValue} pcs</span>
          </div>
        );
      }
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
      const action = (row.original as StockLog).action as string;
      if (action.includes(",")) {
        const actions = action.split(",");
        return filterValue.some((f) => actions.includes(f));
      }
      return filterValue.includes(action);
    },
  },
  {
    accessorFn: (row) => `${row.note} ${row.createdBy} `,
    id: "note",
    header: "Note",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col max-w-xs">
          <span className="text-xs sm:text-sm capitalize font-medium  break-words whitespace-pre-wrap">
            {row.original.note}
          </span>
          <span className="text-xs text-slate-600 whitespace-normal">
            Created by {row.original.createdBy}
          </span>
        </div>
      );
    },
  },
  {
    id: "createdAt",
    accessorFn: (row) => new Date(row.createdAt).getTime(),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const raw = row.getValue<number>("createdAt");
      const date = new Date(raw);

      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return (
        <div className="flex flex-col lowercase">
          <span className="text-xs sm:text-sm capitalize font-medium ">
            {`${day} ${month} ${year}`}
          </span>
          <span className="text-xs sm:text-sm capitalize font-medium text-slate-600">
            {`${hours}:${minutes}`}
          </span>
        </div>
      );
    },
  },
];
