"use client";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Medicine } from "@/types/medicines";
import { useInventoryUI } from "@/store/useInventoryUI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
const LOW_STOCK_THRESHOLD = 100;
const CRITICAL_STOCK_THRESHOLD = 25;

export const getStockStatus = (stock: number | undefined) => {
  if (typeof stock !== "number") return "Normal";

  if (stock >= CRITICAL_STOCK_THRESHOLD && stock < LOW_STOCK_THRESHOLD)
    return "Low Stock";
  if (stock >= 0 && stock < LOW_STOCK_THRESHOLD) return "Critical";
  return "Normal";
};

export const getColumns = (showExpired = false): ColumnDef<Medicine>[] => [
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
    accessorFn: (row) => `${row.name} ${row.genericName} ${row.supplier} `,
    id: "name",
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
    cell: ({ row }) => {
      const medicine = row.original;
      //category
      const categoryName = medicine.category?.name || "Unknown";

      //status (mobile)
      const status = row.getValue<string>("status");
      const colorStatus =
        status === "Normal"
          ? "bg-emerald-600 text-white"
          : status === "Low Stock"
          ? "bg-yellow-300 text-black"
          : status === "Expired"
          ? "bg-red-600/70 text-white"
          : "bg-red-600/70 text-white";

      return (
        <div className="space-y-2">
          <div className="flex items-center font-medium text-slate-900 gap-2">
            <span>{medicine.name}</span>
            <span
              className={`sm:hidden px-2 py-1 rounded-sm text-xs font-semibold ${colorStatus}`}
            >
              {status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 whitespace-break-spaces">
            <span>{medicine.genericName}</span>
            <span className="">•</span>
            <span>{medicine.supplier}</span>
          </div>
          <div className="sm:hidden text-xs text-muted-foreground">
            {medicine.totalStock} {medicine.unit?.name} • {medicine.price} ฿
          </div>
          <div className="pt-1">
            <Badge
              variant="secondary"
              className={`text-xs text-slate-900 bg-slate-300/50 rounded-sm`}
            >
              {categoryName}
            </Badge>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalStock",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className=""
        >
          Stock
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className=" items-center lowercase  font-medium gap-1">
        <p className="text-slate-900"> {row.getValue("totalStock")}</p>
        <p className="text-slate-600 text-sm"> {row.original.unit?.name}</p>
      </div>
    ),
  },

  {
    accessorKey: "price",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className=""
        >
          Price
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className=" lowercase  font-medium ps-4">
          {row.getValue<number>("price")} ฿
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue<number>(columnId) ?? 0;
      const b = rowB.getValue<number>(columnId) ?? 0;
      return a - b;
    },
  },
  {
    id: "status",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    accessorFn: (row) =>
      showExpired ? "Expired" : getStockStatus(row.totalStock),
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      const colorClass =
        status === "Normal"
          ? "bg-emerald-600 text-white"
          : status === "Low Stock"
          ? "bg-yellow-300 text-black"
          : status === "Expired"
          ? "bg-red-600/70 text-white"
          : "bg-red-600/70 text-white";
      return (
        <span
          className={`px-2 py-1 rounded-sm text-sm font-semibold ${colorClass}`}
        >
          {status}
        </span>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || !filterValue.length) return true;
      const value = row.getValue<string>(columnId);
      return filterValue.includes(value);
    },
  },
  {
    accessorKey: "nearestExpired",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nerest Expired
          <ArrowUpDown />
        </Button>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue<string | undefined>(columnId);
      const b = rowB.getValue<string | undefined>(columnId);

      // ถ้าไม่มีค่า ให้ไปอยู่ท้าย
      if (!a && !b) return 0;
      if (!a) return 1; // a ไม่มี → หลัง b
      if (!b) return -1; // b ไม่มี → หลัง a

      // ปกติเทียบวันที่
      return new Date(a).getTime() - new Date(b).getTime();
    },
    cell: ({ row }) => {
      const expiryDate = row.getValue<string | undefined>("nearestExpired");
      if (!expiryDate) {
        return <div className="lowercase ps-4">—</div>;
      }

      const date = new Date(expiryDate);
      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();

      return <div className=" ps-4">{`${day} ${month} ${year}`}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const medicine = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() =>
                useInventoryUI.getState().openViewBatches({
                  medicine: row.original,
                  batches: row.original.batches,
                })
              }
            >
              View Batches
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                useInventoryUI.getState().openEditMedicine({ medicine });
              }}
            >
              Edit Medicine
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem
              onClick={() =>
                useInventoryUI.getState().openDeleteMedicine(medicine.id)
              }
            >
              Delete Medicine
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const columns = getColumns();
