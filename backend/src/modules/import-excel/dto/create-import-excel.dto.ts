import { IsNotEmpty, IsString, IsEnum, IsArray } from '@nestjs/class-validator';

export enum ImportType {
  MEDICINE_AND_BATCH = 'medicine_batch',
  MEDICINE_ONLY = 'medicine_only',
  BATCH_ONLY = 'batch_only',
}

export class ExcelRowData {
  name: string;
  generic_name?: string;
  categoryId: number;
  unitId: number;
  price?: number;
  supplier?: string;
  batch_number?: string;
  quantity?: number;
  expiry_date?: string;
}

export class CreateImportExcelDto {
  @IsEnum(ImportType)
  @IsNotEmpty()
  importType: ImportType;

  @IsNotEmpty()
  file: any;
}

export class ConfirmImportDto {
  @IsEnum(ImportType)
  @IsNotEmpty()
  importType: ImportType;

  @IsArray()
  @IsNotEmpty()
  selectedRows: number[];

  @IsString()
  @IsNotEmpty()
  cacheKey: string;
}
