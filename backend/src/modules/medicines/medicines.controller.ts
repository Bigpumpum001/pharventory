import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('/api/medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get()
  findAll(@Query('expired') expired: string) {
    const showExpired = expired === 'true';
    return this.medicinesService.findAllWithSummary(showExpired);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicinesService.getMedicineByID(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createMedicineDto: CreateMedicineDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.medicinesService.createMedicine(
      createMedicineDto,
      req.user.sub,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    return this.medicinesService.updateMedicine(+id, updateMedicineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicinesService.removeMedicine(+id);
  }
}
