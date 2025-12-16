import { IsInt, IsNotEmpty, IsString, Min } from '@nestjs/class-validator';

export class DispenseDto {
  @IsInt()
  medicineId: number;
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
