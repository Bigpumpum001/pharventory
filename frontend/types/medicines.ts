export interface MedicineBatch {
  id: number;
  medicineName: string;
  medicineId: number;
  medicine: Medicine[];
  batchNumber: string;
  quantity: number;
  expiryDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: number;
  name: string;
  genericName: string;
  categoryId: number | null;
  category?: { id: number; name: string };
  unitId?: number;
  unit?: { id: number; name: string };
  price: number;
  supplier: string;
  imageUrl?: string;
  totalStock: number; // be calculate -> fe
  nearestExpired: string | null; // be calculate -> fe
  isActive: boolean;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  batches?: MedicineBatch[];
}

export interface CreateMedicinePayload {
  name: string;
  genericName: string;
  categoryId: number | null;
  unitId?: number | null;
  price: number;
  supplier: string;
  imageUrl?: string;
  batches?: CreateMedicineBatchPayload[];
}

export interface CreateMedicineBatchPayload {
  batchNumber: string;
  quantity: number;
  expiryDate: string; // ISO date string
}

export interface UpdateMedicineBatchPayload {
  batchNumber?: string;
  quantity?: number;
  expiryDate?: string; // ISO date string
}

export type UpdateMedicinePayload = Partial<CreateMedicinePayload>;

// New types for enhanced batch operations
export interface AddBatchToMedicinePayload {
  medicineId: number;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

export interface AddQuantityToBatchPayload {
  batchId: number;
  quantity: number;
  note?: string;
}

//ExcelSoon
export interface ExcelRowData {
  name: string;
  generic_name?: string;
  categoryId: number;
  unitId?: number;
  price?: number;
  supplier?: string;
  imageUrl?: string;
  batch_number?: string;
  quantity?: number;
  expiry_date?: string;
  hasError?: boolean;
  errorMessage?: string;
  validationErrors?: Record<string, string>;
  isExists?: boolean;
  selected?: boolean;
  index?: number;
}

export interface ExcelImportResult {
  created: string[];
  updated: string[];
  errors: Array<{ name: string; error: string }>;
}

export interface ExcelParseResult {
  cacheKey: string;
  data: ExcelRowData[];
  existingNames: Set<string>;
}

export type ImportType = "medicine_batch" | "medicine_only" | "batch_only";

export interface ConfirmImportPayload {
  cacheKey: string;
  importType: ImportType;
  selectedRows: number[];
}
