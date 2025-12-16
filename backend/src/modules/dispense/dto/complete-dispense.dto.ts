import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class DispenseItemDto {
  @IsInt()
  medicineId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CompleteDispenseDto {
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenseItemDto)
  items: DispenseItemDto[];
}
