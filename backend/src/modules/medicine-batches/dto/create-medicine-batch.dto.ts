import { IsDateString, IsNumber, IsString } from '@nestjs/class-validator';

export class CreateMedicineBatchDto {
  @IsString()
  batchNumber: string;
  @IsNumber()
  quantity: number;
  @IsDateString()
  expiryDate: Date;
  @IsNumber()
  medicineId: number;
}
