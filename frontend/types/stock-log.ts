export interface StockLog {
  id: number;
  medicineBatch: {
    name: string;
    batchNumber: string;
    imageUrl?: string | null;
  };
  action: "IN" | "OUT" | "ADJUST" | string;
  quantityChange: number;
  note: string | null;
  createdBy?: string | null;
  createdAt: string;
}
