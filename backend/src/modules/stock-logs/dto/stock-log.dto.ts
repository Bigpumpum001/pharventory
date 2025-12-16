export class StockLogDto {
  id: number;
  action: string;
  quantityChange: number;
  note?: string;
  createdAt: Date;
  medicineBatch: {
    name: string;
    batchNumber: string;
    imageUrl?: string;
  };
  createdBy: string;
}
