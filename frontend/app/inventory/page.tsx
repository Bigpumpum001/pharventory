"use client";
import React, { useState, useEffect } from "react";
import useMedicines from "@/hooks/useMedicines";
import { useInventoryUI } from "@/store/useInventoryUI";
import { getColumns } from "../../components/features/inventory/table/columns";
import { DataTable } from "../../components/features/inventory/table/data-table";
import { Command, CommandInput } from "@/components/ui/command";
import {
  ChevronDown,
  Plus,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Pill,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AddMedicineModal from "../../components/features/inventory/modal/medicine/add-medicine-modal";
import ViewBatchesModal from "../../components/features/inventory/modal/batches/view-batches-modal";
import EditMedicineModal from "../../components/features/inventory/modal/medicine/edit-medicine-modal";
// import DeleteMedicineModal from "./modal/medicine/delete-medicine-modal";
import AddCategoryUnitModal from "../../components/features/inventory/modal/category/add-category-unit-modal";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";

function Inventory() {
  const [showExpired, setShowExpired] = useState(false);
  const { medicinesQuery } = useMedicines(showExpired);
  const { shouldRefetchMedicines, resetRefetchMedicinesTrigger } =
    useInventoryUI();
  const data = medicinesQuery.data ?? [];
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const status = showExpired
    ? ["Expired"]
    : ["Normal", "Low Stock", "Critical", "Out Of Stock"];
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const totalStock = data.reduce((sum, med) => sum + med.totalStock, 0);

  // Listen for refetch trigger from batch edit modal
  useEffect(() => {
    if (shouldRefetchMedicines) {
      medicinesQuery.refetch();
      resetRefetchMedicinesTrigger();
    }
  }, [shouldRefetchMedicines, medicinesQuery, resetRefetchMedicinesTrigger]);

  // Calculate actual counts for status cards
  const lowStockCount = data.filter(
    (med) => med.totalStock >= 25 && med.totalStock < 100,
  ).length;
  const criticalStockCount = data.filter(
    (med) => med.totalStock >= 1 && med.totalStock < 25,
  ).length;
  const outOfStockCount = data.filter((med) => med.totalStock === 0).length;
  return (
    <div className="p-8">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="rounded-lg border-3 border-slate-900 bg-slate-800 transition-colors">
          <CardContent className="mb-0 flex items-center justify-between gap-2">
            <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
              {showExpired ? (
                <Image
                  src={"/images/logo/expired_batches.jpg"}
                  alt={"expired_batches image"}
                  fill
                  className="rounded-full object-contain"
                  sizes="(max-width: 640px) 48px, 64px"
                  onError={(e) => {
                    e.currentTarget.src = "/images/logo/logo.png";
                  }}
                />
              ) : (
                <Image
                  src={"/images/logo/logo_med_only.jpg"}
                  alt={"logo_med_only image"}
                  fill
                  className="rounded-full object-contain"
                  sizes="(max-width: 640px) 48px, 64px"
                  onError={(e) => {
                    e.currentTarget.src = "/images/logo/logo.png";
                  }}
                />
              )}
            </div>
            {/* <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center `}
            >
              {showExpired ? (
                <XCircle className="w-12 h-12 text-rose-700" />
              ) : (
                <Pill className="w-12 h-12 text-sky-600" />
              )}
            </div> */}
            <div className="text-center">
              <CardTitle className="mb-1 text-slate-300 sm:text-lg">
                {showExpired ? "Expired Items" : "Total Items"}
              </CardTitle>
              <CardTitle className="text-center font-bold text-white sm:text-3xl">
                {totalStock}
              </CardTitle>
            </div>
            {/* <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              +12% from ?? yesterday
            </span> */}
          </CardContent>
        </Card>
        {!showExpired && (
          <>
            <Card className="rounded-lg border-3 border-slate-900 bg-slate-900/50 transition-colors">
              <CardContent className="flex items-center justify-between gap-2">
                {/* <div className="w-12 h-12  rounded-lg flex items-center justify-center ">
                  <AlertTriangle className="w-12 h-12 text-rose-600" />
                </div> */}
                <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                  <Image
                    src={"/images/logo/critical_stock.jpg"}
                    alt={"critical_stock image"}
                    fill
                    className="rounded-full object-contain"
                    sizes="(max-width: 640px) 48px, 64px"
                    onError={(e) => {
                      e.currentTarget.src = "/images/logo/logo.png";
                    }}
                  />
                </div>
                <div className="text-center">
                  <CardTitle className="mb-1 text-slate-300 sm:text-lg">
                    Critical Stock
                  </CardTitle>
                  <CardTitle className="text-center font-bold text-white sm:text-3xl">
                    {criticalStockCount}
                  </CardTitle>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-lg border-3 border-slate-900 bg-slate-900/50 transition-colors">
              <CardContent className="flex items-center justify-between gap-2">
                {/* <div className="w-12 h-12  rounded-lg flex items-center justify-center ">
                  <AlertCircle className="w-12 h-12 text-amber-600" />
                </div> */}
                <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                  <Image
                    src={"/images/logo/low_stock.jpg"}
                    alt={"low_stock image"}
                    fill
                    className="rounded-full object-contain"
                    sizes="(max-width: 640px) 48px, 64px"
                    onError={(e) => {
                      e.currentTarget.src = "/images/logo/logo.png";
                    }}
                  />
                </div>
                <div className="text-center">
                  <CardTitle className="mb-1 text-slate-300 sm:text-lg">
                    Low Stock
                  </CardTitle>
                  <CardTitle className="text-center font-bold text-white sm:text-3xl">
                    {lowStockCount}
                  </CardTitle>
                </div>
              </CardContent>
            </Card>
            {/* Out Of stock */}
            <Card className="rounded-lg border-3 border-slate-900 bg-slate-900/50 transition-colors">
              <CardContent className="flex items-center justify-between gap-2">
                {/* <div className="w-12 h-12  rounded-lg flex items-center justify-center ">
                  <AlertTriangle className="w-12 h-12 text-rose-600" />
                </div> */}
                <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                  <Image
                    src={"/images/logo/out_of_stock.jpg"}
                    alt={"out_of_stock image"}
                    fill
                    className="rounded-full object-contain"
                    sizes="(max-width: 640px) 48px, 64px"
                    onError={(e) => {
                      e.currentTarget.src = "/images/logo/logo.png";
                    }}
                  />
                </div>
                <div className="text-center">
                  <CardTitle className="mb-1 text-slate-300 sm:text-lg">
                    Out Of Stock
                  </CardTitle>
                  <CardTitle className="text-center font-bold text-white sm:text-3xl">
                    {outOfStockCount}
                  </CardTitle>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <div className="grid gap-3 rounded-t-lg border-3 border-b-0 border-slate-800/80 bg-slate-900/50 p-4 lg:flex">
        <Command className="w-4/4 border border-b-0 bg-slate-200 lg:w-3/4">
          <CommandInput
            className="text-slate-900 placeholder:text-slate-500"
            placeholder="Search medicines..."
            value={search}
            onValueChange={(value: string) => setSearch(value)}
          />
        </Command>
        <div className="grid grid-cols-2 gap-3 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="border-2 border-slate-900 hover:bg-slate-600"
              >
                {selectedStatus.length
                  ? selectedStatus.join(", ")
                  : "All Status"}{" "}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => setSelectedStatus([])}
                  className="font-medium text-slate-600"
                >
                  Clear Filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {status.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onSelect={() => {
                      setSelectedStatus((prev) =>
                        prev.includes(status)
                          ? prev.filter((s) => s !== status)
                          : [...prev, status],
                      );
                    }}
                  >
                    {status}{" "}
                    {selectedStatus.includes(status) ? "(selected)" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={showExpired ? "destructive" : "default"}
            onClick={() => setShowExpired((prev) => !prev)}
            className={
              showExpired
                ? "border-red-600 bg-red-600/70 text-white hover:bg-red-700/70"
                : "border-2 border-amber-700/50 bg-amber-600/80 hover:bg-amber-700"
            }
          >
            {showExpired ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            {showExpired ? "Hide Expired" : "Show Expired"}
          </Button>
          <AddCategoryUnitModal />
          <Button
            variant={"default"}
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-emerald-900 bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Plus />
            Add medicine
          </Button>
        </div>
      </div>

      <div className="w-full">
        <DataTable
          columns={getColumns(showExpired)}
          data={data}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          statusFilter={selectedStatus}
          showExpired={showExpired}
        />
      </div>

      <AddMedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          medicinesQuery.refetch();
          setIsModalOpen(false);
        }}
      />

      <ViewBatchesModal showExpired={showExpired} />
      <EditMedicineModal
        onSuccess={() => {
          medicinesQuery.refetch();
        }}
      />
      {/* <DeleteMedicineModal
        onSuccess={() => {
          medicinesQuery.refetch();
        }}
      /> */}
    </div>
  );
}

export default Inventory;
