import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';

export class UpdateMedicineBatchDto {
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}
