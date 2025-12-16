import { MedicineBatch } from "./medicines";

export interface ReceiptItem {
  id: number;
  medicineBatch: MedicineBatch[];
  quantity: number;
  price: string;
  createdAt: string;

}

export interface Receipt {
  id: number;
  userName: string | null;
  patientName: string | null;
  totalItems: number;
  note: string | null;
  createdAt: string;
  items: ReceiptItem[];
}
