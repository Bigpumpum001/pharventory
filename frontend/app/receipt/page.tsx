"use client";

import { useMemo, useState, useEffect } from "react";
import useReceipts from "@/hooks/useReceipts";
import { useReceiptStore, ReceiptRange } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReceiptModal } from "../../components/features/receipt/receipt-modal";

type ReceiptItemType = {
  id: number;
  quantity: number;
  price?: number;
  medicineBatch?: {
    batchNumber?: string;
    name?: string;
    medicine?: { name?: string };
  };
};

type ReceiptTypeLocal = {
  id: number;
  patientName?: string | null;
  createdAt: string;
  items: ReceiptItemType[];
};
import { Calendar } from "lucide-react";
import type { Receipt } from "@/types/receipts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const dateFilters: { label: string; value: ReceiptRange }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
];

const EMPTY_RECEIPTS: Receipt[] = [];

const withinRange = (date: string, filter: string) => {
  if (filter === "all") return true;
  const created = new Date(date).getTime();
  const now = Date.now();

  if (filter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return created >= today.getTime();
  }

  if (filter === "7days") {
    return created >= now - 7 * 24 * 60 * 60 * 1000;
  }

  if (filter === "30days") {
    return created >= now - 30 * 24 * 60 * 60 * 1000;
  }

  return true;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};
interface ReceiptCardProps {
  title: string;
  value: string | number;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ title, value }) => {
  return (
    <Card className="rounded-lg border-3 border-slate-900 bg-slate-800">
      <CardContent className="">
        <CardTitle className="mb-1 text-slate-300 sm:text-lg">
          {title}
        </CardTitle>
        <p className={`font-semibold text-white sm:text-3xl`}>{value}</p>
      </CardContent>
    </Card>
  );
};

