import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@nestjs/class-validator';
import { CreateMedicineBatchDto } from 'src/modules/medicine-batches/dto/create-medicine-batch.dto';
import { Type } from '@nestjs/class-transformer';
export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: number;

  @IsNotEmpty({ message: 'Unit ID is required' })
  @IsNumber()
  unitId: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateMedicineBatchDto)
  batches?: CreateMedicineBatchDto[];
  // batches: {
  //   batch_number: string;
  //   quantity: number;
  //   expiry_date: Date;
  // }[];
}
