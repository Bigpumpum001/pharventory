import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicineDto } from './create-medicine.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { Category } from 'src/modules/category/entities/category.entity';

export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  unitId?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
export class updateMedicinePayload {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  unit?: Unit;

  @IsOptional()
  category?: Category;
}