function Receipt() {
  const { receiptsQuery, findReceiptById } = useReceipts();
  const { search, setSearch, range, setRange } = useReceiptStore();

  const dataset = receiptsQuery.data ?? EMPTY_RECEIPTS;
  const receiptsError = receiptsQuery.error as Error | null;
  const [selectedReceipt, setSelectedReceipt] =
    useState<ReceiptTypeLocal | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10); // 10 items per page

  // Generate HTML for receipt (for print/download)
  const generateReceiptHTML = () => {
    if (!selectedReceipt) return "";
    const rows = (selectedReceipt.items || [])
      .map(
        (it) => `
      <tr>
        <td>${
          it.medicineBatch?.medicine?.name ?? it.medicineBatch?.name ?? ""
        }</td>
        <td>${it.medicineBatch?.batchNumber ?? ""}</td>
        <td align="right">${it.quantity}</td>
        <td align="right">฿${Number(it.price ?? 0).toFixed(2)}</td>
        <td align="right">฿${(Number(it.price ?? 0) * it.quantity || 0).toFixed(
          2,
        )}</td>
      </tr>`,
      )
      .join("");

    const total = (selectedReceipt.items || []).reduce(
      (s: number, it: ReceiptItemType) =>
        s + Number(it.price ?? 0) * it.quantity,
      0,
    );

    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt ${selectedReceipt.id}</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}</style>
      </head>
      <body>
        <h2>Receipt #${selectedReceipt.id}</h2>
        <div>Patient: ${selectedReceipt.patientName ?? "Unknown"}</div>
        <div>Date: ${formatDate(selectedReceipt.createdAt)}</div>
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

  // Normalize API Receipt -> local view with numeric prices
  const normalizeReceipt = (r: Receipt): ReceiptTypeLocal => {
    return {
      id: r.id,
      patientName: r.patientName ?? null,
      createdAt: r.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (r.items || []).map((it: any) => {
        // handle medicineBatch being object or array depending on API/types
        const mb = Array.isArray(it.medicineBatch)
          ? it.medicineBatch[0]
          : it.medicineBatch;

        return {
          id: it.id,
          quantity: it.quantity,
          price: typeof it.price === "string" ? Number(it.price) : it.price,
          medicineBatch: {
            batchNumber: mb?.batchNumber,
            name: mb?.name ?? mb?.medicine?.name,
            medicine: mb?.medicine ? { name: mb.medicine.name } : undefined,
          },
        } as ReceiptItemType;
      }),
    };
  };

  // Print receipt (open in new tab and auto print)
  const printReceipt = () => {
    if (!selectedReceipt) return;
    const html = generateReceiptHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const filteredReceipts = useMemo(() => {
    return dataset.filter((receipt) => {
      const matchesSearch =
        receipt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        String(receipt.id).includes(search);
      return matchesSearch && withinRange(receipt.createdAt, range);
    });
  }, [dataset, search, range]);

  // Calculate pagination
  const pageCount = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);
  const paginatedReceipts = filteredReceipts.slice(
    currentPageIndex * pageSize,
    currentPageIndex * pageSize + pageSize,
  );

  // Reset page index when filtered results change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pageIndex !== 0) {
        setPageIndex(0);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [search, range, pageIndex]);

  const summary = useMemo(() => {
    const totalItems = dataset.reduce(
      (sum, receipt) => sum + receipt.totalItems,
      0,
    );
    const uniquePatients = new Set(
      dataset.map((receipt) => receipt.patientName || receipt.id),
    ).size;

    // Calculate today's receipts separately
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReceipts = dataset.filter((receipt) => {
      return new Date(receipt.createdAt).getTime() >= today.getTime();
    });

    return {
      totalReceipts: dataset.length,
      totalItems,
      avgItems: dataset.length ? Math.round(totalItems / dataset.length) : 0,
      uniquePatients,
      todayReceiptsCount: todayReceipts.length,
    };
  }, [dataset]);

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ReceiptCard
            title="Today's Receipts"
            value={summary.todayReceiptsCount}
          />
          <ReceiptCard title="Total Receipts" value={summary.totalReceipts} />
          <ReceiptCard title="Units Dispensed" value={summary.totalItems} />
          <ReceiptCard title="Unique Patients" value={summary.uniquePatients} />
        </div>

        <div className="space-y-4 rounded-lg border-3 border-slate-800 bg-slate-800 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1">
              <Input
                placeholder="Search by receipt ID or patient name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="placeholder:text-muted-foreground border-slate-600 bg-slate-200"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {dateFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={range === filter.value ? "default" : "outline"}
                  className={
                    range === filter.value ? "bg-slate-700 text-white" : ""
                  }
                  onClick={() => setRange(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div
        // className="grid grid-cols-3 gap-6"
        >
          <div className="col-span-2 rounded-sm border border-slate-900/20 bg-slate-900/20">
            <div className="flex items-center justify-between rounded-t-sm bg-slate-100 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Receipt History
                </p>
                <p className="text-xs text-slate-600">
                  Showing {paginatedReceipts.length} of{" "}
                  {filteredReceipts.length} records
                </p>
              </div>
            </div>

            <div className="bg-iceblue">
              {paginatedReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="grid grid-cols-4 items-center gap-4 border border-slate-300 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Receipt #{receipt.id.toString()}
                    </p>
                    <p className="text-xs text-slate-600">
                      {formatDate(receipt.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Patient :
                      <span className="text-slate-900">
                        {" "}
                        {receipt.patientName || "Walk-in patient"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Dispense By {receipt.userName ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-900">
                      {receipt.totalItems} unit{receipt.totalItems !== 1 && "s"}
                    </p>
                    <p className="text-xs text-slate-600">
                      {receipt.items?.length || 0} batch references
                    </p>
                  </div>

                  <div className="flex gap-2 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-fit border-2 border-slate-300 bg-slate-100 p-2 text-center text-xs whitespace-normal sm:text-sm"
                      onClick={async () => {
                        const data = await findReceiptById(receipt.id);
                        if (!data) return alert("Unable to fetch receipt");
                        setSelectedReceipt(normalizeReceipt(data));
                        setShowReceiptModal(true);
                      }}
                    >
                      View Receipt
                    </Button>
                  </div>
                </div>
              ))}

              {!paginatedReceipts.length && (
                <div className="px-6 py-12 text-center text-slate-500">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p>No receipts for the selected range.</p>
                </div>
              )}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-center gap-2 bg-slate-900/20 px-6 py-4">
              <Button
                onClick={() => setPageIndex(0)}
                disabled={currentPageIndex <= 0}
                variant={"default"}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </Button>
              <Button
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={currentPageIndex <= 0}
                variant={"default"}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>

              <div className="px-4 text-sm font-medium text-slate-100">
                Page {currentPageIndex + 1} of {pageCount}
              </div>

              <Button
                onClick={() =>
                  setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                }
                disabled={currentPageIndex >= pageCount - 1}
                variant={"default"}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
              <Button
                variant={"default"}
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={currentPageIndex >= pageCount - 1}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {receiptsError && (
          <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
            {receiptsError.message ?? "Unable to load receipts"}
          </div>
        )}

        {/* Receipt modal */}
        <ReceiptModal
          open={showReceiptModal}
          onOpenChange={setShowReceiptModal}
          selectedReceipt={selectedReceipt}
          onPrintReceipt={printReceipt}
        />
      </div>
    </div>
  );
}

export default Receipt;
