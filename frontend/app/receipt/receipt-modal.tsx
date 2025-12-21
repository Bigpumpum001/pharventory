"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReceipt: ReceiptTypeLocal | null;
  onPrintReceipt: () => void;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  open,
  onOpenChange,
  selectedReceipt,
  onPrintReceipt,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt #{selectedReceipt?.id}</DialogTitle>
          <DialogDescription>
            Patient: {selectedReceipt?.patientName ?? "Unknown"} • Date:{" "}
            {selectedReceipt ? formatDate(selectedReceipt.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 ">
          {/* Mobile-responsive table */}
          <div className="overflow-x-auto">
            <Table className="w-full text-sm ">
              <TableHeader>
                <TableRow className="text-left text-xs text-slate-500">
                  <TableHead className="text-slate-500">Medicine</TableHead>
                  <TableHead className="text-slate-500">Batch</TableHead>
                  <TableHead className="text-right text-slate-500">Qty</TableHead>
                  <TableHead className="text-right text-slate-500">Price</TableHead>
                  <TableHead className="text-right text-slate-500">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedReceipt?.items ?? []).map((it) => (
                  <TableRow key={it.id} className="border-t">
                    <TableCell className="py-2">
                      {it.medicineBatch?.medicine?.name ??
                        it.medicineBatch?.name}
                    </TableCell>
                    <TableCell className="py-2">
                      {it.medicineBatch?.batchNumber}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      {it.quantity}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      ฿{Number(it.price ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      ฿{(Number(it.price ?? 0) * it.quantity || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          
        </div>

        <DialogFooter>
          <div className="flex flex-col sm:flex-row items-center justify-end w-full gap-3 ">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Close
              </Button>
              <Button
                variant="default"
                onClick={onPrintReceipt}
                disabled={!selectedReceipt}
                className="flex-1 sm:flex-none"
              >
                Print / Download PDF
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
