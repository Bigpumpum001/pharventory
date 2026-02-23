"use client";
import { useMemo, useState } from "react";
import useCompleteDispense from "@/hooks/useCompleteDispense";
import {
  Plus,
  Minus,
  Trash2,
  User,
  ClipboardList,
  Printer,
  CheckCircle2,
  Receipt,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useMedicines from "@/hooks/useMedicines";
import { useDispenseStore } from "@/store/useDispenseStore";
import { Medicine } from "@/types/medicines";
import { DataTable } from "../../components/features/dispense/table/data-table";
import { getColumns } from "../../components/features/dispense/table/columns";
import { Command, CommandInput } from "@/components/ui/command";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
// Local view of receipt with relational fields returned by backend
type CompletedReceiptView = {
  id: number;
  patientName?: string | null;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    price?: number;
    medicineBatch?: {
      batchNumber?: string;
      name?: string;
      medicine?: { name?: string };
    };
  }>;
};

interface DispenseCardProps {
  title: string;
  value: string | number;
  titleColor: string;
  valueColor: string;
}

const DispenseCard: React.FC<DispenseCardProps> = ({
  title,
  value,
  valueColor,
  titleColor,
}) => {
  return (
    <Card className="rounded-lg border-3 border-slate-900 bg-slate-900/50">
      <CardContent className="">
        <CardTitle className={`text-slate-300 sm:text-lg ${titleColor} `}>
          {title}
        </CardTitle>
        <p className={`mt-1 font-semibold sm:text-3xl ${valueColor} `}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
};

const Dispense = () => {
  const { medicinesQuery } = useMedicines(false);
  const data = medicinesQuery.data ?? [];
  const [search, setSearch] = useState("");

  const [patient, setPatient] = useState({
    name: "",
  });
  const [completedReceipt, setCompletedReceipt] =
    useState<CompletedReceiptView | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const { selectedItems, addItem, updateQuantity, removeItem, resetItems } =
    useDispenseStore();

  const totals = useMemo(() => {
    const totalItems = selectedItems.length;
    const totalQuantity = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const estimated = selectedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    return { totalItems, totalQuantity, estimated };
  }, [selectedItems]);

  const handleAddMedicine = (medicine: Medicine) => {
    addItem({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      unitId: medicine.unitId,
      unitName: medicine.unit?.name,
      price: medicine.price,
      totalStock: medicine.totalStock,
      imageUrl: medicine.imageUrl,
    });
    setSearch("");
  };

  const columns = getColumns(handleAddMedicine);

  // Filter medicines to show only those with non-expired stock > 0
  const filteredData = data.filter((medicine) => {
    // Check if medicine has non-expired batches with stock
    const now = new Date();
    const nonExpiredBatches =
      medicine.batches?.filter((batch) => new Date(batch.expiryDate) >= now) ||
      [];

    const nonExpiredStock = nonExpiredBatches.reduce(
      (sum, batch) => sum + batch.quantity,
      0,
    );

    return nonExpiredStock > 0;
  });

  const dispenseMutation = useCompleteDispense();

  const handleCompleteDispense = async () => {
    if (!selectedItems.length) return;

    const payload = {
      patientName: patient.name || "Walk-in Customer",
      items: selectedItems.map((it) => ({
        medicineId: it.id,
        quantity: it.quantity,
      })),
    };

    dispenseMutation.mutate(payload, {
      onSuccess(data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setCompletedReceipt(data);
        setShowReceiptModal(true);
        resetItems();
        // Refetch medicines to update stock quantities
        medicinesQuery.refetch();
        toast.success("Dispense completed", {
          style: {
            background: "#009966",
            color: "white",
            border: "1px solid #009966",
            fontSize: "15px",
          },
        });
      },
      onError(err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        toast.error("Unable to complete dispense." + msg, {
          style: {
            background: "#e74753",
            color: "white",
            border: "1px solid #e74753",
            fontSize: "15px",
          },
        });
      },
    });
  };

  const generateReceiptHTML = () => {
    if (!completedReceipt) return "";
    const rows = (completedReceipt.items || [])
      .map(
        (it) => `
      <tr>
        <td>${
          it.medicineBatch?.medicine?.name ?? it.medicineBatch?.name ?? ""
        }</td>
        <td>${it.medicineBatch?.batchNumber ?? ""}</td>
        <td align="right">${it.quantity}</td>
        <td align="right">฿${Number(it.price).toFixed(2)}</td>
        <td align="right">฿${(Number(it.price) * it.quantity).toFixed(2)}</td>
      </tr>`,
      )
      .join("");

    const total = completedReceipt.items.reduce(
      (s, it) => s + Number(it.price) * it.quantity,
      0,
    );

    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt ${completedReceipt.id}</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}</style>
      </head>
      <body>
        <h2>Receipt #${completedReceipt.id}</h2>
        <div>Patient: ${
          completedReceipt.patientName ?? "Walk-in Customer"
        }</div>
        <div>Date: ${new Date(
          completedReceipt.createdAt,
        ).toLocaleString()}</div>
        <hr/>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th align="left">Medicine</th><th>Batch</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <hr/>
        <div style="text-align:right;font-weight:bold">Total: ฿${total.toFixed(
          2,
        )}</div>
      </body>
      </html>
    `;
    return html;
  };

  const printReceipt = () => {
    if (!completedReceipt) return;
    const html = generateReceiptHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="p-8">
      <div className="space-y-4 px-2 sm:space-y-6 sm:px-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DispenseCard
            title="Selected Medicines"
            value={totals.totalItems}
            titleColor="text-slate-300"
            valueColor="text-white"
          />
          <DispenseCard
            title="Total Quantity"
            value={totals.totalQuantity}
            titleColor="text-slate-300"
            valueColor="text-white"
          />
          <DispenseCard
            title="Estimated Cost"
            value={`฿${totals.estimated.toFixed(2)}`}
            titleColor="text-slate-300"
            valueColor="text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-iceblue space-y-4 rounded-lg p-6">
              {/* <div className="flex items-center px-3 gap-2 ">
              <Box className="w-5 h-5 text-slate-100" />
              <div className="">
                <p className="text-sm font-semibold text-slate-100">
                  Medicines Inventory
                </p>
                <p className="text-xs text-slate-600 ">
                  Search inventory by name or generic name
                </p>
              </div>
            </div> */}
              <div className="space-y-3">
                <Command className="w-full border border-slate-400 bg-slate-100">
                  <CommandInput
                    className="text-slate-900 placeholder:text-slate-500"
                    placeholder="Search medicines by name or generic name..."
                    value={search}
                    onValueChange={(value: string) => setSearch(value)}
                  />
                </Command>
                <DataTable
                  columns={columns}
                  data={filteredData}
                  globalFilter={search}
                  onGlobalFilterChange={setSearch}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border-2 border-slate-600/70">
              <div className="border-b-2 border-slate-700 bg-slate-800 p-3 px-4 sm:p-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="font-semibold text-slate-100" />
                    <p className="text-xs font-medium text-slate-100 sm:text-base">
                      Prescription Items
                    </p>
                  </div>
                  {selectedItems.length ? (
                    <Badge variant="default" className="w-fit border-slate-400">
                      {totals.totalQuantity} units total
                    </Badge>
                  ) : null}
                  <div className="flex items-center gap-3 sm:mt-0">
                    <Button
                      variant="secondary"
                      onClick={printReceipt}
                      disabled={!completedReceipt}
                      className="border-3 border-slate-100/20 text-xs hover:bg-slate-300 sm:text-sm"
                      size="sm"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      <span className="">Print</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4 bg-white px-6 py-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-start gap-3">
                    <User className="h-7 w-7 text-slate-900" />

                    <Input
                      className="h-8 w-full rounded-sm border border-slate-400 bg-slate-100 placeholder:text-slate-500"
                      placeholder="Patient name (Optional)"
                      value={patient.name}
                      onChange={(event) =>
                        setPatient((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-iceblue max-h-[480px] space-y-4 overflow-y-auto px-6 pt-2 pb-4">
                {!selectedItems.length && (
                  <div className="py-16 text-center text-slate-500">
                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-900" />
                    <p className="font-medium text-slate-900">
                      No medicines added yet
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Use the search above to add medicines from inventory.
                    </p>
                  </div>
                )}

                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-2 rounded-lg border-2 border-blue-300/40 bg-white/90 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const imageUrl = item.imageUrl || "";
                          const gcsUrl = imageUrl.startsWith("/images/medicine")
                            ? `https://storage.googleapis.com/pharventory-bucket${imageUrl}`
                            : imageUrl;

                          return gcsUrl ? (
                            <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                              <Image
                                src={gcsUrl}
                                alt={item.name}
                                fill
                                className="rounded-md object-contain"
                                sizes="(max-width: 640px) 48px, 64px"
                                onError={(e) => {
                                  e.currentTarget.src = "/images/logo/logo.png";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 sm:h-16 sm:w-16">
                              <Package className="h-5 w-5 text-slate-400" />
                            </div>
                          );
                        })()}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {item.genericName} • ฿{item.price} / {item.unitName}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-rose-600/70 hover:text-rose-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-row items-center gap-2 sm:gap-3">
                        <label className="text-xs font-medium text-slate-600">
                          Quantity
                        </label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-8 w-8 bg-slate-300/70"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(event) => {
                              const raw = Number(event.target.value) || 1;
                              const max = item.totalStock ?? Infinity;
                              const q = Math.max(1, Math.min(raw, max));
                              updateQuantity(item.id, q);
                            }}
                            className="h-8 w-16 border border-slate-300/20 bg-slate-200/80 text-center text-slate-900 sm:w-20"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.min(
                                  item.totalStock ?? Infinity,
                                  item.quantity + 1,
                                ),
                              )
                            }
                            className="h-8 w-8 bg-slate-300/80"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs font-medium text-slate-600">
                          / {item.unitName}
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-sm">
                        <p className="text-xs text-slate-900 sm:text-sm">
                          ฿{item.price} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-slate-600 sm:text-base">
                          ฿{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedItems.length > 0 && (
                <div className="border-t border-slate-800 bg-slate-900/200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
                        Estimate
                      </p>
                      <p className="text-2xl font-semibold text-slate-100">
                        ฿{totals.estimated.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={resetItems}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        className="hover:bg-slate-800"
                        onClick={handleCompleteDispense}
                        disabled={!selectedItems.length}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Dispense
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Receipt modal */}
        <Dialog
          open={showReceiptModal}
          onOpenChange={(open) => setShowReceiptModal(open)}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Receipt #{completedReceipt?.id}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Patient: {completedReceipt?.patientName ?? "Walk-in Customer"} •
                Date:{" "}
                {completedReceipt
                  ? new Date(completedReceipt.createdAt).toLocaleString()
                  : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-slate-500">
                      <th className="pb-2">Medicine</th>
                      <th className="pb-2">Batch</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(completedReceipt?.items ?? []).map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="py-2 pr-2">
                          {it.medicineBatch?.medicine?.name ??
                            it.medicineBatch?.name}
                        </td>
                        <td className="py-2 pr-2">
                          {it.medicineBatch?.batchNumber}
                        </td>
                        <td className="py-2 pr-2 text-right">{it.quantity}</td>
                        <td className="py-2 pr-2 text-right">
                          ฿{Number(it.price).toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          ฿{(Number(it.price) * it.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
              <div className="order-2 w-full sm:order-1 sm:w-auto" />
              <div className="order-1 flex w-full gap-2 sm:order-2 sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 sm:flex-none"
                >
                  Close
                </Button>
                <Button
                  onClick={printReceipt}
                  variant="default"
                  className="flex-1 sm:flex-none"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Print / Download PDF</span>
                  <span className="sm:hidden">Print</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dispense;
