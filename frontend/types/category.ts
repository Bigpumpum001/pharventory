export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateCategoryPayload = Omit<
  Category,
  "id" | "createdAt" | "updatedAt" | "isActive"
>;

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
